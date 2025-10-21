import { z } from "zod";
export const OwnerSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2),
    zip: z.string().min(3),
    phone: z.string().min(7),
    email: z.string().email()
});
export const CoOwnerSchema = z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional()
});
export const DealerSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    address: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    state: z.string().length(2).optional(),
    zip: z.string().min(3).optional(),
    phone: z.string().min(7).optional(),
    salesRep: z.string().optional()
});
export const VehicleSchema = z.object({
    vin: z.string().min(5),
    year: z.string().min(4),
    make: z.string().min(1),
    model: z.string().min(1),
    mileage: z.number().nonnegative(),
    salePrice: z.number().nonnegative().optional()
});
export const CoverageSchema = z.object({
    termMonths: z.union([
        z.enum(["72", "84", "96", "120", "lifetime"]),
        z.number().positive()
    ]).transform(val => {
        // Convert string terms to numbers, or pass through numbers
        if (typeof val === 'number')
            return val;
        if (val === 'lifetime')
            return 999; // Special value for lifetime
        return Number(val);
    }).optional().default(999), // Default to 999 (lifetime) if not provided
    commercial: z.boolean().optional().default(false),
    contractPrice: z.number().nonnegative(),
    purchaseDate: z.string(), // ISO date
    expirationDate: z.string() // ISO date
});
export const LenderSchema = z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    cityStateZip: z.string().optional()
});
export const PolicyCreateSchema = z.object({
    policyNumber: z.string().min(1),
    stateCode: z.string().length(2),
    productVersion: z.string().min(1),
    owner: OwnerSchema,
    coOwner: CoOwnerSchema.optional(),
    dealer: DealerSchema,
    vehicle: VehicleSchema,
    coverage: CoverageSchema,
    lender: LenderSchema.optional(),
    customerSignaturePngBase64: z.string().optional()
});
// ============================================
// Quote Schemas
// ============================================
export const PriceBreakdownSchema = z.object({
    basePrice: z.number().nonnegative(),
    coverageOptions: z.array(z.object({
        name: z.string(),
        price: z.number()
    })).optional().default([]),
    fees: z.array(z.object({
        name: z.string(),
        amount: z.number()
    })).optional().default([]),
    taxes: z.number().nonnegative().optional().default(0),
    dealerMarkup: z.number().nonnegative().optional().default(0),
    subtotal: z.number().nonnegative(),
    total: z.number().nonnegative()
});
export const QuoteCreateSchema = z.object({
    quoteNumber: z.string().min(1),
    stateCode: z.string().length(2),
    productVersion: z.string().min(1),
    // Customer info
    owner: OwnerSchema,
    vehicle: VehicleSchema,
    // Dealer info
    dealer: DealerSchema.extend({
        logo: z.string().optional() // Optional dealer logo URL/path
    }),
    // Coverage details
    coverage: z.object({
        termMonths: z.union([
            z.enum(["72", "84", "96", "120", "lifetime"]),
            z.number().positive()
        ]).transform(val => {
            if (typeof val === 'number')
                return val;
            if (val === 'lifetime')
                return 999;
            return Number(val);
        }).optional().default(999),
        commercial: z.boolean().optional().default(false),
        deductible: z.number().nonnegative().optional(),
        coverageLevel: z.string().optional() // e.g., "Basic", "Premium", "Elite"
    }),
    // Price breakdown
    pricing: PriceBreakdownSchema,
    // Quote validity
    validUntil: z.string(), // ISO date
    issueDate: z.string().optional(), // ISO date, defaults to now
    // Optional disclaimers
    disclaimers: z.array(z.string()).optional().default([
        "This quote is valid for the specified period only.",
        "Final pricing may vary based on vehicle inspection.",
        "All coverage is subject to terms and conditions."
    ]),
    // Optional notes
    notes: z.string().optional()
});
