import { PDFDocument } from 'pdf-lib';

export async function mergePdfs(buffers: Uint8Array[]): Promise<Uint8Array> {
  const outDoc = await PDFDocument.create();
  
  for (const buffer of buffers) {
    const srcDoc = await PDFDocument.load(buffer);
    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await outDoc.copyPages(srcDoc, pageIndices);
    
    copiedPages.forEach(page => outDoc.addPage(page));
  }
  
  return await outDoc.save();
}

