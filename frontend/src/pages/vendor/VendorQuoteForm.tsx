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
        navigate(ROUTES.PROTECTED.VENDOR.QUOTES_DETAIL.replace(':quoteId', String(quote.id)));
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
      <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
          <div className="space-y-4">
            <Link
              to={mode === 'edit'
                ? ROUTES.PROTECTED.VENDOR.QUOTES_DETAIL.replace(':quoteId', String(quote?.id))
                : ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':id', String(listing.id))}
              className="group flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
              Return to Protocol
            </Link>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">
              {mode === 'create' ? 'Initialize' : 'Modify'} <span className="text-emerald-500">Protocol Bid</span>
            </h1>
            <p className="text-gray-400 font-medium">
              TARGET: <span className="text-white font-bold">{listing.title}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl backdrop-blur-md">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">{error}</p>
          </div>
        )}

        {/* Listing Summary Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-10 shadow-premium relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50" />
          <div className="relative z-10">
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-10 px-3 border-l-2 border-indigo-500">Source Protocol Data</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Client Entity</p>
                <p className="text-white font-black uppercase text-lg">{listing.company.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Deployment Class</p>
                <p className="text-white font-black uppercase text-lg">{listing.category}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Contract Window</p>
                <p className="text-indigo-400 font-black uppercase text-lg">
                  {listing.closes_at ? new Date(listing.closes_at).toLocaleDateString() : 'PERSISTENT'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Scope parameters</p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <p className="text-gray-300 font-medium leading-relaxed">{listing.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Input Form */}
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Main Bid Parameters */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-10 shadow-premium relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50" />
            <div className="relative z-10">
              <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-10 px-3 border-l-2 border-emerald-500">Bid Logic Configuration</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
                    Fulfillment Latency (Days) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.delivery_days}
                    onChange={(e) => handleInputChange('delivery_days', parseInt(e.target.value) || 0)}
                    className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium backdrop-blur-sm"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
                    Offer Expiration Vector
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => handleInputChange('expires_at', e.target.value)}
                    className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="space-y-3 mb-10">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
                  Technical Proposal Narrative <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={8}
                  value={formData.proposal_details}
                  onChange={(e) => handleInputChange('proposal_details', e.target.value)}
                  placeholder="Detail your operational approach and capability alignment..."
                  className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium backdrop-blur-sm resize-none"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
                  Stipulations & Constraints (Optional)
                </label>
                <textarea
                  rows={4}
                  value={formData.terms_and_conditions}
                  onChange={(e) => handleInputChange('terms_and_conditions', e.target.value)}
                  placeholder="Define specific service level agreements or payment protocols..."
                  className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium backdrop-blur-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Line Item Matrix */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-10 shadow-premium relative overflow-hidden">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
              <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] px-3 border-l-2 border-indigo-500">Financial Matrix</h2>
              <button
                type="button"
                onClick={addLineItem}
                className="group px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-3"
              >
                <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                Inject Line Item
              </button>
            </div>

            <div className="space-y-6">
              {lineItems.map((item, index) => (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-3xl p-8 relative group/item hover:bg-white/[0.08] transition-all duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                    <div className="lg:col-span-5 space-y-3">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Service Component</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                        placeholder="Component identifier..."
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                      />
                    </div>

                    <div className="lg:col-span-2 space-y-3">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                      />
                    </div>

                    <div className="lg:col-span-2 space-y-3">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Unit Valuation</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                      />
                    </div>

                    <div className="lg:col-span-3 space-y-3">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Total Vector</label>
                      <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-emerald-500 font-black text-xl shadow-inner backdrop-blur-sm">
                        {formatCurrency(item.total_price)}
                      </div>
                    </div>
                  </div>

                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="absolute -top-3 -right-3 w-10 h-10 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-glow-primary"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Aggregate Bid Valuation</p>
                <p className="text-4xl font-black text-emerald-500 tracking-tighter shadow-glow-primary inline-block bg-white/5 px-6 py-2 rounded-2xl">
                  {formatCurrency(formData.quoted_price || 0)}
                </p>
              </div>

              <div className="flex gap-6">
                <Link
                  to={mode === 'edit'
                    ? ROUTES.PROTECTED.VENDOR.QUOTES_DETAIL.replace(':quoteId', String(quote?.id))
                    : ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':id', String(listing.id))}
                  className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Abort Protocol
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-12 py-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-glow-primary hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {saving ? 'Transmitting...' : (mode === 'create' ? 'Transmit Protocol Bid' : 'Synchronize Modification')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default VendorQuoteForm;
