import { useState } from 'react';
import PolicyForm from './components/PolicyForm';
import PdfViewer from './components/PdfViewer';

function App() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = async (formData: any) => {
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

  const handleSubmit = async (formData: any) => {
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

  return (
    <div className="container">
      <div className="header">
        <h1>WeCover USA - Policy Generator</h1>
        <p>Generate vehicle service contract policies with dynamic PDF assembly</p>
      </div>

      <PolicyForm 
        onPreview={handlePreview}
        onSubmit={handleSubmit}
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
  );
}

export default App;
