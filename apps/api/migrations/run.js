import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Client } = pg;

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/wecover'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Read and execute migration files
    const migrationFiles = ['001_init.sql', '002_optional_term_months.sql', '003_quotes.sql', '004_remove_pdf_storage.sql', '005_remove_unique_constraints.sql'];
    
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const sql = readFileSync(join(__dirname, file), 'utf8');
      await client.query(sql);
      console.log(`✓ Migration ${file} completed`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();

