import { useState } from 'react';
import PolicyForm from './components/PolicyForm';
import PdfViewer from './components/PdfViewer';
import QuoteForm from './components/QuoteForm';
import QuoteViewer from './components/QuoteViewer';
import QuoteList from './components/QuoteList';

function App() {
  const [activeTab, setActiveTab] = useState<'policy' | 'quote'>('quote');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<{quoteNumber: string, total: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePolicyPreview = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/policies?dryRun=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const result = await response.json();
      setPdfUrl(result.pdfUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePolicySubmit = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        
      });

      if (!response.ok) {
        throw new Error('Failed to create policy');
      }

      const result = await response.json();
      setPdfUrl(result.pdfUrl);
      
      // Show success message
      alert(`Policy created successfully! Policy Number: ${result.policyNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuoteSubmit = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quote');
      }

      const result = await response.json();
      setPdfBase64(result.pdfBase64);
      setQuoteData({
        quoteNumber: result.quoteNumber,
        total: result.total
      });
      
      // Clear policy PDF if showing
      setPdfUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewQuote = async (quoteNumber: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/quotes/${quoteNumber}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }

      const result = await response.json();
      setPdfBase64(result.pdfBase64);
      setQuoteData({
        quoteNumber: result.quoteNumber,
        total: result.total
      });
      
      // Clear policy PDF if showing
      setPdfUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setPdfUrl(null);
    setPdfBase64(null);
    setQuoteData(null);
    setError(null);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>WeCover USA - PDF Generator</h1>
        <p>Generate vehicle service contract policies and insurance quotes with dynamic PDF assembly</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'quote' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('quote');
            clearResults();
          }}
        >
          📋 Quote Generator
        </button>
        <button 
          className={`tab-btn ${activeTab === 'policy' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('policy');
            clearResults();
          }}
        >
          📄 Policy Generator
        </button>
      </div>

      {/* Quote Tab */}
      {activeTab === 'quote' && (
        <div className="tab-content">
          <QuoteForm 
            onSubmit={handleQuoteSubmit}
            isLoading={isLoading}
          />

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {pdfBase64 && quoteData && (
            <QuoteViewer 
              pdfBase64={pdfBase64}
              quoteNumber={quoteData.quoteNumber}
              total={quoteData.total}
            />
          )}

          <QuoteList onViewQuote={handleViewQuote} />
        </div>
      )}

      {/* Policy Tab */}
      {activeTab === 'policy' && (
        <div className="tab-content">
          <PolicyForm 
            onPreview={handlePolicyPreview}
            onSubmit={handlePolicySubmit}
            isLoading={isLoading}
          />

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {pdfUrl && (
            <PdfViewer pdfUrl={pdfUrl} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
