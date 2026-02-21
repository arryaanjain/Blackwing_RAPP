import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import walletService, { WalletBalance, WalletTransaction } from '../services/walletService';

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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Wallet</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your RAPP points</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
        {successMsg && <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm">{successMsg}</div>}

        {/* Balance Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Current Balance</p>
            <p className="text-5xl font-black text-white">{loading ? '…' : walletData?.balance ?? 0} <span className="text-xl text-gray-500">pts</span></p>
          </div>
          {walletData && (
            <div className="text-right space-y-1 text-xs text-gray-500">
              <p>Listing costs <span className="text-white font-bold">{walletData.point_costs.listing} pt</span></p>
              <p>Quote costs <span className="text-white font-bold">{walletData.point_costs.quote} pt</span></p>
              <p>Bid costs <span className="text-white font-bold">{walletData.point_costs.bid} pt</span></p>
            </div>
          )}
        </div>

        {/* Buy Points */}
        <div>
          <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Buy Points</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.points}
                onClick={() => handleBuyPoints(pkg)}
                disabled={buying}
                className="bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-indigo-500/40 rounded-2xl p-6 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-2xl font-black text-white">{pkg.points}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">points</p>
                <p className="text-indigo-400 font-bold text-sm">₹{pkg.price}</p>
              </button>
            ))}
          </div>
          {!walletData?.point_costs && !loading && (
            <p className="text-xs text-yellow-500/70 mt-2">Note: Razorpay keys are not configured. Contact admin to enable purchases.</p>
          )}
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Transaction History {totalTx > 0 && <span className="text-gray-600">({totalTx})</span>}</h2>
          {loading ? (
            <p className="text-gray-600 text-sm">Loading…</p>
          ) : transactions.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center text-gray-600 text-sm">No transactions yet.</div>
          ) : (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Description</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-300">{tx.description}</td>
                      <td className={`px-6 py-4 text-right font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lastPage > 1 && (
                <div className="flex justify-center gap-3 p-4 border-t border-white/5">
                  <button onClick={() => fetchData(page - 1)} disabled={page <= 1} className="text-xs text-gray-500 hover:text-white disabled:opacity-30">← Prev</button>
                  <span className="text-xs text-gray-600">{page} / {lastPage}</span>
                  <button onClick={() => fetchData(page + 1)} disabled={page >= lastPage} className="text-xs text-gray-500 hover:text-white disabled:opacity-30">Next →</button>
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

