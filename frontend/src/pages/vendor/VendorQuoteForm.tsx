import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import listingService from '../../services/listingService';
import { ROUTES } from '../../config/routes';
import type { Quote, Listing, CreateQuoteData, UpdateQuoteData, LineItem } from '../../types/listings';

interface VendorQuoteFormProps {
  mode: 'create' | 'edit';
}

const VendorQuoteForm: React.FC<VendorQuoteFormProps> = ({ mode }) => {
  const { listingId, quoteId } = useParams<{ listingId: string; quoteId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateQuoteData | UpdateQuoteData>({
    listing_id: parseInt(listingId || '0'),
    quoted_price: 0,
    proposal_details: '',
    delivery_days: 30,
    terms_and_conditions: '',
    line_items: [],
    expires_at: ''
  });
  
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, total_price: 0 }
  ]);

  useEffect(() => {
    loadData();
  }, [listingId, quoteId, mode]);

  useEffect(() => {
    // Calculate total price when line items change
    const total = lineItems.reduce((sum, item) => sum + item.total_price, 0);
    setFormData(prev => ({ ...prev, quoted_price: total }));
  }, [lineItems]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load listing
      const listingResponse = await listingService.getListing(parseInt(listingId!));
      setListing(listingResponse.data);
      
      // If editing, load existing quote
      if (mode === 'edit' && quoteId) {
        const quoteResponse = await listingService.getQuote(parseInt(quoteId));
        const quoteData = quoteResponse.data;
        setQuote(quoteData);
        
        setFormData({
          quoted_price: quoteData.quoted_price,
          proposal_details: quoteData.proposal_details,
          delivery_days: quoteData.delivery_days,
          terms_and_conditions: quoteData.terms_and_conditions || '',
          line_items: quoteData.line_items || [],
          expires_at: quoteData.expires_at ? new Date(quoteData.expires_at).toISOString().slice(0, 16) : ''
        });
        
        if (quoteData.line_items && quoteData.line_items.length > 0) {
          setLineItems(quoteData.line_items);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to load ${mode === 'edit' ? 'quote' : 'listing'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
    const newLineItems = [...lineItems];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    
    // Recalculate total price for this line item
    if (field === 'quantity' || field === 'unit_price') {
      newLineItems[index].total_price = newLineItems[index].quantity * newLineItems[index].unit_price;
    }
    
    setLineItems(newLineItems);
  };

  const addLineItem = () => {
    setLineItems(prev => [
      ...prev,
      { id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, total_price: 0 }
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.proposal_details?.trim()) {
      setError('Proposal details are required');
      return;
    }
    
    if ((formData.quoted_price || 0) <= 0) {
      setError('Quoted price must be greater than 0');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const submitData = {
        ...formData,
        line_items: lineItems.filter(item => item.description.trim()),
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : undefined
      };
      
      if (mode === 'create') {
        await listingService.createQuote(submitData as CreateQuoteData);
        navigate(ROUTES.PROTECTED.VENDOR.QUOTES);
      } else if (quote) {
        await listingService.updateQuote(quote.id, submitData as UpdateQuoteData);
        navigate(`/dashboard/vendor/quotes/${quote.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${mode} quote`);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (user?.current_profile_type !== 'vendor') {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-4">Only vendors can submit quotes. Please switch to a vendor profile.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!listing) {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-4">Listing not found</p>
          <Link
            to={ROUTES.PROTECTED.VENDOR.LISTINGS}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Back to Listings
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link
                to={mode === 'edit' ? `/dashboard/vendor/quotes/${quote?.id}` : `/dashboard/vendor/listings/${listing.id}`}
                className="text-blue-300 hover:text-blue-100"
              >
                ← Back
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {mode === 'create' ? 'Submit Quote' : 'Edit Quote'}
            </h1>
            <p className="text-blue-300">
              For: <span className="font-medium">{listing.title}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Listing Summary */}
        <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Listing Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Company</label>
              <p className="text-white">{listing.company.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Category</label>
              <p className="text-white">{listing.category}</p>
            </div>
            {listing.base_price && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Base Price</label>
                <p className="text-white">{formatCurrency(listing.base_price)}</p>
              </div>
            )}
            {listing.closes_at && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Closes</label>
                <p className="text-white">{new Date(listing.closes_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Description</label>
            <div className="bg-blue-800/20 border border-blue-700/30 rounded-lg p-4">
              <p className="text-blue-100">{listing.description}</p>
            </div>
          </div>

          {listing.requirements && listing.requirements.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-blue-200 mb-2">Requirements</label>
              <ul className="list-disc list-inside space-y-1">
                {listing.requirements.map((req, index) => (
                  <li key={index} className="text-blue-100 text-sm">{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Quote Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Quote Info */}
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quote Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Delivery Time (Days) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.delivery_days}
                  onChange={(e) => handleInputChange('delivery_days', parseInt(e.target.value) || 0)}
                  className="w-full p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Quote Expires (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => handleInputChange('expires_at', e.target.value)}
                  className="w-full p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Proposal Details <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={6}
                value={formData.proposal_details}
                onChange={(e) => handleInputChange('proposal_details', e.target.value)}
                placeholder="Describe your proposal, approach, and how you'll fulfill the requirements..."
                className="w-full p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Terms & Conditions (Optional)
              </label>
              <textarea
                rows={4}
                value={formData.terms_and_conditions}
                onChange={(e) => handleInputChange('terms_and_conditions', e.target.value)}
                placeholder="Any specific terms, conditions, or payment requirements..."
                className="w-full p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Line Items</h2>
              <button
                type="button"
                onClick={addLineItem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
              >
                Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={item.id} className="bg-blue-800/20 border border-blue-700/30 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-blue-200 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                        placeholder="Item description..."
                        className="w-full p-2 bg-blue-800/30 border border-blue-700/50 rounded text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full p-2 bg-blue-800/30 border border-blue-700/50 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">Unit Price</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-blue-800/30 border border-blue-700/50 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-1">Total</label>
                      <div className="p-2 bg-blue-800/50 border border-blue-700/50 rounded text-white">
                        {formatCurrency(item.total_price)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-blue-200 mb-1">Specifications (Optional)</label>
                    <input
                      type="text"
                      value={item.specifications || ''}
                      onChange={(e) => handleLineItemChange(index, 'specifications', e.target.value)}
                      placeholder="Additional specifications or details..."
                      className="w-full p-2 bg-blue-800/30 border border-blue-700/50 rounded text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="text-red-300 hover:text-red-100 text-sm font-medium"
                    >
                      Remove Item
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-blue-700/30">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-blue-200">Total Quote Price:</span>
                <span className="text-2xl font-bold text-green-300">
                  {formatCurrency(formData.quoted_price || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Link
              to={mode === 'edit' ? `/dashboard/vendor/quotes/${quote?.id}` : `/dashboard/vendor/listings/${listing.id}`}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium"
            >
              {saving ? 'Saving...' : (mode === 'create' ? 'Submit Quote' : 'Update Quote')}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default VendorQuoteForm;
