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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to withdraw quote');
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-12 border-b border-white/5">
          <div className="space-y-6">
            <Link
              to="/dashboard/vendor/quotes"
              className="group inline-flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] hover:text-white transition-all underline decoration-gray-800 underline-offset-8 decoration-2 hover:decoration-emerald-500"
            >
              <svg className="h-3 w-3 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
              Bid Archive
            </Link>
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-white tracking-tight uppercase leading-tight">
                Transmission <span className="text-emerald-500">#{quote.quote_number}</span>
              </h1>
              <p className="text-gray-400 font-medium">
                Protocol: <Link
                  to={`/dashboard/vendor/listings/${quote.listing.id}`}
                  className="text-white hover:text-indigo-400 transition-colors uppercase text-sm font-black tracking-widest border-b border-white/10"
                >
                  {quote.listing.title}
                </Link>
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-premium text-center">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Bid Valuation</p>
              <p className="text-3xl font-black text-emerald-500 tracking-tighter shadow-glow-primary">
                {formatCurrency(quote.quoted_price)}
              </p>
            </div>
            <div className={`px-10 py-4 border backdrop-blur-md rounded-2xl shadow-premium flex flex-col items-center gap-1 ${quote.status === 'accepted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
              quote.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                quote.status === 'under_review' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                  'bg-white/5 border-white/10 text-gray-400'
              }`}>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Status Protocol</p>
              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${quote.status === 'accepted' ? 'bg-emerald-500 shadow-glow-primary' :
                  quote.status === 'rejected' ? 'bg-red-500 shadow-glow-red' :
                    quote.status === 'under_review' ? 'bg-amber-500 shadow-glow-amber' : 'bg-gray-500'
                  }`} />
                <span className="text-sm font-black uppercase tracking-[0.2em]">{quote.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        {quote.status === 'submitted' && (
          <div className="flex flex-wrap gap-4 px-6 py-4 bg-white/2 border border-white/5 rounded-[32px] backdrop-blur-sm">
            <Link
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Pane */}
          <div className="lg:col-span-2 space-y-12">
            {/* Quote Manifest */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-10 shadow-premium relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50" />
              <div className="relative z-10 space-y-10">
                <h2 className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.4em] px-3 border-l-2 border-indigo-500">Transmission Manifest</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Lantency Estimate</p>
                    <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-sm tracking-widest">
                      {quote.delivery_days} Solar Days
                    </div>
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
              <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-10 shadow-premium relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50" />
                <div className="relative z-10 space-y-8">
                  <h2 className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.4em] px-3 border-l-2 border-indigo-500">Asset Specification Matrix</h2>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left text-[10px] font-black text-gray-500 uppercase tracking-widest pb-4">Identifier / Spec</th>
                          <th className="text-right text-[10px] font-black text-gray-500 uppercase tracking-widest pb-4">Quant</th>
                          <th className="text-right text-[10px] font-black text-gray-500 uppercase tracking-widest pb-4">Unit Val</th>
                          <th className="text-right text-[10px] font-black text-gray-500 uppercase tracking-widest pb-4">Aggregate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/2">
                        {quote.line_items.map((item, index) => (
                          <tr key={index} className="group/row hover:bg-white/[0.02] transition-colors">
                            <td className="py-6 pr-4">
                              <div className="space-y-1">
                                <p className="text-white font-bold uppercase text-xs tracking-wider">{item.description}</p>
                                {item.specifications && (
                                  <p className="text-[10px] text-gray-500 font-medium line-clamp-1 group-hover/row:text-gray-300 transition-colors">{item.specifications}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-6 text-right text-gray-400 font-black text-xs">{item.quantity}</td>
                            <td className="py-6 text-right text-gray-400 font-bold text-xs">{formatCurrency(item.unit_price)}</td>
                            <td className="py-6 text-right text-white font-black text-xs">{formatCurrency(item.total_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-white/10">
                        <tr>
                          <td colSpan={3} className="text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] py-8">Manifest Valuation Target:</td>
                          <td className="text-right text-2xl font-black text-emerald-500 tracking-tighter shadow-glow-primary py-8">
                            {formatCurrency(quote.quoted_price)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback from Mesh */}
            {quote.review_notes && (
              <div className="p-10 bg-amber-500/5 border border-amber-500/20 rounded-[32px] backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20 text-amber-500">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                </div>
                <div className="relative z-10 space-y-6">
                  <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] px-3 border-l-2 border-amber-500">Review Feedback Synthesis</h2>
                  <p className="text-amber-100 font-medium leading-relaxed italic">{quote.review_notes}</p>
                  {quote.reviewed_by_user && quote.reviewed_at && (
                    <div className="pt-6 border-t border-white/5">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Validated by <span className="text-amber-500/80">{quote.reviewed_by_user.name}</span> on {formatDate(quote.reviewed_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Protocol Archive */}
          <div className="space-y-12">
            {/* Transmission Log */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 shadow-premium relative overflow-hidden group">
              <h3 className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.4em] mb-8 border-l-2 border-indigo-500 px-3">Transmission Log</h3>

              <div className="space-y-8 relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-white/5" />

                <div className="relative flex items-start gap-4">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-glow-primary mt-1.5 flex-shrink-0 z-10 border-4 border-slate-900" />
                  <div className="space-y-1">
                    <p className="text-white font-black text-[10px] uppercase tracking-widest">Submission Initialized</p>
                    <p className="text-gray-500 font-medium text-[10px]">{formatDate(quote.submitted_at)}</p>
                  </div>
                </div>

                {quote.reviewed_at && (
                  <div className="relative flex items-start gap-4">
                    <div className={`w-4 h-4 rounded-full shadow-glow-primary mt-1.5 flex-shrink-0 z-10 border-4 border-slate-900 ${quote.status === 'accepted' ? 'bg-emerald-500 shadow-glow-primary' :
                      quote.status === 'rejected' ? 'bg-red-500 shadow-glow-red' : 'bg-amber-500 shadow-glow-amber'
                      }`} />
                    <div className="space-y-1">
                      <p className="text-white font-black text-[10px] uppercase tracking-widest">Protocol Validated</p>
                      <p className="text-gray-500 font-medium text-[10px]">{formatDate(quote.reviewed_at)}</p>
                      <p className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-tighter">Verified by {quote.reviewed_by_user?.name}</p>
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

            {/* Registry Info */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 shadow-premium space-y-8">
              <h3 className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.4em] border-l-2 border-indigo-500 px-3">Registry Metadata</h3>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Parent Protocol</p>
                  <p className="text-white font-bold uppercase text-sm tracking-wider leading-snug">{quote.listing.title}</p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Target Client</p>
                  <p className="text-gray-300 font-bold uppercase text-xs">{quote.listing.company.name}</p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Registry Status</p>
                  <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${quote.listing.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    quote.listing.status === 'closed' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                      'bg-white/5 border-white/10 text-gray-500'
                    }`}>
                    {quote.listing.status}
                  </div>
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
                  to={`/dashboard/vendor/listings/${quote.listing.id}`}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white hover:text-black transition-all text-center block"
                >
                  Registry Archive
                </Link>
              </div>
            </div>

            {/* Profile Matrix */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 shadow-premium space-y-8">
              <h3 className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.4em] border-l-2 border-indigo-500 px-3">Entity Profile</h3>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Entity Name</p>
                  <p className="text-white font-black uppercase text-sm tracking-widest">{quote.listing.company.name}</p>
                </div>

                {quote.listing.company.description && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Core synthesis</p>
                    <p className="text-gray-500 font-medium text-xs leading-relaxed italic line-clamp-4">{quote.listing.company.description}</p>
                  </div>
                )}

                {quote.listing.company.website && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Protocol Nexus</p>
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
