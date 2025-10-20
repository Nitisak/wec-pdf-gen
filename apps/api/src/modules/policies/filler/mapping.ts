import { PolicyCreate } from '@wec/shared/policySchemas';

/**
 * Maps PolicyCreate payload to AcroForm field names based on product version
 */
export const toAcroFields = (p: PolicyCreate): Record<string, string> => {
  console.log('toAcroFields input:', JSON.stringify({ 
    productVersion: p.productVersion,
    termMonths: p.coverage.termMonths, 
    commercial: p.coverage.commercial 
  }));
  
  // Determine which mapping to use based on product version
  if (p.productVersion === 'AGVSC-LIFETIME-V04-2025') {
    return toLifetimeWarrantyFields(p);
  }
  
  // Default to PSVSC mapping
  return toPSVSCFields(p);
};

/**
 * Maps PolicyCreate payload to PSVSC AcroForm field names
 * This mapping is specific to the ContractPSVSCTemplate_HT_v07_Form.pdf template
 */
const toPSVSCFields = (p: PolicyCreate): Record<string, string> => {
  return {
    Text_Contract_Number: p.policyNumber,
    Text_Owner_Firstname: p.owner.firstName,
    Text_Owner_Lastname: p.owner.lastName,
    Text_Owner_Address: p.owner.address,
    Text_Owner_City: p.owner.city,
    Text_Owner_State: p.owner.state,
    Text_Owner_ZipCode: p.owner.zip,
    Text_Owner_Phone: p.owner.phone,
    Text_Owner_Email: p.owner.email,

    Text_Co_Owner_Name: p.coOwner?.name ?? "",
    Text_Co_Owner_Address: p.coOwner?.address ?? "",
    Text_Co_Owner_City: p.coOwner?.city ?? "",
    Text_Co_Owner_state: p.coOwner?.state ?? "",
    Text_Co_Owner_ZipCode: p.coOwner?.zip ?? "",
    Text_Co_Owner_Phone: p.coOwner?.phone ?? "",
    Text_Co_Owner_Email: p.coOwner?.email ?? "",

    Text_Dealer_ID: p.dealer.id,
    Text_Dealer_Name: p.dealer.name,
    Text_Dealer_Address: p.dealer.address ?? "",
    Text_Dealer_City: p.dealer.city ?? "",
    Text_Dealer_State: p.dealer.state ?? "",
    Text_Dealer_ZipCode: p.dealer.zip ?? "",
    Text_Dealer_Phone: p.dealer.phone ?? "",
    Text_Dealer_Sale_Name: p.dealer.salesRep ?? "",

    Text_Vehicle_ID: p.vehicle.vin,
    Text_Vehicle_Year: p.vehicle.year,
    Text_Vehicle_Make: p.vehicle.make,
    Text_Vehicle_Model: p.vehicle.model,
    Text_Vehicle_Mileage: String(p.vehicle.mileage),
    Text_Vehicle_Sale_Price: p.vehicle.salePrice?.toFixed(2) ?? "",

    Text_Contract_Purchase_Date: p.coverage.purchaseDate,
    Text_ExpirationDate: p.coverage.expirationDate,
    Text_Contract_Price: p.coverage.contractPrice.toFixed(2),

    Term_72m: Number(p.coverage.termMonths ?? 999)===72 ? "On" : "Off",
    Term_84m: Number(p.coverage.termMonths ?? 999)===84 ? "On" : "Off",
    Term_96m: Number(p.coverage.termMonths ?? 999)===96 ? "On" : "Off",
    LossCode_COMMERCIAL: (p.coverage.commercial ?? false) ? "On" : "Off",

    Text_Lender_Name: p.lender?.name ?? "",
    Text_Lender_Address: p.lender?.address ?? "",
    Text_Lender_City_Sate_Zip: p.lender?.cityStateZip ?? "",

    CustomerSignature: "" // Acro text stays empty; we overlay PNG at coords in filler
  };
};

/**
 * Maps PolicyCreate payload to Lifetime Warranty AcroForm field names
 * This mapping is specific to the AGVSC_LifeTime_V04_01_Form.pdf template
 * 
 * NOTE: Field names are assumed based on similar structure to PSVSC.
 * These may need adjustment based on actual PDF form field names.
 */
const toLifetimeWarrantyFields = (p: PolicyCreate): Record<string, string> => {
  return {
    // Contract Information
    Text_Contract_Number: p.policyNumber,
    
    // Owner Information
    Text_Owner_Firstname: p.owner.firstName,
    Text_Owner_Lastname: p.owner.lastName,
    Text_Owner_Address: p.owner.address,
    Text_Owner_City: p.owner.city,
    Text_Owner_State: p.owner.state,
    Text_Owner_ZipCode: p.owner.zip,
    Text_Owner_Phone: p.owner.phone,
    Text_Owner_Email: p.owner.email,
    
    // Co-Owner Information (optional)
    Text_Co_Owner_Name: p.coOwner?.name ?? "",
    Text_Co_Owner_Address: p.coOwner?.address ?? "",
    Text_Co_Owner_City: p.coOwner?.city ?? "",
    Text_Co_Owner_state: p.coOwner?.state ?? "",
    Text_Co_Owner_ZipCode: p.coOwner?.zip ?? "",
    Text_Co_Owner_Phone: p.coOwner?.phone ?? "",
    Text_Co_Owner_Email: p.coOwner?.email ?? "",
    
    // Dealer Information
    Text_Dealer_ID: p.dealer?.id ?? "",
    Text_Dealer_Name: p.dealer?.name ?? "",
    Text_Dealer_Address: p.dealer?.address ?? "",
    Text_Dealer_City: p.dealer?.city ?? "",
    Text_Dealer_State: p.dealer?.state ?? "",
    Text_Dealer_ZipCode: p.dealer?.zip ?? "",
    Text_Dealer_Phone: p.dealer?.phone ?? "",
    Text_Dealer_Sale_Name: p.dealer?.salesRep ?? "",
    
    // Vehicle Information
    Text_Vehicle_ID: p.vehicle.vin,
    Text_Vehicle_Year: p.vehicle.year,
    Text_Vehicle_Make: p.vehicle.make,
    Text_Vehicle_Model: p.vehicle.model,
    Text_Vehicle_Mileage: p.vehicle.mileage.toString(),
    Text_Vehicle_Sale_Price: p.vehicle.salePrice?.toFixed(2) ?? "",
    
    // Contract Details
    Text_Contract_Purchase_Date: p.coverage.purchaseDate,
    Text_ExpirationDate: p.coverage.expirationDate,
    Text_Contract_Price: p.coverage.contractPrice.toFixed(2),
    
    // Term checkboxes (72, 84, 96 months)
    // Note: Lifetime Warranty (999) won't check any of these, which is correct
    Term_72m: Number(p.coverage.termMonths ?? 999)===72 ? "On" : "Off",
    Term_84m: Number(p.coverage.termMonths ?? 999)===84 ? "On" : "Off",
    Term_96m: Number(p.coverage.termMonths ?? 999)===96 ? "On" : "Off",
    
    // Commercial/Farm Use (optional, defaults to false)
    LossCode_COMMERCIAL: (p.coverage.commercial ?? false) ? "On" : "Off",
    
    // Lender
    Text_Lender_Name: p.lender?.name ?? "",
    Text_Lender_Address: p.lender?.address ?? "",
    Text_Lender_City_Sate_Zip: p.lender?.cityStateZip ?? "",

    // Signature (handled separately as image overlay)
    CustomerSignature: ""
  };
};
