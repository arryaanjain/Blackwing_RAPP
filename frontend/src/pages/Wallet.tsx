import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import walletService from '../services/walletService';
import type { WalletBalance, WalletTransaction } from '../services/walletService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PACKAGES = [
  { points: 100, price: 9 },
  { points: 500, price: 39 },
  { points: 1000, price: 69 },
  { points: 5000, price: 299 },
];

const Wallet: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [totalTx, setTotalTx] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const [balRes, txRes] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(p),
      ]);
      setWalletData(balRes.data);
      setTransactions(txRes.data.data);
      setTotalTx(txRes.data.total);
      setLastPage(txRes.data.last_page);
      setPage(p);
    } catch (err: any) {
      setError('Failed to load wallet data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handleBuyPoints = async (pkg: { points: number; price: number }) => {
    setBuying(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay failed to load.');

      const orderRes = await walletService.createOrder(pkg.price, pkg.points);
      const { order_id, amount, currency, key_id, user_name, user_email } = orderRes.data;

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: key_id,
          amount,
          currency,
          order_id,
          name: 'RAPP Points',
          description: `Purchase ${pkg.points} points`,
          prefill: { name: user_name, email: user_email },
          theme: { color: '#6366f1' },
          handler: async (response: any) => {
            try {
              const verifyRes = await walletService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                points: pkg.points,
              });
              setSuccessMsg(`✅ ${verifyRes.data.points_added} points added! New balance: ${verifyRes.data.new_balance} pts`);
              fetchData(1);
              resolve();
            } catch {
              reject(new Error('Payment verification failed.'));
            }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled.')) },
        });
        rzp.open();
      });
    } catch (err: any) {
      if (err?.message !== 'Payment cancelled.') {
        setError(err?.response?.data?.error || err?.message || 'Purchase failed.');
      }
    } finally {
      setBuying(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Terminal <span className="text-indigo-500">Wallet</span></h1>
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest mt-2 ml-1">Manage and recharge RAPP point balances</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-left-4 duration-500">{error}</div>}
        {successMsg && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-left-4 duration-500">{successMsg}</div>}

        {/* Balance Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group shadow-premium">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent" />
          <div className="relative z-10 text-center md:text-left mb-8 md:mb-0">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Node Point Balance</p>
            <p className="text-7xl font-black text-white tracking-tighter group-hover:scale-105 transition-transform duration-500">{loading ? '…' : walletData?.balance ?? 0} <span className="text-xl text-gray-500 uppercase tracking-widest ml-1">pts</span></p>
          </div>
          {walletData && (
            <div className="relative z-10 grid grid-cols-1 gap-4 p-6 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-8">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Listing Protocol</span>
                <span className="text-sm font-black text-white tracking-wider">{walletData.point_costs.listing} pt</span>
              </div>
              <div className="flex items-center justify-between gap-8">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Quote Submission</span>
                <span className="text-sm font-black text-white tracking-wider">{walletData.point_costs.quote} pt</span>
              </div>
              <div className="flex items-center justify-between gap-8">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bid Placement</span>
                <span className="text-sm font-black text-white tracking-wider">{walletData.point_costs.bid} pt</span>
              </div>
            </div>
          )}
        </div>

        {/* Buy Points */}
        <div>
          <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-6 px-2">Recharge Protocols</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.points}
                onClick={() => handleBuyPoints(pkg)}
                disabled={buying}
                className="group bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-indigo-500/40 rounded-3xl p-8 text-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] shadow-glass"
              >
                <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-500 group-hover:text-black transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4.09 12.97 12 12l-1 8 8.91-10.97H12l1-8z" /></svg>
                </div>
                <p className="text-4xl font-black text-white tracking-tighter mb-1">{pkg.points}</p>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-4">Units</p>
                <div className="bg-white/5 py-2 rounded-xl border border-white/5">
                  <p className="text-indigo-400 font-black text-sm">₹{pkg.price}</p>
                </div>
              </button>
            ))}
          </div>
          {!walletData?.point_costs && !loading && (
            <p className="text-[10px] font-black text-yellow-500/50 uppercase tracking-widest text-center mt-8">Secure payment gateway connection pending administrative verification.</p>
          )}
        </div>

        {/* Transaction History */}
        <div>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Transaction Archive {totalTx > 0 && <span className="text-gray-600">[{totalTx}]</span>}</h2>
          </div>

          {loading ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center animate-pulse">
              <p className="text-gray-600 font-black uppercase text-[10px] tracking-[0.2em]">Retrieving Ledger Records...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center text-gray-500 font-medium">No ledger entries detected on current block.</div>
          ) : (
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl overflow-hidden shadow-glass">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Entry Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Transaction Descriptor</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Unit Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5 text-gray-500 text-xs font-medium uppercase tracking-wider">{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className="px-8 py-5 text-gray-300 font-medium">{tx.description}</td>
                      <td className={`px-8 py-5 text-right font-black tracking-tighter text-lg ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount} <span className="text-[10px] font-black uppercase tracking-widest opacity-50">pts</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lastPage > 1 && (
                <div className="flex justify-center items-center gap-6 p-6 border-t border-white/5 bg-white/[0.01]">
                  <button onClick={() => fetchData(page - 1)} disabled={page <= 1} className="p-2 text-gray-500 hover:text-white disabled:opacity-20 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{page} / {lastPage}</span>
                  <button onClick={() => fetchData(page + 1)} disabled={page >= lastPage} className="p-2 text-gray-500 hover:text-white disabled:opacity-20 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Wallet;

