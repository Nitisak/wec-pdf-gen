import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { htmlTemplate } from '../../apps/api/src/modules/db/schema.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../apps/api/.env') });
// Fallback to env.example if .env doesn't exist
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: join(__dirname, '../../apps/api/env.example') });
}

const { Pool } = pg;

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'http://127.0.0.1:9000',
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin'
  },
  forcePathStyle: true
});

const BUCKET = process.env.S3_BUCKET || 'wecover-pdfs';

async function uploadToS3(key: string, content: string, contentType: string = 'text/html') {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: content,
    ContentType: contentType
  });

  await s3Client.send(command);
  console.log(`✓ Uploaded: ${key}`);
}

async function seedTemplates() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/wecover'
  });

  const db = drizzle(pool, { schema: { htmlTemplate } });

  try {
    await pool.connect();
    console.log('Connected to database');

    const templatesDir = join(__dirname, '../../assets/html-templates');

    // Process terms templates
    const termsDir = join(templatesDir, 'terms');
    if (statSync(termsDir).isDirectory()) {
      const productVersions = readdirSync(termsDir);
      
      for (const productVersion of productVersions) {
        const versionDir = join(termsDir, productVersion);
        if (statSync(versionDir).isDirectory()) {
          const languages = readdirSync(versionDir);
          
          for (const language of languages) {
            if (language.endsWith('.html')) {
              const filePath = join(versionDir, language);
              const content = readFileSync(filePath, 'utf8');
              const lang = language.replace('.html', '');
              
              // Extract version tag from content
              const versionMatch = content.match(/<!-- version: ([^ ]+) -->/);
              const versionTag = versionMatch ? versionMatch[1] : '2025-09';
              
              const s3Key = `templates/terms/${productVersion}/${versionTag}/${lang}.html`;
              
              await uploadToS3(s3Key, content);
              
              await db.insert(htmlTemplate).values({
                kind: 'terms',
                productVersion,
                language: lang,
                versionTag,
                s3Key
              });
              
              console.log(`✓ Inserted terms template: ${productVersion}/${lang}`);
            }
          }
        }
      }
    }

    // Process disclosure templates
    const disclosuresDir = join(templatesDir, 'disclosures');
    if (statSync(disclosuresDir).isDirectory()) {
      const states = readdirSync(disclosuresDir);
      
      for (const stateCode of states) {
        const stateDir = join(disclosuresDir, stateCode);
        if (statSync(stateDir).isDirectory()) {
          const versions = readdirSync(stateDir);
          
          for (const versionTag of versions) {
            const versionDir = join(stateDir, versionTag);
            if (statSync(versionDir).isDirectory()) {
              const languages = readdirSync(versionDir);
              
              for (const language of languages) {
                if (language.endsWith('.html')) {
                  const filePath = join(versionDir, language);
                  const content = readFileSync(filePath, 'utf8');
                  const lang = language.replace('.html', '');
                  
                  const s3Key = `templates/disclosures/${stateCode}/${versionTag}/${lang}.html`;
                  
                  await uploadToS3(s3Key, content);
                  
                  await db.insert(htmlTemplate).values({
                    kind: 'disclosure',
                    stateCode,
                    language: lang,
                    versionTag,
                    s3Key
                  });
                  
                  console.log(`✓ Inserted disclosure template: ${stateCode}/${lang}`);
                }
              }
            }
          }
        }
      }
    }

    console.log('✓ All templates seeded successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedTemplates();
