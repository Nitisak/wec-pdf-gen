import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  pdfUrl: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const [pdfDoc, setPdfDoc] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    loadPdf();
  }, [pdfUrl]);

  const loadPdf = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let pdfData;
      if (pdfUrl.startsWith('data:')) {
        // Handle base64 data URL
        const base64Data = pdfUrl.split(',')[1];
        pdfData = atob(base64Data);
      } else {
        // Handle regular URL
        const response = await fetch(pdfUrl);
        const arrayBuffer = await response.arrayBuffer();
        pdfData = new Uint8Array(arrayBuffer);
      }

      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
      await renderPage(1, pdf);
    } catch (err) {
      setError('Failed to load PDF');
      console.error('PDF loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async (pageNum: number, doc: any) => {
    if (!canvasRef.current) return;

    try {
      const page = await doc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Page rendering error:', err);
    }
  };

  const goToPage = async (pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages || !pdfDoc) return;
    
    setCurrentPage(pageNum);
    await renderPage(pageNum, pdfDoc);
  };

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'policy.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="pdf-viewer">
        <div className="loading">
          <div className="spinner"></div>
          Loading PDF...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-viewer">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Policy PDF Preview</h3>
        <button onClick={downloadPdf} className="btn btn-primary">
          Download PDF
        </button>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <button 
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          
          <span>
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}

      <div className="pdf-container">
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default PdfViewer;

