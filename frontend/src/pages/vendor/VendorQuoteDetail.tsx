import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import listingService from '../../services/listingService';
import { ROUTES } from '../../config/routes';
import type { Quote } from '../../types/listings';

const VendorQuoteDetail: React.FC = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quoteId) {
      loadQuote();
    }
  }, [quoteId]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingService.getQuote(parseInt(quoteId!));
      setQuote(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!quote || !confirm('Are you sure you want to withdraw this quote? This action cannot be undone.')) {
      return;
    }

    try {
      await listingService.withdrawQuote(quote.id);
      navigate(ROUTES.PROTECTED.VENDOR.QUOTES);
      navigate(ROUTES.PROTECTED.VENDOR.QUOTES);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to withdraw quote');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-900/50 text-blue-300';
      case 'under_review': return 'bg-yellow-900/50 text-yellow-300';
      case 'accepted': return 'bg-green-900/50 text-green-300';
      case 'rejected': return 'bg-red-900/50 text-red-300';
      case 'withdrawn': return 'bg-gray-900/50 text-gray-300';
      default: return 'bg-gray-900/50 text-gray-300';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (user?.current_profile_type !== 'vendor') {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-4">Only vendors can view quote details. Please switch to a vendor profile.</p>
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

  if (error || !quote) {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-4">{error || 'Quote not found'}</p>
          <Link
            to={ROUTES.PROTECTED.VENDOR.QUOTES}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Back to Quotes
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link
                to={ROUTES.PROTECTED.VENDOR.QUOTES}
                className="text-blue-300 hover:text-blue-100"
              >
                ← Back to Quotes
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Quote #{quote.quote_number}
            </h1>
            <p className="text-blue-300">
              For listing: <Link
                to={ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':listingId', String(quote.listing.id))}
                className="text-blue-300 hover:text-blue-100 font-medium underline"
              >
                {quote.listing?.title || 'Unknown Listing'}
              </Link>
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-green-300 mb-2">
              {formatCurrency(quote.quoted_price)}
            </div>
            <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(quote.status)}`}>
              <span className={`inline-block h-2 w-2 rounded-full mr-2 ${quote.status === 'accepted' ? 'bg-green-500' :
                quote.status === 'rejected' ? 'bg-red-500' :
                  quote.status === 'under_review' ? 'bg-yellow-500' :
                    quote.status === 'withdrawn' ? 'bg-gray-500' : 'bg-blue-500'
                }`}></span>
              {quote.status?.replace('_', ' ').toUpperCase() || quote.status}
            </span>
          </div>
        </div>

        {/* Global Actions */}
        {quote.status === 'submitted' && (
          <div className="flex flex-wrap gap-4 px-6 py-4 bg-white/2 border border-white/5 rounded-[32px] backdrop-blur-sm">
            <Link
              to={ROUTES.PROTECTED.VENDOR.QUOTES_EDIT.replace(':quoteId', String(quote.id))}
              to={ROUTES.PROTECTED.VENDOR.QUOTES_EDIT.replace(':quoteId', String(quote.id))}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Modify Protocol
            </Link>
            <button
              onClick={handleWithdraw}
              className="px-8 py-4 bg-white/5 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-premium text-center"
            >
              Terminate Transmission
            </button>
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] backdrop-blur-md overflow-hidden relative">
            <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
            <p className="relative z-10 text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quote Details */}
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quote Details</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">Delivery Time</label>
                    <p className="text-white font-medium">{quote.delivery_days} days</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Valuation lock</p>
                    <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-emerald-500 font-black uppercase text-sm tracking-widest">
                      {formatCurrency(quote.quoted_price)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Proposal Synthesis</label>
                  <div className="bg-white/5 border border-white/10 rounded-[28px] p-8 leading-relaxed">
                    <p className="text-gray-300 font-medium whitespace-pre-wrap selection:bg-indigo-500/30">{quote.proposal_details}</p>
                  </div>
                </div>

                {quote.terms_and_conditions && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Legal Protocol & Terms</label>
                    <div className="bg-white/5 border border-white/10 rounded-[28px] p-8 leading-relaxed italic opacity-80">
                      <p className="text-gray-400 font-medium whitespace-pre-wrap text-sm">{quote.terms_and_conditions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Matrix of items */}
            {quote.line_items && quote.line_items.length > 0 && (
              <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Line Items</h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-700/30">
                        <th className="text-left text-blue-200 font-medium py-2">Description</th>
                        <th className="text-right text-blue-200 font-medium py-2">Quantity</th>
                        <th className="text-right text-blue-200 font-medium py-2">Unit Price</th>
                        <th className="text-right text-blue-200 font-medium py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-700/20">
                      {quote.line_items.map((item, index) => (
                        <tr key={index}>
                          <td className="text-blue-100 py-3">
                            <div>
                              <p className="font-medium">{item.description}</p>
                              {item.specifications && (
                                <p className="text-sm text-blue-300 mt-1">{item.specifications}</p>
                              )}
                            </div>
                          </td>
                          <td className="text-right text-blue-100 py-3">{item.quantity}</td>
                          <td className="text-right text-blue-100 py-3">{formatCurrency(item.unit_price)}</td>
                          <td className="text-right text-blue-100 py-3 font-medium">
                            {formatCurrency(item.total_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-blue-700/50">
                      <tr>
                        <td colSpan={3} className="text-right text-blue-200 font-medium py-3">Total:</td>
                        <td className="text-right text-green-300 font-bold py-3 text-lg">
                          {formatCurrency(quote.quoted_price)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Feedback from Mesh */}
            {quote.review_notes && (
              <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-yellow-200 mb-4">Review Notes</h2>
                <p className="text-yellow-100 whitespace-pre-wrap">{quote.review_notes}</p>
                {quote.reviewed_by_user && quote.reviewed_at && (
                  <p className="text-sm text-yellow-300 mt-3">
                    Reviewed by {quote.reviewed_by_user?.name || 'Admin'} on {formatDate(quote.reviewed_at)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quote Timeline */}
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-blue-100 font-medium">Quote Submitted</p>
                    <p className="text-blue-300 text-sm">{formatDate(quote.submitted_at)}</p>
                  </div>
                </div>


                {quote.reviewed_at && (
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${quote.status === 'accepted' ? 'bg-green-500' :
                      quote.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                    <div>
                      <p className="text-blue-100 font-medium">Quote Reviewed</p>
                      <p className="text-blue-300 text-sm">{formatDate(quote.reviewed_at)}</p>
                      <p className="text-blue-400 text-xs">by {quote.reviewed_by_user?.name}</p>
                    </div>
                  </div>
                )}

                {quote.expires_at && (
                  <div className="relative flex items-start gap-4">
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-glow-red mt-1.5 flex-shrink-0 z-10 border-4 border-slate-900" />
                    <div className="space-y-1">
                      <p className="text-white font-black text-[10px] uppercase tracking-widest">Temporal Threshold</p>
                      <p className="text-gray-500 font-medium text-[10px] uppercase">{formatDate(quote.expires_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Listing Info */}
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Listing Information</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">Company</label>
                  <p className="text-white">{quote.listing?.company?.name || 'Unknown Company'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">Title</label>
                  <p className="text-white">{quote.listing?.title || 'Unknown Listing'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">Status</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${quote.listing.status === 'active' ? 'bg-green-900/50 text-green-300' :
                    quote.listing.status === 'closed' ? 'bg-red-900/50 text-red-300' :
                      'bg-gray-900/50 text-gray-300'
                    }`}>
                    {quote.listing?.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>

                {quote.listing.closes_at && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Temporal Close</p>
                    <p className="text-gray-300 font-medium text-[10px] uppercase">
                      {formatDate(quote.listing.closes_at)}
                    </p>
                  </div>
                )}


                <Link
                  to={ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':listingId', String(quote.listing.id))}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium mt-3"
                >
                  Registry Archive
                </Link>
              </div>
            </div>

            {/* Company Contact Info */}
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Company Information</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">Company Name</label>
                  <p className="text-white">{quote.listing?.company?.name || 'Unknown Company'}</p>
                </div>


                {quote.listing.company.description && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Core synthesis</p>
                    <p className="text-gray-500 font-medium text-xs leading-relaxed italic line-clamp-4">{quote.listing.company.description}</p>
                  </div>
                )}


                {quote.listing.company.website && (
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">Website</label>
                    <a
                      href={quote.listing.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest border-b border-indigo-500/20 block truncate"
                    >
                      {quote.listing.company.website.replace('https://', '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorQuoteDetail;
