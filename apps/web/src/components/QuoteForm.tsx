import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Quote form schema
const QuoteFormSchema = z.object({
  quoteNumber: z.string().min(1, 'Quote number is required'),
  productVersion: z.string().min(1, 'Product version is required'),
  stateCode: z.string().length(2, 'State code must be 2 characters'),
  
  // Owner info
  owner: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().length(2, 'State must be 2 characters'),
    zip: z.string().min(5, 'ZIP code must be at least 5 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    email: z.string().email('Valid email is required')
  }),
  
  // Dealer info
  dealer: z.object({
    id: z.string().min(1, 'Dealer ID is required'),
    name: z.string().min(1, 'Dealer name is required'),
    address: z.string().min(1, 'Dealer address is required'),
    city: z.string().min(1, 'Dealer city is required'),
    state: z.string().length(2, 'Dealer state must be 2 characters'),
    zip: z.string().min(5, 'Dealer ZIP must be at least 5 characters'),
    phone: z.string().min(10, 'Dealer phone must be at least 10 characters'),
    salesRep: z.string().min(1, 'Sales rep is required')
  }),
  
  // Vehicle info
  vehicle: z.object({
    vin: z.string().min(17, 'VIN must be 17 characters'),
    year: z.string().min(4, 'Year must be 4 digits'),
    make: z.string().min(1, 'Make is required'),
    model: z.string().min(1, 'Model is required'),
    mileage: z.number().min(0, 'Mileage must be positive'),
    salePrice: z.number().min(0, 'Sale price must be positive')
  }),
  
  // Coverage info
  coverage: z.object({
    termMonths: z.number().min(1, 'Term months must be positive'),
    commercial: z.boolean(),
    contractPrice: z.number().min(0, 'Contract price must be positive'),
    purchaseDate: z.string().min(1, 'Purchase date is required'),
    expirationDate: z.string().min(1, 'Expiration date is required')
  }),
  
  // Lender info
  lender: z.object({
    name: z.string().min(1, 'Lender name is required'),
    address: z.string().min(1, 'Lender address is required'),
    cityStateZip: z.string().min(1, 'Lender city/state/zip is required')
  }),
  
  // Pricing info
  pricing: z.object({
    basePrice: z.number().min(0, 'Base price must be positive'),
    options: z.array(z.object({
      name: z.string(),
      amount: z.number()
    })).default([]),
    fees: z.array(z.object({
      name: z.string(),
      amount: z.number()
    })).default([]),
    taxes: z.number().min(0, 'Taxes must be positive'),
    dealerMarkup: z.number().min(0, 'Dealer markup must be positive'),
    subtotal: z.number().min(0, 'Subtotal must be positive'),
    total: z.number().min(0, 'Total must be positive')
  }),
  
  issueDate: z.string().min(1, 'Issue date is required'),
  validUntil: z.string().min(1, 'Valid until date is required')
});

type QuoteFormData = z.infer<typeof QuoteFormSchema>;

interface QuoteFormProps {
  onSubmit: (data: QuoteFormData) => void;
  isLoading: boolean;
}

// Generate a unique quote number
const generateUniqueQuoteNumber = () => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `Q${year}-${timestamp}-${random}`;
};

const QuoteForm: React.FC<QuoteFormProps> = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<QuoteFormData>({
    resolver: zodResolver(QuoteFormSchema),
    defaultValues: {
      quoteNumber: generateUniqueQuoteNumber(),
      productVersion: 'WEC-PS-VSC-09-2025',
      stateCode: 'FL',
      owner: {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'Tampa',
        state: 'FL',
        zip: '33602',
        phone: '8135551234',
        email: 'john@example.com'
      },
      dealer: {
        id: 'DEALER001',
        name: 'Test Dealer',
        address: '456 Dealer Blvd',
        city: 'Tampa',
        state: 'FL',
        zip: '33603',
        phone: '8135555678',
        salesRep: 'Jane Smith'
      },
      vehicle: {
        vin: '1HGBH41JXMN109186',
        year: '2020',
        make: 'Honda',
        model: 'Civic',
        mileage: 25000,
        salePrice: 18000
      },
      coverage: {
        termMonths: 72,
        commercial: false,
        contractPrice: 2500,
        purchaseDate: '2025-10-20',
        expirationDate: '2031-10-20'
      },
      lender: {
        name: 'Test Bank',
        address: '789 Bank St',
        cityStateZip: 'Tampa, FL 33604'
      },
      pricing: {
        basePrice: 2000,
        options: [
          { name: 'Roadside Assistance', amount: 150 },
          { name: 'Rental Car', amount: 100 },
          { name: 'Trip Interruption', amount: 75 }
        ],
        fees: [
          { name: 'Processing Fee', amount: 50 },
          { name: 'Documentation Fee', amount: 25 }
        ],
        taxes: 200,
        dealerMarkup: 500,
        subtotal: 3000,
        total: 3200
      },
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  });

  const watchedPricing = watch('pricing');

  const addOption = () => {
    const currentOptions = watchedPricing.options || [];
    setValue('pricing.options', [...currentOptions, { name: '', amount: 0 }]);
  };

  const removeOption = (index: number) => {
    const currentOptions = watchedPricing.options || [];
    setValue('pricing.options', currentOptions.filter((_, i) => i !== index));
  };

  const addFee = () => {
    const currentFees = watchedPricing.fees || [];
    setValue('pricing.fees', [...currentFees, { name: '', amount: 0 }]);
  };

  const removeFee = (index: number) => {
    const currentFees = watchedPricing.fees || [];
    setValue('pricing.fees', currentFees.filter((_, i) => i !== index));
  };

  return (
    <div className="quote-form">
      <h2>Quote Generator</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        
        {/* Basic Info */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Quote Number</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input {...register('quoteNumber')} style={{ flex: 1 }} />
                <button 
                  type="button" 
                  onClick={() => setValue('quoteNumber', generateUniqueQuoteNumber())}
                  style={{ 
                    padding: '8px 12px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  New
                </button>
              </div>
              {errors.quoteNumber && <span className="error">{errors.quoteNumber.message}</span>}
            </div>
            <div className="form-group">
              <label>Product Version</label>
              <select {...register('productVersion')}>
                <option value="WEC-PS-VSC-09-2025">PSVSC 09-2025</option>
                <option value="AGVSC-LIFETIME-V04-2025">Lifetime Warranty V04-2025</option>
              </select>
              {errors.productVersion && <span className="error">{errors.productVersion.message}</span>}
            </div>
            <div className="form-group">
              <label>State Code</label>
              <select {...register('stateCode')}>
                <option value="AL">AL - Alabama</option>
                <option value="AK">AK - Alaska</option>
                <option value="AZ">AZ - Arizona</option>
                <option value="AR">AR - Arkansas</option>
                <option value="CA">CA - California</option>
                <option value="CO">CO - Colorado</option>
                <option value="CT">CT - Connecticut</option>
                <option value="DE">DE - Delaware</option>
                <option value="FL" selected>FL - Florida</option>
                <option value="GA">GA - Georgia</option>
                <option value="HI">HI - Hawaii</option>
                <option value="ID">ID - Idaho</option>
                <option value="IL">IL - Illinois</option>
                <option value="IN">IN - Indiana</option>
                <option value="IA">IA - Iowa</option>
                <option value="KS">KS - Kansas</option>
                <option value="KY">KY - Kentucky</option>
                <option value="LA">LA - Louisiana</option>
                <option value="ME">ME - Maine</option>
                <option value="MD">MD - Maryland</option>
                <option value="MA">MA - Massachusetts</option>
                <option value="MI">MI - Michigan</option>
                <option value="MN">MN - Minnesota</option>
                <option value="MS">MS - Mississippi</option>
                <option value="MO">MO - Missouri</option>
                <option value="MT">MT - Montana</option>
                <option value="NE">NE - Nebraska</option>
                <option value="NV">NV - Nevada</option>
                <option value="NH">NH - New Hampshire</option>
                <option value="NJ">NJ - New Jersey</option>
                <option value="NM">NM - New Mexico</option>
                <option value="NY">NY - New York</option>
                <option value="NC">NC - North Carolina</option>
                <option value="ND">ND - North Dakota</option>
                <option value="OH">OH - Ohio</option>
                <option value="OK">OK - Oklahoma</option>
                <option value="OR">OR - Oregon</option>
                <option value="PA">PA - Pennsylvania</option>
                <option value="RI">RI - Rhode Island</option>
                <option value="SC">SC - South Carolina</option>
                <option value="SD">SD - South Dakota</option>
                <option value="TN">TN - Tennessee</option>
                <option value="TX">TX - Texas</option>
                <option value="UT">UT - Utah</option>
                <option value="VT">VT - Vermont</option>
                <option value="VA">VA - Virginia</option>
                <option value="WA">WA - Washington</option>
                <option value="WV">WV - West Virginia</option>
                <option value="WI">WI - Wisconsin</option>
                <option value="WY">WY - Wyoming</option>
              </select>
              {errors.stateCode && <span className="error">{errors.stateCode.message}</span>}
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div className="form-section">
          <h3>Owner Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input {...register('owner.firstName')} />
              {errors.owner?.firstName && <span className="error">{errors.owner.firstName.message}</span>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input {...register('owner.lastName')} />
              {errors.owner?.lastName && <span className="error">{errors.owner.lastName.message}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Address</label>
              <input {...register('owner.address')} />
              {errors.owner?.address && <span className="error">{errors.owner.address.message}</span>}
            </div>
            <div className="form-group">
              <label>City</label>
              <input {...register('owner.city')} />
              {errors.owner?.city && <span className="error">{errors.owner.city.message}</span>}
            </div>
            <div className="form-group">
              <label>State</label>
              <select {...register('owner.state')}>
                <option value="AL">AL - Alabama</option>
                <option value="AK">AK - Alaska</option>
                <option value="AZ">AZ - Arizona</option>
                <option value="AR">AR - Arkansas</option>
                <option value="CA">CA - California</option>
                <option value="CO">CO - Colorado</option>
                <option value="CT">CT - Connecticut</option>
                <option value="DE">DE - Delaware</option>
                <option value="FL" selected>FL - Florida</option>
                <option value="GA">GA - Georgia</option>
                <option value="HI">HI - Hawaii</option>
                <option value="ID">ID - Idaho</option>
                <option value="IL">IL - Illinois</option>
                <option value="IN">IN - Indiana</option>
                <option value="IA">IA - Iowa</option>
                <option value="KS">KS - Kansas</option>
                <option value="KY">KY - Kentucky</option>
                <option value="LA">LA - Louisiana</option>
                <option value="ME">ME - Maine</option>
                <option value="MD">MD - Maryland</option>
                <option value="MA">MA - Massachusetts</option>
                <option value="MI">MI - Michigan</option>
                <option value="MN">MN - Minnesota</option>
                <option value="MS">MS - Mississippi</option>
                <option value="MO">MO - Missouri</option>
                <option value="MT">MT - Montana</option>
                <option value="NE">NE - Nebraska</option>
                <option value="NV">NV - Nevada</option>
                <option value="NH">NH - New Hampshire</option>
                <option value="NJ">NJ - New Jersey</option>
                <option value="NM">NM - New Mexico</option>
                <option value="NY">NY - New York</option>
                <option value="NC">NC - North Carolina</option>
                <option value="ND">ND - North Dakota</option>
                <option value="OH">OH - Ohio</option>
                <option value="OK">OK - Oklahoma</option>
                <option value="OR">OR - Oregon</option>
                <option value="PA">PA - Pennsylvania</option>
                <option value="RI">RI - Rhode Island</option>
                <option value="SC">SC - South Carolina</option>
                <option value="SD">SD - South Dakota</option>
                <option value="TN">TN - Tennessee</option>
                <option value="TX">TX - Texas</option>
                <option value="UT">UT - Utah</option>
                <option value="VT">VT - Vermont</option>
                <option value="VA">VA - Virginia</option>
                <option value="WA">WA - Washington</option>
                <option value="WV">WV - West Virginia</option>
                <option value="WI">WI - Wisconsin</option>
                <option value="WY">WY - Wyoming</option>
              </select>
              {errors.owner?.state && <span className="error">{errors.owner.state.message}</span>}
            </div>
            <div className="form-group">
              <label>ZIP</label>
              <input {...register('owner.zip')} />
              {errors.owner?.zip && <span className="error">{errors.owner.zip.message}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input {...register('owner.phone')} />
              {errors.owner?.phone && <span className="error">{errors.owner.phone.message}</span>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" {...register('owner.email')} />
              {errors.owner?.email && <span className="error">{errors.owner.email.message}</span>}
            </div>
          </div>
        </div>

        {/* Dealer Information */}
        <div className="form-section">
          <h3>Dealer Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Dealer ID</label>
              <input {...register('dealer.id')} />
              {errors.dealer?.id && <span className="error">{errors.dealer.id.message}</span>}
            </div>
            <div className="form-group">
              <label>Dealer Name</label>
              <input {...register('dealer.name')} />
              {errors.dealer?.name && <span className="error">{errors.dealer.name.message}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Address</label>
              <input {...register('dealer.address')} />
              {errors.dealer?.address && <span className="error">{errors.dealer.address.message}</span>}
            </div>
            <div className="form-group">
              <label>City</label>
              <input {...register('dealer.city')} />
              {errors.dealer?.city && <span className="error">{errors.dealer.city.message}</span>}
            </div>
            <div className="form-group">
              <label>State</label>
              <select {...register('dealer.state')}>
                <option value="AL">AL - Alabama</option>
                <option value="AK">AK - Alaska</option>
                <option value="AZ">AZ - Arizona</option>
                <option value="AR">AR - Arkansas</option>
                <option value="CA">CA - California</option>
                <option value="CO">CO - Colorado</option>
                <option value="CT">CT - Connecticut</option>
                <option value="DE">DE - Delaware</option>
                <option value="FL" selected>FL - Florida</option>
                <option value="GA">GA - Georgia</option>
                <option value="HI">HI - Hawaii</option>
                <option value="ID">ID - Idaho</option>
                <option value="IL">IL - Illinois</option>
                <option value="IN">IN - Indiana</option>
                <option value="IA">IA - Iowa</option>
                <option value="KS">KS - Kansas</option>
                <option value="KY">KY - Kentucky</option>
                <option value="LA">LA - Louisiana</option>
                <option value="ME">ME - Maine</option>
                <option value="MD">MD - Maryland</option>
                <option value="MA">MA - Massachusetts</option>
                <option value="MI">MI - Michigan</option>
                <option value="MN">MN - Minnesota</option>
                <option value="MS">MS - Mississippi</option>
                <option value="MO">MO - Missouri</option>
                <option value="MT">MT - Montana</option>
                <option value="NE">NE - Nebraska</option>
                <option value="NV">NV - Nevada</option>
                <option value="NH">NH - New Hampshire</option>
                <option value="NJ">NJ - New Jersey</option>
                <option value="NM">NM - New Mexico</option>
                <option value="NY">NY - New York</option>
                <option value="NC">NC - North Carolina</option>
                <option value="ND">ND - North Dakota</option>
                <option value="OH">OH - Ohio</option>
                <option value="OK">OK - Oklahoma</option>
                <option value="OR">OR - Oregon</option>
                <option value="PA">PA - Pennsylvania</option>
                <option value="RI">RI - Rhode Island</option>
                <option value="SC">SC - South Carolina</option>
                <option value="SD">SD - South Dakota</option>
                <option value="TN">TN - Tennessee</option>
                <option value="TX">TX - Texas</option>
                <option value="UT">UT - Utah</option>
                <option value="VT">VT - Vermont</option>
                <option value="VA">VA - Virginia</option>
                <option value="WA">WA - Washington</option>
                <option value="WV">WV - West Virginia</option>
                <option value="WI">WI - Wisconsin</option>
                <option value="WY">WY - Wyoming</option>
              </select>
              {errors.dealer?.state && <span className="error">{errors.dealer.state.message}</span>}
            </div>
            <div className="form-group">
              <label>ZIP</label>
              <input {...register('dealer.zip')} />
              {errors.dealer?.zip && <span className="error">{errors.dealer.zip.message}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input {...register('dealer.phone')} />
              {errors.dealer?.phone && <span className="error">{errors.dealer.phone.message}</span>}
            </div>
            <div className="form-group">
              <label>Sales Rep</label>
              <input {...register('dealer.salesRep')} />
              {errors.dealer?.salesRep && <span className="error">{errors.dealer.salesRep.message}</span>}
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="form-section">
          <h3>Vehicle Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>VIN</label>
              <input {...register('vehicle.vin')} maxLength={17} />
              {errors.vehicle?.vin && <span className="error">{errors.vehicle.vin.message}</span>}
            </div>
            <div className="form-group">
              <label>Year</label>
              <input {...register('vehicle.year')} maxLength={4} />
              {errors.vehicle?.year && <span className="error">{errors.vehicle.year.message}</span>}
            </div>
            <div className="form-group">
              <label>Make</label>
              <input {...register('vehicle.make')} />
              {errors.vehicle?.make && <span className="error">{errors.vehicle.make.message}</span>}
            </div>
            <div className="form-group">
              <label>Model</label>
              <input {...register('vehicle.model')} />
              {errors.vehicle?.model && <span className="error">{errors.vehicle.model.message}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Mileage</label>
              <input type="number" {...register('vehicle.mileage', { valueAsNumber: true })} />
              {errors.vehicle?.mileage && <span className="error">{errors.vehicle.mileage.message}</span>}
            </div>
            <div className="form-group">
              <label>Sale Price</label>
              <input type="number" {...register('vehicle.salePrice', { valueAsNumber: true })} />
              {errors.vehicle?.salePrice && <span className="error">{errors.vehicle.salePrice.message}</span>}
            </div>
          </div>
        </div>

        {/* Coverage Information */}
        <div className="form-section">
          <h3>Coverage Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Term Months</label>
              <select {...register('coverage.termMonths', { valueAsNumber: true })}>
                <option value={72}>72 Months</option>
                <option value={84}>84 Months</option>
                <option value={96}>96 Months</option>
                <option value={120}>120 Months</option>
                <option value={999}>Lifetime</option>
              </select>
              {errors.coverage?.termMonths && <span className="error">{errors.coverage.termMonths.message}</span>}
            </div>
            <div className="form-group">
              <label>Commercial Use</label>
              <input type="checkbox" {...register('coverage.commercial')} />
              {errors.coverage?.commercial && <span className="error">{errors.coverage.commercial.message}</span>}
            </div>
            <div className="form-group">
              <label>Contract Price</label>
              <input type="number" {...register('coverage.contractPrice', { valueAsNumber: true })} />
              {errors.coverage?.contractPrice && <span className="error">{errors.coverage.contractPrice.message}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Purchase Date</label>
              <input type="date" {...register('coverage.purchaseDate')} />
              {errors.coverage?.purchaseDate && <span className="error">{errors.coverage.purchaseDate.message}</span>}
            </div>
            <div className="form-group">
              <label>Expiration Date</label>
              <input type="date" {...register('coverage.expirationDate')} />
              {errors.coverage?.expirationDate && <span className="error">{errors.coverage.expirationDate.message}</span>}
            </div>
          </div>
        </div>

        {/* Lender Information */}
        <div className="form-section">
          <h3>Lender Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Lender Name</label>
              <input {...register('lender.name')} />
              {errors.lender?.name && <span className="error">{errors.lender.name.message}</span>}
            </div>
            <div className="form-group">
              <label>Address</label>
              <input {...register('lender.address')} />
              {errors.lender?.address && <span className="error">{errors.lender.address.message}</span>}
            </div>
            <div className="form-group">
              <label>City, State, ZIP</label>
              <input {...register('lender.cityStateZip')} />
              {errors.lender?.cityStateZip && <span className="error">{errors.lender.cityStateZip.message}</span>}
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="form-section">
          <h3>Pricing Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Base Price</label>
              <input type="number" {...register('pricing.basePrice', { valueAsNumber: true })} />
              {errors.pricing?.basePrice && <span className="error">{errors.pricing.basePrice.message}</span>}
            </div>
            <div className="form-group">
              <label>Taxes</label>
              <input type="number" {...register('pricing.taxes', { valueAsNumber: true })} />
              {errors.pricing?.taxes && <span className="error">{errors.pricing.taxes.message}</span>}
            </div>
            <div className="form-group">
              <label>Dealer Markup</label>
              <input type="number" {...register('pricing.dealerMarkup', { valueAsNumber: true })} />
              {errors.pricing?.dealerMarkup && <span className="error">{errors.pricing.dealerMarkup.message}</span>}
            </div>
            <div className="form-group">
              <label>Subtotal</label>
              <input type="number" {...register('pricing.subtotal', { valueAsNumber: true })} />
              {errors.pricing?.subtotal && <span className="error">{errors.pricing.subtotal.message}</span>}
            </div>
            <div className="form-group">
              <label>Total</label>
              <input type="number" {...register('pricing.total', { valueAsNumber: true })} />
              {errors.pricing?.total && <span className="error">{errors.pricing.total.message}</span>}
            </div>
          </div>

          {/* Options */}
          <div className="form-subsection">
            <h4>Options</h4>
            {watchedPricing.options?.map((_, index) => (
              <div key={index} className="form-row">
                <div className="form-group">
                  <label>Option Name</label>
                  <input {...register(`pricing.options.${index}.name`)} />
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input type="number" {...register(`pricing.options.${index}.amount`, { valueAsNumber: true })} />
                </div>
                <button type="button" onClick={() => removeOption(index)} className="remove-btn">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addOption} className="add-btn">Add Option</button>
          </div>

          {/* Fees */}
          <div className="form-subsection">
            <h4>Fees</h4>
            {watchedPricing.fees?.map((_, index) => (
              <div key={index} className="form-row">
                <div className="form-group">
                  <label>Fee Name</label>
                  <input {...register(`pricing.fees.${index}.name`)} />
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input type="number" {...register(`pricing.fees.${index}.amount`, { valueAsNumber: true })} />
                </div>
                <button type="button" onClick={() => removeFee(index)} className="remove-btn">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addFee} className="add-btn">Add Fee</button>
          </div>
        </div>

        {/* Dates */}
        <div className="form-section">
          <h3>Quote Dates</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Issue Date</label>
              <input type="date" {...register('issueDate')} />
              {errors.issueDate && <span className="error">{errors.issueDate.message}</span>}
            </div>
            <div className="form-group">
              <label>Valid Until</label>
              <input type="date" {...register('validUntil')} />
              {errors.validUntil && <span className="error">{errors.validUntil.message}</span>}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Generating Quote...' : 'Generate Quote'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuoteForm;
