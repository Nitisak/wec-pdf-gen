import { chromium } from 'playwright';

export async function renderHtmlToPdf(html: string): Promise<Uint8Array> {
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    
    const pdf = await page.pdf({ 
      printBackground: true, 
      format: 'Letter', 
      margin: { 
        top: '0.5in', 
        bottom: '0.5in', 
        left: '0.5in', 
        right: '0.5in' 
      } 
    });
    
    return pdf;
  } finally {
    await browser.close();
  }
}

