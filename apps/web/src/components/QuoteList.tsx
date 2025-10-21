import React, { useState, useEffect } from 'react';

interface Quote {
  id: string;
  quoteNumber: string;
  productVersion: string;
  stateCode: string;
  total: string;
  issueDate: string;
  validUntil: string;
  createdAt: string;
}

interface QuoteListProps {
  onViewQuote: (quoteNumber: string) => void;
}

const QuoteList: React.FC<QuoteListProps> = ({ onViewQuote }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    stateCode: '',
    productVersion: '',
    limit: 10
  });

  const fetchQuotes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      if (filters.stateCode) queryParams.append('stateCode', filters.stateCode);
      if (filters.productVersion) queryParams.append('productVersion', filters.productVersion);
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      
      const response = await fetch(`/api/quotes?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }
      
      const data = await response.json();
      setQuotes(data.quotes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [filters]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="quote-list">
      <div className="list-header">
        <h3>Quote Management</h3>
        <button onClick={fetchQuotes} disabled={isLoading} className="refresh-btn">
          {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>State:</label>
          <select 
            value={filters.stateCode} 
            onChange={(e) => setFilters({...filters, stateCode: e.target.value})}
          >
            <option value="">All States</option>
            <option value="FL">Florida</option>
            <option value="TX">Texas</option>
            <option value="CA">California</option>
            <option value="NY">New York</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Product:</label>
          <select 
            value={filters.productVersion} 
            onChange={(e) => setFilters({...filters, productVersion: e.target.value})}
          >
            <option value="">All Products</option>
            <option value="WEC-PS-VSC-09-2025">PSVSC 09-2025</option>
            <option value="AGVSC-LIFETIME-V04-2025">Lifetime Warranty</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Limit:</label>
          <select 
            value={filters.limit} 
            onChange={(e) => setFilters({...filters, limit: parseInt(e.target.value)})}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {quotes.length === 0 && !isLoading ? (
        <div className="no-quotes">
          <p>No quotes found. Create your first quote using the form above!</p>
        </div>
      ) : (
        <div className="quotes-table">
          <table>
            <thead>
              <tr>
                <th>Quote Number</th>
                <th>Product</th>
                <th>State</th>
                <th>Total</th>
                <th>Issue Date</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id}>
                  <td>{quote.quoteNumber}</td>
                  <td>
                    <span className="product-badge">
                      {quote.productVersion === 'WEC-PS-VSC-09-2025' ? 'PSVSC' : 'Lifetime'}
                    </span>
                  </td>
                  <td>{quote.stateCode}</td>
                  <td>${quote.total}</td>
                  <td>{formatDate(quote.issueDate)}</td>
                  <td>{formatDate(quote.validUntil)}</td>
                  <td>
                    <span className={`status-badge ${isExpired(quote.validUntil) ? 'expired' : 'valid'}`}>
                      {isExpired(quote.validUntil) ? 'Expired' : 'Valid'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => onViewQuote(quote.quoteNumber)}
                      className="view-btn"
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isLoading && (
        <div className="loading">
          <p>Loading quotes...</p>
        </div>
      )}
    </div>
  );
};

export default QuoteList;

