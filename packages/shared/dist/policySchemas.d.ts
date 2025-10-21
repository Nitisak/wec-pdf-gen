import { z } from "zod";
export declare const OwnerSchema: z.ZodObject<{
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
export declare const CoOwnerSchema: z.ZodObject<{
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
export declare const DealerSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    zip: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    salesRep: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    address?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip?: string | undefined;
    phone?: string | undefined;
    salesRep?: string | undefined;
}, {
    name: string;
    id: string;
    address?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip?: string | undefined;
    phone?: string | undefined;
    salesRep?: string | undefined;
}>;
export declare const VehicleSchema: z.ZodObject<{
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
export declare const CoverageSchema: z.ZodObject<{
    termMonths: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodEnum<["72", "84", "96", "120", "lifetime"]>, z.ZodNumber]>, number, number | "72" | "84" | "96" | "120" | "lifetime">>>;
    commercial: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
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
    contractPrice: number;
    purchaseDate: string;
    expirationDate: string;
    termMonths?: number | "72" | "84" | "96" | "120" | "lifetime" | undefined;
    commercial?: boolean | undefined;
}>;
export declare const LenderSchema: z.ZodObject<{
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
export declare const PolicyCreateSchema: z.ZodObject<{
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
        address: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        zip: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        salesRep: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip?: string | undefined;
        phone?: string | undefined;
        salesRep?: string | undefined;
    }, {
        name: string;
        id: string;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip?: string | undefined;
        phone?: string | undefined;
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
        termMonths: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodEnum<["72", "84", "96", "120", "lifetime"]>, z.ZodNumber]>, number, number | "72" | "84" | "96" | "120" | "lifetime">>>;
        commercial: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
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
        contractPrice: number;
        purchaseDate: string;
        expirationDate: string;
        termMonths?: number | "72" | "84" | "96" | "120" | "lifetime" | undefined;
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
        name: string;
        id: string;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip?: string | undefined;
        phone?: string | undefined;
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
        name: string;
        id: string;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip?: string | undefined;
        phone?: string | undefined;
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
        contractPrice: number;
        purchaseDate: string;
        expirationDate: string;
        termMonths?: number | "72" | "84" | "96" | "120" | "lifetime" | undefined;
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
export type Owner = z.infer<typeof OwnerSchema>;
export type CoOwner = z.infer<typeof CoOwnerSchema>;
export type Dealer = z.infer<typeof DealerSchema>;
export type Vehicle = z.infer<typeof VehicleSchema>;
export type Coverage = z.infer<typeof CoverageSchema>;
export type Lender = z.infer<typeof LenderSchema>;
export type PolicyCreate = z.infer<typeof PolicyCreateSchema>;
export declare const PriceBreakdownSchema: z.ZodObject<{
    basePrice: z.ZodNumber;
    coverageOptions: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        price: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        price: number;
    }, {
        name: string;
        price: number;
    }>, "many">>>;
    fees: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        amount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        amount: number;
    }, {
        name: string;
        amount: number;
    }>, "many">>>;
    taxes: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    dealerMarkup: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    subtotal: z.ZodNumber;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    basePrice: number;
    coverageOptions: {
        name: string;
        price: number;
    }[];
    fees: {
        name: string;
        amount: number;
    }[];
    taxes: number;
    dealerMarkup: number;
    subtotal: number;
    total: number;
}, {
    basePrice: number;
    subtotal: number;
    total: number;
    coverageOptions?: {
        name: string;
        price: number;
    }[] | undefined;
    fees?: {
        name: string;
        amount: number;
    }[] | undefined;
    taxes?: number | undefined;
    dealerMarkup?: number | undefined;
}>;
export declare const QuoteCreateSchema: z.ZodObject<{
    quoteNumber: z.ZodString;
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
    dealer: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        address: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        zip: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        salesRep: z.ZodOptional<z.ZodString>;
    } & {
        logo: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip?: string | undefined;
        phone?: string | undefined;
        salesRep?: string | undefined;
        logo?: string | undefined;
    }, {
        name: string;
        id: string;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip?: string | undefined;
        phone?: string | undefined;
        salesRep?: string | undefined;
        logo?: string | undefined;
    }>;
    coverage: z.ZodObject<{
        termMonths: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodEnum<["72", "84", "96", "120", "lifetime"]>, z.ZodNumber]>, number, number | "72" | "84" | "96" | "120" | "lifetime">>>;
        commercial: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        deductible: z.ZodOptional<z.ZodNumber>;
        coverageLevel: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        termMonths: number;
        commercial: boolean;
        deductible?: number | undefined;
        coverageLevel?: string | undefined;
    }, {
        termMonths?: number | "72" | "84" | "96" | "120" | "lifetime" | undefined;
        commercial?: boolean | undefined;
        deductible?: number | undefined;
        coverageLevel?: string | undefined;
    }>;
    pricing: z.ZodObject<{
        basePrice: z.ZodNumber;
        coverageOptions: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            price: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            price: number;
        }, {
            name: string;
            price: number;
        }>, "many">>>;
        fees: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            amount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            amount: number;
        }, {
            name: string;
            amount: number;
        }>, "many">>>;
        taxes: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        dealerMarkup: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        subtotal: z.ZodNumber;
        total: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        basePrice: number;
        coverageOptions: {
            name: string;
            price: number;
        }[];
        fees: {
            name: string;
            amount: number;
        }[];
        taxes: number;
        dealerMarkup: number;
        subtotal: number;
        total: number;
    }, {
        basePrice: number;
        subtotal: number;
        total: number;
        coverageOptions?: {
            name: string;
            price: number;
        }[] | undefined;
        fees?: {
            name: string;
            amount: number;
        }[] | undefined;
        taxes?: number | undefined;
        dealerMarkup?: number | undefined;
    }>;
    validUntil: z.ZodString;
    issueDate: z.ZodOptional<z.ZodString>;
    disclaimers: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
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
        name: string;
        id: string;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip?: string | undefined;
        phone?: string | undefined;
        salesRep?: string | undefined;
        logo?: string | undefined;
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
        deductible?: number | undefined;
        coverageLevel?: string | undefined;
    };
    quoteNumber: string;
    pricing: {
        basePrice: number;
        coverageOptions: {
            name: string;
            price: number;
        }[];
        fees: {
            name: string;
            amount: number;
        }[];
        taxes: number;
        dealerMarkup: number;
        subtotal: number;
        total: number;
    };
    validUntil: string;
    disclaimers: string[];
    issueDate?: string | undefined;
    notes?: string | undefined;
}, {
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
        name: string;
        id: string;
        address?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip?: string | undefined;
        phone?: string | undefined;
        salesRep?: string | undefined;
        logo?: string | undefined;
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
        termMonths?: number | "72" | "84" | "96" | "120" | "lifetime" | undefined;
        commercial?: boolean | undefined;
        deductible?: number | undefined;
        coverageLevel?: string | undefined;
    };
    quoteNumber: string;
    pricing: {
        basePrice: number;
        subtotal: number;
        total: number;
        coverageOptions?: {
            name: string;
            price: number;
        }[] | undefined;
        fees?: {
            name: string;
            amount: number;
        }[] | undefined;
        taxes?: number | undefined;
        dealerMarkup?: number | undefined;
    };
    validUntil: string;
    issueDate?: string | undefined;
    disclaimers?: string[] | undefined;
    notes?: string | undefined;
}>;
export type PriceBreakdown = z.infer<typeof PriceBreakdownSchema>;
export type QuoteCreate = z.infer<typeof QuoteCreateSchema>;
//# sourceMappingURL=policySchemas.d.ts.map