import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PolicyCreateSchema, PolicyCreate } from '@wec/shared/policySchemas';

interface PolicyFormProps {
  onPreview: (data: PolicyCreate) => void;
  onSubmit: (data: PolicyCreate) => void;
  isLoading: boolean;
}

// Available products configuration
const PRODUCTS = [
  {
    id: 'WEC-PS-VSC-09-2025',
    name: 'Powertrain Service Contract',
    shortName: 'PSVSC',
    description: 'Comprehensive powertrain coverage for 72, 84, or 96 months',
    icon: '🔧',
    color: '#007bff'
  },
  {
    id: 'AGVSC-LIFETIME-V04-2025',
    name: 'Lifetime Warranty',
    shortName: 'Lifetime',
    description: 'Extended lifetime coverage for maximum protection',
    icon: '🛡️',
    color: '#28a745'
  }
];

const PolicyForm: React.FC<PolicyFormProps> = ({ onPreview, onSubmit, isLoading }) => {
  const [selectedTerm, setSelectedTerm] = useState<string>('72');
  const [selectedProduct, setSelectedProduct] = useState<string>('WEC-PS-VSC-09-2025');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<PolicyCreate>({
    resolver: zodResolver(PolicyCreateSchema),
    defaultValues: {
      policyNumber: '',
      stateCode: 'FL',
      productVersion: 'WEC-PS-VSC-09-2025',
      coverage: {
        termMonths: '72' as any,
        commercial: false,
        contractPrice: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        expirationDate: ''
      }
    }
  });

  const handleTermChange = (term: string) => {
    setSelectedTerm(term);
    setValue('coverage.termMonths', term as any);
  };

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    setValue('productVersion', productId);
  };

  const calculateExpirationDate = (purchaseDate: string, termMonths: number) => {
    const date = new Date(purchaseDate);
    date.setMonth(date.getMonth() + termMonths);
    return date.toISOString().split('T')[0];
  };

  const purchaseDate = watch('coverage.purchaseDate');
  const termMonths = watch('coverage.termMonths');

  React.useEffect(() => {
    if (purchaseDate && termMonths) {
      const expirationDate = calculateExpirationDate(purchaseDate, termMonths);
      setValue('coverage.expirationDate', expirationDate);
    }
  }, [purchaseDate, termMonths, setValue]);

  const onFormSubmit = (data: PolicyCreate) => {
    onSubmit(data);
  };

  const onPreviewSubmit = (data: PolicyCreate) => {
    onPreview(data);
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        {/* Product Selector */}
        <div className="product-selector-section">
          <h2 className="section-title">Select Product Type</h2>
          <div className="product-cards">
            {PRODUCTS.map((product) => (
              <div
                key={product.id}
                className={`product-card ${selectedProduct === product.id ? 'selected' : ''}`}
                onClick={() => handleProductChange(product.id)}
                style={{ borderColor: selectedProduct === product.id ? product.color : '#ddd' }}
              >
                <div className="product-icon" style={{ fontSize: '48px' }}>
                  {product.icon}
                </div>
                <div className="product-info">
                  <h3 className="product-name">
                    {product.shortName}
                    {selectedProduct === product.id && (
                      <span className="selected-badge" style={{ backgroundColor: product.color }}>
                        ✓ Selected
                      </span>
                    )}
                  </h3>
                  <p className="product-full-name">{product.name}</p>
                  <p className="product-description">{product.description}</p>
                  <p className="product-id">Product Version: {product.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <h2 className="section-title">Policy Information</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="policyNumber">Policy Number</label>
            <input
              {...register('policyNumber')}
              type="text"
              placeholder="Auto-generated if empty"
            />
            {errors.policyNumber && <div className="error">{errors.policyNumber.message}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="stateCode">State</label>
            <select {...register('stateCode')}>
              <option value="FL">Florida</option>
              <option value="TX">Texas</option>
              <option value="GA">Georgia</option>
              <option value="CA">California</option>
            </select>
            {errors.stateCode && <div className="error">{errors.stateCode.message}</div>}
          </div>
        </div>

        <h2 className="section-title">Owner Information</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="owner.firstName">First Name</label>
            <input {...register('owner.firstName')} type="text" />
            {errors.owner?.firstName && <div className="error">{errors.owner.firstName.message}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="owner.lastName">Last Name</label>
            <input {...register('owner.lastName')} type="text" />
            {errors.owner?.lastName && <div className="error">{errors.owner.lastName.message}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="owner.address">Address</label>
          <input {...register('owner.address')} type="text" />
          {errors.owner?.address && <div className="error">{errors.owner.address.message}</div>}
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label htmlFor="owner.city">City</label>
            <input {...register('owner.city')} type="text" />
            {errors.owner?.city && <div className="error">{errors.owner.city.message}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="owner.state">State</label>
            <input {...register('owner.state')} type="text" maxLength={2} />
            {errors.owner?.state && <div className="error">{errors.owner.state.message}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="owner.zip">ZIP Code</label>
            <input {...register('owner.zip')} type="text" />
            {errors.owner?.zip && <div className="error">{errors.owner.zip.message}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="owner.phone">Phone</label>
            <input {...register('owner.phone')} type="tel" />
            {errors.owner?.phone && <div className="error">{errors.owner.phone.message}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="owner.email">Email</label>
            <input {...register('owner.email')} type="email" />
            {errors.owner?.email && <div className="error">{errors.owner.email.message}</div>}
          </div>
        </div>

        <h2 className="section-title">Dealer Information</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dealer.id">Dealer ID</label>
            <input {...register('dealer.id')} type="text" />
            {errors.dealer?.id && <div className="error">{errors.dealer.id.message}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="dealer.name">Dealer Name</label>
            <input {...register('dealer.name')} type="text" />
            {errors.dealer?.name && <div className="error">{errors.dealer.name.message}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="dealer.address">Dealer Address</label>
          <input {...register('dealer.address')} type="text" />
          {errors.dealer?.address && <div className="error">{errors.dealer.address.message}</div>}
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label htmlFor="dealer.city">City</label>
            <input {...register('dealer.city')} type="text" />
            {errors.dealer?.city && <div className="error">{errors.dealer.city.message}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="dealer.state">State</label>
            <input {...register('dealer.state')} type="text" maxLength={2} />
            {errors.dealer?.state && <div className="error">{errors.dealer.state.message}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="dealer.zip">ZIP Code</label>
            <input {...register('dealer.zip')} type="text" />
            {errors.dealer?.zip && <div className="error">{errors.dealer.zip.message}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dealer.phone">Phone</label>
            <input {...register('dealer.phone')} type="tel" />
            {errors.dealer?.phone && <div className="error">{errors.dealer.phone.message}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="dealer.salesRep">Sales Representative</label>
            <input {...register('dealer.salesRep')} type="text" />
            {errors.dealer?.salesRep && <div className="error">{errors.dealer.salesRep.message}</div>}
          </div>
        </div>

        <h2 className="section-title">Vehicle Information</h2>
        
        <div className="form-group">
          <label htmlFor="vehicle.vin">VIN</label>
          <input {...register('vehicle.vin')} type="text" />
          {errors.vehicle?.vin && <div className="error">{errors.vehicle.vin.message}</div>}
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label htmlFor="vehicle.year">Year</label>
            <input {...register('vehicle.year')} type="text" />
            {errors.vehicle?.year && <div className="error">{errors.vehicle.year.message}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="vehicle.make">Make</label>
            <input {...register('vehicle.make')} type="text" />
            {errors.vehicle?.make && <div className="error">{errors.vehicle.make.message}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="vehicle.model">Model</label>
            <input {...register('vehicle.model')} type="text" />
            {errors.vehicle?.model && <div className="error">{errors.vehicle.model.message}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="vehicle.mileage">Mileage</label>
            <input {...register('vehicle.mileage', { valueAsNumber: true })} type="number" />
            {errors.vehicle?.mileage && <div className="error">{errors.vehicle.mileage.message}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="vehicle.salePrice">Sale Price</label>
            <input {...register('vehicle.salePrice', { valueAsNumber: true })} type="number" step="0.01" />
            {errors.vehicle?.salePrice && <div className="error">{errors.vehicle.salePrice.message}</div>}
          </div>
        </div>

        <h2 className="section-title">Coverage Information</h2>
        
        <div className="form-group">
          <label>Term Length</label>
          <div className="checkbox-group">
            {['72', '84', '96'].map((term) => (
              <div key={term} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedTerm === term}
                  onChange={() => handleTermChange(term)}
                  value={term}
                />
                <label>{term} months</label>
              </div>
            ))}
          </div>
          {errors.coverage?.termMonths && <div className="error">{errors.coverage.termMonths.message}</div>}
        </div>

        <div className="form-group">
          <div className="checkbox-item">
            <input {...register('coverage.commercial')} type="checkbox" />
            <label>Commercial/Farm Use</label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="coverage.contractPrice">Contract Price</label>
            <input {...register('coverage.contractPrice', { valueAsNumber: true })} type="number" step="0.01" />
            {errors.coverage?.contractPrice && <div className="error">{errors.coverage.contractPrice.message}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="coverage.purchaseDate">Purchase Date</label>
            <input {...register('coverage.purchaseDate')} type="date" />
            {errors.coverage?.purchaseDate && <div className="error">{errors.coverage.purchaseDate.message}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="coverage.expirationDate">Expiration Date</label>
          <input {...register('coverage.expirationDate')} type="date" readOnly />
          {errors.coverage?.expirationDate && <div className="error">{errors.coverage.expirationDate.message}</div>}
        </div>

        <h2 className="section-title">Lender Information (Optional)</h2>
        
        <div className="form-group">
          <label htmlFor="lender.name">Lender Name</label>
          <input {...register('lender.name')} type="text" />
          {errors.lender?.name && <div className="error">{errors.lender.name.message}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="lender.address">Lender Address</label>
          <input {...register('lender.address')} type="text" />
          {errors.lender?.address && <div className="error">{errors.lender.address.message}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="lender.cityStateZip">City, State, ZIP</label>
          <input {...register('lender.cityStateZip')} type="text" />
          {errors.lender?.cityStateZip && <div className="error">{errors.lender.cityStateZip.message}</div>}
        </div>

        <div className="button-group">
          <button
            type="button"
            onClick={handleSubmit(onPreviewSubmit)}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            {isLoading ? (
              <div className="loading">
                <div className="spinner"></div>
                Generating Preview...
              </div>
            ) : (
              'Preview PDF'
            )}
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <div className="loading">
                <div className="spinner"></div>
                Creating Policy...
              </div>
            ) : (
              'Create Policy'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PolicyForm;

