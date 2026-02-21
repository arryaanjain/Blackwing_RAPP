import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import listingService from '../../services/listingService';
import { ROUTES } from '../../config/routes';
import type { Quote, QuoteFilters, PaginatedResponse } from '../../types/listings';

const VendorQuotesManager: React.FC = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<QuoteFilters>({});

  useEffect(() => {
    loadQuotes();
  }, [currentPage, filters]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingService.getQuotes(filters, currentPage);
      const data: PaginatedResponse<Quote> = response.data;

      setQuotes(data.data);
      setTotalPages(data.last_page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof QuoteFilters, value: any) => {
    setFilters((prev: QuoteFilters) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };


  const handleWithdraw = async (quoteId: number) => {
    if (!confirm('Are you sure you want to withdraw this quote? This action cannot be undone.')) {
      return;
    }

    try {
      await listingService.withdrawQuote(quoteId);
      loadQuotes(); // Reload to reflect changes
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to withdraw quote');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
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
          <p className="text-red-300 mb-4">Only vendors can manage quotes. Please switch to a vendor profile.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white tracking-tight uppercase leading-tight">
              My <span className="text-emerald-500">Protocol Bids</span>
            </h1>
            <p className="text-gray-400 font-medium">Manage and track active procurement transmissions</p>
          </div>
          <Link
            to={ROUTES.PROTECTED.VENDOR.LISTINGS}
            className="group px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all flex items-center gap-3 shadow-premium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Registry Archive
          </Link>
        </div>

        {/* Filter Section */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 shadow-premium relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50" />
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.4em] mb-8 px-3 border-l-2 border-indigo-500">Search Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Transmission Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900">All Protocols</option>
                  <option value="submitted" className="bg-slate-900">Submitted</option>
                  <option value="under_review" className="bg-slate-900">Under Review</option>
                  <option value="accepted" className="bg-slate-900">Accepted</option>
                  <option value="rejected" className="bg-slate-900">Rejected</option>
                  <option value="withdrawn" className="bg-slate-900">Withdrawn</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Registry Identifier</label>
                <input
                  type="number"
                  value={filters.listing_id || ''}
                  onChange={(e) => handleFilterChange('listing_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="ID Number..."
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({});
                    setCurrentPage(1);
                  }}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all border-dashed"
                >
                  Reset Parameters
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] backdrop-blur-md">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && quotes.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Quotes Grid */}
        <div className="grid gap-8">
          {quotes.length > 0 ? (
            quotes.map((quote) => (
              <div key={quote.id} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-10 shadow-premium relative overflow-hidden group hover:bg-white/[0.08] transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50" />

                <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-6">
                      <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                        Bid <span className="text-gray-500">#{quote.quote_number}</span>
                      </h3>
                      <div className={`px-4 py-1.5 rounded-full border backdrop-blur-md flex items-center gap-2 ${quote.status === 'accepted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                        quote.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                          quote.status === 'under_review' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                            'bg-white/5 border-white/10 text-gray-400'
                        }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${quote.status === 'accepted' ? 'bg-emerald-500 shadow-glow-primary' :
                          quote.status === 'rejected' ? 'bg-red-500 shadow-glow-red' :
                            quote.status === 'under_review' ? 'bg-amber-500 shadow-glow-amber' : 'bg-gray-500'
                          }`} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{quote.status.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol Target</p>
                      <Link
                        to={ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':listingId', String(quote.listing.id))}
                        className="text-white font-black uppercase text-xl hover:text-indigo-400 transition-colors inline-block"
                      >
                        {quote.listing.title}
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-4 border-t border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Client Entity</p>
                        <p className="text-gray-300 font-bold uppercase text-xs">{quote.listing.company.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Latency</p>
                        <p className="text-gray-300 font-bold uppercase text-xs">{quote.delivery_days} Days</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Transmission</p>
                        <p className="text-gray-300 font-bold uppercase text-xs">{formatDate(quote.submitted_at)}</p>
                      </div>
                      {quote.expires_at && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Expiration</p>
                          <p className="text-indigo-400 font-bold uppercase text-xs">{formatDate(quote.expires_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="xl:text-right space-y-8 min-w-[200px]">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bid Valuation</p>
                      <p className="text-4xl font-black text-emerald-500 tracking-tighter shadow-glow-primary inline-block bg-white/5 px-6 py-2 rounded-2xl">
                        {formatCurrency(quote.quoted_price)}
                      </p>
                    </div>

                    <div className="flex flex-wrap xl:justify-end gap-4 pt-6 border-t xl:border-none border-white/5">
                      <Link
                        to={ROUTES.PROTECTED.VENDOR.QUOTES_DETAIL.replace(':quoteId', String(quote.id))}
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                      >
                        Details
                      </Link>

                      {quote.status === 'submitted' && (
                        <>
                          <Link
                            to={ROUTES.PROTECTED.VENDOR.QUOTES_EDIT.replace(':quoteId', String(quote.id))}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
                          >
                            Modify
                          </Link>
                          <button
                            onClick={() => handleWithdraw(quote.id)}
                            className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-glow-red"
                          >
                            Withdraw
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {quote.review_notes && (
                  <div className="mt-10 p-6 bg-amber-500/5 border-l-2 border-amber-500 rounded-r-2xl">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 px-1">Review Feedback</p>
                    <p className="text-amber-100/80 font-medium text-sm leading-relaxed">{quote.review_notes}</p>
                  </div>
                )}
              </div>
            ))
          ) : !loading && (
            <div className="bg-white/2 border border-white/5 rounded-[32px] p-24 text-center">
              <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-10 text-gray-500 opacity-20 border border-white/10">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">No Transmissions Found</h3>
              <p className="text-gray-500 font-medium max-w-md mx-auto mb-10">
                The protocol registry reports zero active bids. Initialize new procurement synchronization via the Registry Archive.
              </p>
              <Link
                to={ROUTES.PROTECTED.VENDOR.LISTINGS}
                className="px-12 py-5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-[32px] shadow-glow-primary hover:scale-105 transition-all inline-block"
              >
                Sync New Opportunities
              </Link>
            </div>
          )}
        </div>

        {/* Pagination Console */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-10 border-t border-white/5">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white disabled:opacity-20 hover:bg-white hover:text-black transition-all disabled:cursor-not-allowed group shadow-premium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === page
                      ? 'bg-emerald-500 text-black shadow-glow-primary'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {String(page).padStart(2, '0')}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white disabled:opacity-20 hover:bg-white hover:text-black transition-all disabled:cursor-not-allowed group shadow-premium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VendorQuotesManager;
