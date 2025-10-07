# WeCover USA - Policy PDF Assembly System

A comprehensive system for generating vehicle service contract policies by merging AcroForm PDFs with dynamic terms and state-specific disclosures.

## Features

- **Dynamic PDF Assembly**: Merges filled AcroForm, terms, and state disclosures into a single PDF
- **AcroForm Filling**: Uses pdf-lib to fill PDF form fields with customer data
- **HTML to PDF Rendering**: Uses Playwright to convert HTML templates to PDF
- **State-Specific Disclosures**: Automatically includes state-specific disclosure pages
- **Template Management**: Admin interface for managing terms and disclosure templates
- **Preview Mode**: Generate preview PDFs without persisting to database
- **S3 Storage**: Scalable storage for templates and generated PDFs

## Tech Stack

- **Backend**: Node.js + Fastify + TypeScript
- **Frontend**: React + TypeScript + Vite
- **PDF Processing**: pdf-lib + Playwright
- **Database**: PostgreSQL + Drizzle ORM
- **Storage**: S3-compatible (MinIO for dev, AWS S3 for prod)
- **Validation**: Zod schemas

## Quick Start

### Prerequisites

- **Docker**: Docker Engine 20.10+ and Docker Compose 2.0+
- **Make** (optional, for convenience commands)

### Option 1: Docker (Recommended - Full Stack)

Run the entire application stack with Docker:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd wec-pdf-generator
   ```

2. **Upload PDF template to MinIO**:
   ```bash
   # First, start just MinIO to upload the template
   make dev-up
   
   # Go to MinIO Console at http://localhost:9001
   # Login: minioadmin / minioadmin
   # Create bucket 'wecover-pdfs' (or it auto-creates)
   # Upload ContractPSVSCTemplate_HT_v07_Form.pdf to:
   # templates/ContractPSVSCTemplate_HT_v07_Form.pdf
   ```

3. **Build and start all services**:
   ```bash
   make build
   make up
   ```

4. **Run database migrations** (after services are up):
   ```bash
   make migrate
   ```

5. **Seed HTML templates**:
   ```bash
   make seed
   ```

**Access the application**:
- **Web App**: http://localhost
- **API**: http://localhost:5173
- **MinIO Console**: http://localhost:9001

**Useful Docker commands**:
```bash
make logs        # View all logs
make logs-api    # View API logs only
make logs-web    # View web logs only
make ps          # Show running containers
make health      # Check service health
make down        # Stop all services
make clean       # Remove everything (containers, volumes, images)
```

### Option 2: Local Development (Partial Docker)

Run only infrastructure (PostgreSQL + MinIO) in Docker, and run API/Web locally:

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd wec-pdf-generator
   pnpm install
   ```

2. **Start infrastructure services**:
   ```bash
   make dev-up
   ```

3. **Set up environment variables**:
   ```bash
   # Copy API environment file
   cp apps/api/env.example apps/api/.env
   
   # Copy web environment file  
   cp apps/web/env.example apps/web/.env
   ```

4. **Run database migrations**:
   ```bash
   pnpm db:migrate
   ```

5. **Upload PDF template to MinIO**:
   ```bash
   # Upload the AcroForm template to MinIO console at http://localhost:9001
   # Place it at: templates/ContractPSVSCTemplate_HT_v07_Form.pdf
   ```

6. **Seed HTML templates**:
   ```bash
   pnpm seed:templates
   ```

7. **Install Playwright**:
   ```bash
   cd apps/api
   npx playwright install chromium
   ```

8. **Start development servers**:
   ```bash
   pnpm dev
   ```

**Access the application**:
- **API**: http://localhost:5173
- **Web**: http://localhost:3000
- **MinIO Console**: http://localhost:9001

## Project Structure

```
/apps
  /web                     # React app (Vite + TypeScript)
  /api                     # Fastify service
    /src
      /routes
        policies.routes.ts
        templates.routes.ts
      /modules
        /policies
          assembler/merge.ts
          filler/fillAcroForm.ts
          filler/mapping.ts
          renderer/renderHtmlToPdf.ts
          service/policies.service.ts
        /templates
          service/templates.service.ts
        /storage/s3.ts
        /db/index.ts
      /types/index.d.ts
    /migrations            # SQL migrations
/packages
  /shared
    policySchemas.ts       # Zod schemas shared by web+api
  /cli
    seed-templates.ts
/assets
  /html-templates
    /terms/WEC-PS-VSC-09-2025/en-US.html
    /disclosures/FL/2025-09/en-US.html
    /disclosures/TX/2025-09/en-US.html
```

## API Endpoints

### Policies
- `POST /api/policies` - Create policy (with optional `?dryRun=true`)
- `GET /api/policies/:id` - Get policy metadata and PDF URL

### Templates
- `GET /api/templates/terms` - List terms templates
- `GET /api/templates/disclosures` - List disclosure templates
- `POST /api/templates/terms` - Upload terms template
- `POST /api/templates/disclosures` - Upload disclosure template

## Usage

### Creating a Policy

1. Fill out the policy form in the web interface
2. Click "Preview PDF" to generate a preview without saving
3. Click "Create Policy" to save the policy and generate the final PDF
4. Download the PDF or view it in the built-in viewer

### Template Management

Templates are stored in S3 and managed through the database. The system automatically selects the latest version of templates based on:
- **Terms**: Product version + language
- **Disclosures**: State code + language

## Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
```

### Database Migrations
```bash
pnpm db:migrate
```

### Seeding Templates
```bash
pnpm seed:templates
```

## Environment Variables

### API (.env)
```env
NODE_ENV=development
PORT=5173
DATABASE_URL=postgres://user:pass@localhost:5432/wecover
S3_ENDPOINT=http://127.0.0.1:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=wecover-pdfs
S3_REGION=us-east-1
PRODUCT_VERSION=WEC-PS-VSC-09-2025
PDF_TEMPLATE_KEY=templates/ContractPSVSCTemplate_HT_v07_Form.pdf
```

### Web (.env)
```env
VITE_API_BASE_URL=http://localhost:5173
```

## Production Deployment

### Docker Deployment (Recommended)

1. **Set up production environment**:
   ```bash
   # Update docker-compose.yml with production values
   # - Change PostgreSQL credentials
   # - Configure AWS S3 (replace MinIO)
   # - Set secure secrets
   # - Configure domain/SSL
   ```

2. **Build production images**:
   ```bash
   docker-compose build
   ```

3. **Deploy the stack**:
   ```bash
   docker-compose up -d
   ```

4. **Run migrations**:
   ```bash
   docker-compose exec api node migrations/run.js
   ```

5. **Upload templates**:
   - Upload PDF template to S3
   - Seed HTML templates via API or CLI

6. **Configure reverse proxy** (Nginx/Traefik) for SSL termination

### Manual Deployment

1. Set up PostgreSQL database
2. Configure AWS S3 or S3-compatible storage
3. Set production environment variables
4. Run migrations: `pnpm db:migrate`
5. Seed templates: `pnpm seed:templates`
6. Build applications: `pnpm build`
7. Deploy API and web applications with PM2 or systemd

## Security Considerations

- All inputs are validated with Zod schemas
- S3 URLs are pre-signed with short expiration times
- PII is stored encrypted in the database
- CORS is configured for known origins only
- No secrets are logged or exposed in client code

## License

Private - WeCover USA Internal Use Only
