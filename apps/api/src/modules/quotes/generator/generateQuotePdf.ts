import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import type { QuoteCreate } from '@wec/shared';
import { getS3Object } from '../../storage/s3.js';

// Constants for layout
const MARGIN_LEFT = 50;
const MARGIN_RIGHT = 50;
const MARGIN_TOP = 50;
const PAGE_WIDTH = 612; // Letter size
const PAGE_HEIGHT = 792;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

interface QuotePdfOptions {
  includeLogo?: boolean;
  logoPath?: string;
}

export async function generateQuotePdf(
  quote: QuoteCreate,
  options: QuotePdfOptions = {}
): Promise<Uint8Array> {
  const { includeLogo = true, logoPath = 'brand/logos/wecover-logo.png' } = options;

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  // Load fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  let yPosition = PAGE_HEIGHT - MARGIN_TOP;

  // ============================================
  // Header: Logo + Company Info
  // ============================================
  let logoLoaded = false;
  
  if (includeLogo) {
    try {
      console.log(`Attempting to load logo from: ${logoPath}`);
      const logoBytes = await getS3Object(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);
      
      // Scale logo to fit nicely in header (max width 120px)
      const maxLogoWidth = 120;
      const scale = Math.min(maxLogoWidth / logoImage.width, 0.2);
      const logoDims = logoImage.scale(scale);

      page.drawImage(logoImage, {
        x: MARGIN_LEFT,
        y: yPosition - logoDims.height,
        width: logoDims.width,
        height: logoDims.height
      });

      yPosition -= logoDims.height + 15;
      logoLoaded = true;
      console.log(`✓ Logo loaded successfully (${logoDims.width}x${logoDims.height})`);
    } catch (error) {
      console.warn('Failed to load logo, continuing without it:', error);
    }
  }
  
  // Draw company name as fallback or complement to logo
  if (!logoLoaded) {
    page.drawText('We Cover USA', {
      x: MARGIN_LEFT,
      y: yPosition - 20,
      size: 24,
      font: boldFont,
      color: rgb(0, 0.2, 0.4)
    });
    yPosition -= 35;
  } else {
    // Add company name next to logo
    page.drawText('We Cover USA', {
      x: MARGIN_LEFT + 130,
      y: yPosition + 10,
      size: 24,
      font: boldFont,
      color: rgb(0, 0.2, 0.4)
    });
    yPosition -= 20;
  }

  yPosition -= 10;

  // ============================================
  // Title: INSURANCE QUOTE
  // ============================================
  page.drawText('INSURANCE QUOTE', {
    x: MARGIN_LEFT,
    y: yPosition,
    size: 20,
    font: boldFont,
    color: rgb(0, 0.2, 0.4)
  });
  yPosition -= 20;

  // ============================================
  // Quote Details Box
  // ============================================
  const boxHeight = 80;
  page.drawRectangle({
    x: MARGIN_LEFT,
    y: yPosition - boxHeight,
    width: CONTENT_WIDTH,
    height: boxHeight,
    color: rgb(0.95, 0.95, 0.95)
  });

  yPosition -= 15;
  page.drawText(`Quote Number: ${quote.quoteNumber}`, {
    x: MARGIN_LEFT + 10,
    y: yPosition,
    size: 11,
    font: boldFont
  });

  yPosition -= 18;
  page.drawText(`Issue Date: ${formatDate(quote.issueDate || new Date().toISOString())}`, {
    x: MARGIN_LEFT + 10,
    y: yPosition,
    size: 10,
    font: regularFont
  });

  yPosition -= 15;
  page.drawText(`Valid Until: ${formatDate(quote.validUntil)}`, {
    x: MARGIN_LEFT + 10,
    y: yPosition,
    size: 10,
    font: boldFont,
    color: rgb(0.8, 0, 0)
  });

  yPosition -= 15;
  page.drawText(`Product: ${formatProductName(quote.productVersion)}`, {
    x: MARGIN_LEFT + 10,
    y: yPosition,
    size: 10,
    font: regularFont
  });

  yPosition -= 35;

  // ============================================
  // Two-Column Layout: Dealer + Company Information
  // ============================================
  const columnWidth = (CONTENT_WIDTH - 20) / 2;
  const leftColumnX = MARGIN_LEFT;
  const rightColumnX = leftColumnX + columnWidth + 20;
  
  // Calculate starting Y position for both columns
  const sectionStartY = yPosition;
  
  // Left Column: Company Information
  page.drawText('WE COVER USA', {
    x: leftColumnX,
    y: sectionStartY,
    size: 11,
    font: boldFont,
    color: rgb(0, 0.2, 0.4)
  });
  
  let leftY = sectionStartY - 15;
  const companyInfo = [
    'We Cover USA, LLC',
    '400 SW 1st Avenue, #96',
    'Ocala, FL 34471',
    'Telephone: 855-2-WECOVER'
  ];

  for (const line of companyInfo) {
    page.drawText(line, {
      x: leftColumnX,
      y: leftY,
      size: 8,
      font: regularFont
    });
    leftY -= 12;
  }

  // Right Column: Dealer Information
  page.drawText('DEALER INFORMATION', {
    x: rightColumnX,
    y: sectionStartY,
    size: 11,
    font: boldFont,
    color: rgb(0, 0.2, 0.4)
  });
  
  let rightY = sectionStartY - 15;
  const dealerInfo = [
    quote.dealer.name,
    quote.dealer.address,
    `${quote.dealer.city || ''}, ${quote.dealer.state || ''} ${quote.dealer.zip || ''}`.trim(),
    quote.dealer.phone,
    quote.dealer.salesRep ? `Rep: ${quote.dealer.salesRep}` : null
  ].filter(Boolean);

  for (const line of dealerInfo) {
    page.drawText(line!, {
      x: rightColumnX,
      y: rightY,
      size: 8,
      font: regularFont
    });
    rightY -= 12;
  }

  // Update yPosition to the lower of the two columns
  yPosition = Math.min(leftY, rightY) - 20;

  // ============================================
  // Two-Column Layout: Customer + Vehicle
  // ============================================
  const customerColumnWidth = (CONTENT_WIDTH - 20) / 2;
  const customerLeftColumnX = MARGIN_LEFT;
  const customerRightColumnX = customerLeftColumnX + customerColumnWidth + 20;
  
  // Calculate starting Y position for both columns
  const customerSectionStartY = yPosition;
  
  // Left Column: Customer Information
  page.drawText('CUSTOMER INFORMATION', {
    x: customerLeftColumnX,
    y: customerSectionStartY,
    size: 11,
    font: boldFont,
    color: rgb(0, 0.2, 0.4)
  });
  
  let customerLeftY = customerSectionStartY - 15;
  const customerInfo = [
    `${quote.owner.firstName} ${quote.owner.lastName}`,
    quote.owner.address,
    `${quote.owner.city}, ${quote.owner.state} ${quote.owner.zip}`,
    quote.owner.phone,
    quote.owner.email
  ];

  for (const line of customerInfo) {
    page.drawText(line, {
      x: customerLeftColumnX,
      y: customerLeftY,
      size: 8,
      font: regularFont
    });
    customerLeftY -= 12;
  }

  // Right Column: Vehicle Information
  page.drawText('VEHICLE INFORMATION', {
    x: customerRightColumnX,
    y: customerSectionStartY,
    size: 11,
    font: boldFont,
    color: rgb(0, 0.2, 0.4)
  });
  
  let customerRightY = customerSectionStartY - 15;
  const vehicleInfo = [
    `${quote.vehicle.year} ${quote.vehicle.make} ${quote.vehicle.model}`,
    `VIN: ${quote.vehicle.vin}`,
    `Mileage: ${quote.vehicle.mileage.toLocaleString()} miles`,
    quote.vehicle.salePrice ? `Sale Price: $${quote.vehicle.salePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null
  ].filter(Boolean);

  for (const line of vehicleInfo) {
    page.drawText(line!, {
      x: customerRightColumnX,
      y: customerRightY,
      size: 8,
      font: regularFont
    });
    customerRightY -= 12;
  }

  // Update yPosition to the lower of the two columns
  yPosition = Math.min(customerLeftY, customerRightY) - 20;

  // ============================================
  // Coverage Details
  // ============================================
  page.drawText('COVERAGE DETAILS', {
    x: MARGIN_LEFT,
    y: yPosition,
    size: 11,
    font: boldFont,
    color: rgb(0, 0.2, 0.4)
  });
  yPosition -= 15;

  const termDisplay = quote.coverage.termMonths === 999
    ? 'Lifetime'
    : `${quote.coverage.termMonths} months`;

  const coverageInfo = [
    `Term: ${termDisplay}`,
    `Type: ${quote.coverage.commercial ? 'Commercial' : 'Personal'}`,
    quote.coverage.coverageLevel ? `Coverage Level: ${quote.coverage.coverageLevel}` : null,
    quote.coverage.deductible ? `Deductible: $${quote.coverage.deductible}` : null
  ].filter(Boolean);

  for (const line of coverageInfo) {
    page.drawText(line!, {
      x: MARGIN_LEFT,
      y: yPosition,
      size: 8,
      font: regularFont
    });
    yPosition -= 12;
  }

  yPosition -= 20;

  // ============================================
  // PRICE BREAKDOWN (Key Section!)
  // ============================================
  page.drawText('PRICE BREAKDOWN', {
    x: MARGIN_LEFT,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0, 0.2, 0.4)
  });
  yPosition -= 5;

  // Horizontal line under heading
  page.drawLine({
    start: { x: MARGIN_LEFT, y: yPosition },
    end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: yPosition },
    thickness: 1,
    color: rgb(0, 0.2, 0.4)
  });
  yPosition -= 15;

  // Total Premium (Base Coverage + Dealer Markup)
  const totalPremium = quote.pricing.basePrice + (quote.pricing.dealerMarkup || 0);
  drawPriceLine(page, 'Total Premium', totalPremium, yPosition, regularFont, boldFont);
  yPosition -= 15;

  // Coverage Options
  if (quote.pricing.coverageOptions && quote.pricing.coverageOptions.length > 0) {
    for (const option of quote.pricing.coverageOptions) {
      drawPriceLine(page, `  + ${option.name}`, option.price, yPosition, regularFont, regularFont, true);
      yPosition -= 13;
    }
  }

  // Fees
  if (quote.pricing.fees && quote.pricing.fees.length > 0) {
    for (const fee of quote.pricing.fees) {
      drawPriceLine(page, `  ${fee.name}`, fee.amount, yPosition, regularFont, regularFont, true);
      yPosition -= 13;
    }
  }

  // Taxes
  if (quote.pricing.taxes && quote.pricing.taxes > 0) {
    drawPriceLine(page, 'Taxes', quote.pricing.taxes, yPosition, regularFont, regularFont);
    yPosition -= 15;
  }

  // Subtotal line
  yPosition -= 5;
  page.drawLine({
    start: { x: MARGIN_LEFT, y: yPosition },
    end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: yPosition },
    thickness: 0.5,
    color: rgb(0.3, 0.3, 0.3)
  });
  yPosition -= 15;

  // Subtotal
  drawPriceLine(page, 'Subtotal', quote.pricing.subtotal, yPosition, boldFont, boldFont);
  yPosition -= 25;

  // Total (highlighted)
  page.drawRectangle({
    x: MARGIN_LEFT,
    y: yPosition - 5,
    width: CONTENT_WIDTH,
    height: 25,
    color: rgb(0, 0.3, 0.5)
  });

  page.drawText('TOTAL QUOTE', {
    x: MARGIN_LEFT + 10,
    y: yPosition + 5,
    size: 12,
    font: boldFont,
    color: rgb(1, 1, 1)
  });

  const totalText = `$${quote.pricing.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const totalWidth = boldFont.widthOfTextAtSize(totalText, 14);
  page.drawText(totalText, {
    x: PAGE_WIDTH - MARGIN_RIGHT - totalWidth - 10,
    y: yPosition + 5,
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1)
  });

  yPosition -= 30;

  // Add compact footer directly on the same page
  yPosition = Math.max(yPosition, 60); // Ensure we don't go too low
  
  // Footer disclaimer
  page.drawText('This quote is not a binding contract. Final terms subject to underwriting approval. All Rights Reserved 2025. WeCover USA, LLC.', {
    x: MARGIN_LEFT,
    y: 30,
    size: 7,
    font: italicFont,
    color: rgb(0.4, 0.4, 0.4)
  });

  return await pdfDoc.save();
}

// Helper function to draw price lines
function drawPriceLine(
  page: PDFPage,
  label: string,
  amount: number,
  y: number,
  labelFont: any,
  amountFont: any,
  isIndented: boolean = false
) {
  const xOffset = isIndented ? 20 : 0;

  page.drawText(label, {
    x: MARGIN_LEFT + xOffset,
    y,
    size: isIndented ? 9 : 10,
    font: labelFont
  });

  const priceText = amount >= 0
    ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `-$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const priceWidth = amountFont.widthOfTextAtSize(priceText, isIndented ? 9 : 10);

  page.drawText(priceText, {
    x: PAGE_WIDTH - MARGIN_RIGHT - priceWidth,
    y,
    size: isIndented ? 9 : 10,
    font: amountFont
  });
}

// Helper function to draw disclaimers and notes
function drawDisclaimersAndNotes(
  page: PDFPage,
  quote: QuoteCreate,
  startY: number,
  regularFont: any,
  boldFont: any,
  italicFont: any
) {
  let yPosition = startY;

  // Notes (if any)
  if (quote.notes) {
    page.drawText('ADDITIONAL NOTES', {
      x: MARGIN_LEFT,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0, 0.2, 0.4)
    });
    yPosition -= 18;

    const wrappedNotes = wrapText(quote.notes, CONTENT_WIDTH, regularFont, 9);
    for (const line of wrappedNotes) {
      page.drawText(line, {
        x: MARGIN_LEFT,
        y: yPosition,
        size: 9,
        font: regularFont
      });
      yPosition -= 14;
    }

    yPosition -= 20;
  }

  // Disclaimers
  page.drawText('IMPORTANT DISCLAIMERS', {
    x: MARGIN_LEFT,
    y: yPosition,
    size: 11,
    font: boldFont,
    color: rgb(0, 0.2, 0.4)
  });
  yPosition -= 18;

  if (quote.disclaimers && quote.disclaimers.length > 0) {
    for (const disclaimer of quote.disclaimers) {
      const wrappedText = wrapText(`• ${disclaimer}`, CONTENT_WIDTH, italicFont, 8);
      for (const line of wrappedText) {
        if (yPosition < 60) break; // Stop if we're too close to bottom
        page.drawText(line, {
          x: MARGIN_LEFT,
          y: yPosition,
          size: 8,
          font: italicFont,
          color: rgb(0.3, 0.3, 0.3)
        });
        yPosition -= 12;
      }
      yPosition -= 5;
    }
  }

  // Footer
  yPosition = 40;
  page.drawText('This quote is not a binding contract. Final terms subject to underwriting approval. All Rights Reserved 2025. WeCover USA, LLC. ', {
    x: MARGIN_LEFT,
    y: yPosition,
    size: 7,
    font: italicFont,
    color: rgb(0.4, 0.4, 0.4)
  });
}

// Helper function to wrap text
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);

    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

// Helper function to format dates
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to format product names
function formatProductName(productVersion: string): string {
  const productNames: Record<string, string> = {
    'WEC-PS-VSC-09-2025': 'PSVSC Vehicle Service Contract',
    'AGVSC-LIFETIME-V04-2025': 'Lifetime Warranty Protection'
  };
  return productNames[productVersion] || productVersion;
}

