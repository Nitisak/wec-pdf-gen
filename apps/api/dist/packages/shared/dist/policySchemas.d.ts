export const OwnerSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    address: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    zip: z.ZodString;
    phone: z.ZodString;
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
}, {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
}>;
export const CoOwnerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    zip: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    address?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip?: string | undefined;
    phone?: string | undefined;
    email?: string | undefined;
    name?: string | undefined;
}, {
    address?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip?: string | undefined;
    phone?: string | undefined;
    email?: string | undefined;
    name?: string | undefined;
}>;
export const DealerSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    address: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    zip: z.ZodString;
    phone: z.ZodString;
    salesRep: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    name: string;
    id: string;
    salesRep?: string | undefined;
}, {
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    name: string;
    id: string;
    salesRep?: string | undefined;
}>;
export const VehicleSchema: z.ZodObject<{
    vin: z.ZodString;
    year: z.ZodString;
    make: z.ZodString;
    model: z.ZodString;
    mileage: z.ZodNumber;
    salePrice: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    vin: string;
    year: string;
    make: string;
    model: string;
    mileage: number;
    salePrice?: number | undefined;
}, {
    vin: string;
    year: string;
    make: string;
    model: string;
    mileage: number;
    salePrice?: number | undefined;
}>;
export const CoverageSchema: z.ZodObject<{
    termMonths: z.ZodEffects<z.ZodEnum<["72", "84", "96"]>, number, "72" | "84" | "96">;
    commercial: z.ZodDefault<z.ZodBoolean>;
    contractPrice: z.ZodNumber;
    purchaseDate: z.ZodString;
    expirationDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    termMonths: number;
    commercial: boolean;
    contractPrice: number;
    purchaseDate: string;
    expirationDate: string;
}, {
    termMonths: "72" | "84" | "96";
    contractPrice: number;
    purchaseDate: string;
    expirationDate: string;
    commercial?: boolean | undefined;
}>;
export const LenderSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    cityStateZip: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    address?: string | undefined;
    name?: string | undefined;
    cityStateZip?: string | undefined;
}, {
    address?: string | undefined;
    name?: string | undefined;
    cityStateZip?: string | undefined;
}>;
export const PolicyCreateSchema: z.ZodObject<{
    policyNumber: z.ZodString;
    stateCode: z.ZodString;
    productVersion: z.ZodString;
    owner: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        address: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zip: z.ZodString;
        phone: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        phone: string;
        email: string;
    }, {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        phone: string;
        email: string;
    }>;
    coOwner: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        zip: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip?: string | undefined;
        phone?: string | undefined;
        email?: string | undefined;
        name?: string | undefined;
    }, {
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip?: string | undefined;
        phone?: string | undefined;
        email?: string | undefined;
        name?: string | undefined;
    }>>;
    dealer: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        address: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zip: z.ZodString;
        phone: z.ZodString;
        salesRep: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        city: string;
        state: string;
        zip: string;
        phone: string;
        name: string;
        id: string;
        salesRep?: string | undefined;
    }, {
        address: string;
        city: string;
        state: string;
        zip: string;
        phone: string;
        name: string;
        id: string;
        salesRep?: string | undefined;
    }>;
    vehicle: z.ZodObject<{
        vin: z.ZodString;
        year: z.ZodString;
        make: z.ZodString;
        model: z.ZodString;
        mileage: z.ZodNumber;
        salePrice: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        vin: string;
        year: string;
        make: string;
        model: string;
        mileage: number;
        salePrice?: number | undefined;
    }, {
        vin: string;
        year: string;
        make: string;
        model: string;
        mileage: number;
        salePrice?: number | undefined;
    }>;
    coverage: z.ZodObject<{
        termMonths: z.ZodEffects<z.ZodEnum<["72", "84", "96"]>, number, "72" | "84" | "96">;
        commercial: z.ZodDefault<z.ZodBoolean>;
        contractPrice: z.ZodNumber;
        purchaseDate: z.ZodString;
        expirationDate: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        termMonths: number;
        commercial: boolean;
        contractPrice: number;
        purchaseDate: string;
        expirationDate: string;
    }, {
        termMonths: "72" | "84" | "96";
        contractPrice: number;
        purchaseDate: string;
        expirationDate: string;
        commercial?: boolean | undefined;
    }>;
    lender: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodString>;
        cityStateZip: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        address?: string | undefined;
        name?: string | undefined;
        cityStateZip?: string | undefined;
    }, {
        address?: string | undefined;
        name?: string | undefined;
        cityStateZip?: string | undefined;
    }>>;
    customerSignaturePngBase64: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    policyNumber: string;
    stateCode: string;
    productVersion: string;
    owner: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        phone: string;
        email: string;
    };
    dealer: {
        address: string;
        city: string;
        state: string;
        zip: string;
        phone: string;
        name: string;
        id: string;
        salesRep?: string | undefined;
    };
    vehicle: {
        vin: string;
        year: string;
        make: string;
        model: string;
        mileage: number;
        salePrice?: number | undefined;
    };
    coverage: {
        termMonths: number;
        commercial: boolean;
        contractPrice: number;
        purchaseDate: string;
        expirationDate: string;
    };
    coOwner?: {
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip?: string | undefined;
        phone?: string | undefined;
        email?: string | undefined;
        name?: string | undefined;
    } | undefined;
    lender?: {
        address?: string | undefined;
        name?: string | undefined;
        cityStateZip?: string | undefined;
    } | undefined;
    customerSignaturePngBase64?: string | undefined;
}, {
    policyNumber: string;
    stateCode: string;
    productVersion: string;
    owner: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        phone: string;
        email: string;
    };
    dealer: {
        address: string;
        city: string;
        state: string;
        zip: string;
        phone: string;
        name: string;
        id: string;
        salesRep?: string | undefined;
    };
    vehicle: {
        vin: string;
        year: string;
        make: string;
        model: string;
        mileage: number;
        salePrice?: number | undefined;
    };
    coverage: {
        termMonths: "72" | "84" | "96";
        contractPrice: number;
        purchaseDate: string;
        expirationDate: string;
        commercial?: boolean | undefined;
    };
    coOwner?: {
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip?: string | undefined;
        phone?: string | undefined;
        email?: string | undefined;
        name?: string | undefined;
    } | undefined;
    lender?: {
        address?: string | undefined;
        name?: string | undefined;
        cityStateZip?: string | undefined;
    } | undefined;
    customerSignaturePngBase64?: string | undefined;
}>;
import { z } from "zod";
