import React, { useState } from 'react';

interface QuoteViewerProps {
  pdfBase64: string;
  quoteNumber: string;
  total: string;
}

const QuoteViewer: React.FC<QuoteViewerProps> = ({ pdfBase64, quoteNumber, total }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${pdfBase64}`;
    link.download = `quote-${quoteNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    const pdfWindow = window.open();
    if (pdfWindow) {
      pdfWindow.document.write(`
        <html>
          <head><title>Quote ${quoteNumber}</title></head>
          <body style="margin:0; padding:0;">
            <embed src="data:application/pdf;base64,${pdfBase64}" 
                   type="application/pdf" 
                   width="100%" 
                   height="100%" 
                   style="border:none;">
          </body>
        </html>
      `);
    }
  };

  return (
    <div className={`quote-viewer ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="quote-header">
        <div className="quote-info">
          <h3>Quote Generated Successfully!</h3>
          <p><strong>Quote Number:</strong> {quoteNumber}</p>
          <p><strong>Total Amount:</strong> ${total}</p>
        </div>
        <div className="quote-actions">
          <button onClick={downloadPdf} className="action-btn download">
            📥 Download PDF
          </button>
          <button onClick={openInNewTab} className="action-btn open">
            🔗 Open in New Tab
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            className="action-btn fullscreen"
          >
            {isFullscreen ? '📱 Exit Fullscreen' : '🖥️ Fullscreen'}
          </button>
        </div>
      </div>
      
      <div className="pdf-container">
        <embed 
          src={`data:application/pdf;base64,${pdfBase64}`}
          type="application/pdf"
          width="100%"
          height={isFullscreen ? "100vh" : "600px"}
          style={{ border: '1px solid #ddd', borderRadius: '8px' }}
        />
      </div>
      
      <div className="quote-footer">
        <p className="note">
          💡 <strong>Note:</strong> This PDF was generated on-demand and is not stored on our servers. 
          You can download it or generate a new one anytime.
        </p>
      </div>
    </div>
  );
};

export default QuoteViewer;

