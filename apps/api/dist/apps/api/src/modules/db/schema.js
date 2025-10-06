import { pgTable, uuid, text, integer, boolean, date, numeric, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
export const policy = pgTable('policy', {
    id: uuid('id').primaryKey().defaultRandom(),
    policyNumber: text('policy_number').notNull().unique(),
    productVersion: text('product_version').notNull(),
    stateCode: text('state_code').notNull(),
    termMonths: integer('term_months').notNull(),
    commercial: boolean('commercial').notNull().default(false),
    effectiveDate: date('effective_date').notNull(),
    expirationDate: date('expiration_date').notNull(),
    contractPrice: numeric('contract_price', { precision: 12, scale: 2 }).notNull(),
    salePrice: numeric('sale_price', { precision: 12, scale: 2 }),
    payload: jsonb('payload').notNull(),
    pdfKey: text('pdf_key'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    policyNumberIdx: index('idx_policy_number').on(table.policyNumber),
    stateCodeIdx: index('idx_policy_state').on(table.stateCode),
    productVersionIdx: index('idx_policy_product').on(table.productVersion)
}));
export const htmlTemplate = pgTable('html_template', {
    id: uuid('id').primaryKey().defaultRandom(),
    kind: text('kind').notNull(),
    productVersion: text('product_version'),
    stateCode: text('state_code'),
    language: text('language').notNull().default('en-US'),
    versionTag: text('version_tag').notNull(),
    s3Key: text('s3_key').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    templateIdx: index('idx_html_tmpl').on(table.kind, table.productVersion, table.stateCode, table.language, table.versionTag)
}));
