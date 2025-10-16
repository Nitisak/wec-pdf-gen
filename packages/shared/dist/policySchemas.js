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
    termMonths: z.enum(["72", "84", "96"]).transform(Number),
    commercial: z.boolean().default(false),
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
