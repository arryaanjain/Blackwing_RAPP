import React, { useState } from 'react';

interface WalletConnectButtonProps {
  onConnect: (account: string) => void;
}

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Get the first account
      const account = accounts[0];
      onConnect(account);
    } catch (err: any) {
      console.error('Error connecting to MetaMask:', err);
      setError(err.message || 'Failed to connect to wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={connectWallet}
        disabled={isConnecting}
        className="w-full flex items-center justify-center bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-6 rounded-lg shadow-md transition-all duration-200 disabled:opacity-70"
      >
        {isConnecting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </span>
        ) : (
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32.9583 1.07666L19.8254 10.8646L22.2162 5.0838L32.9583 1.07666Z" fill="white"/>
              <path d="M32.9584 1.07666L17.5562 15.3557L19.8253 10.8646L32.9584 1.07666Z" fill="white" fillOpacity="0.8"/>
              <path d="M17.5563 15.3558L32.9584 1.07666L30.0999 20.6496L17.5563 15.3558Z" fill="white" fillOpacity="0.7"/>
              <path d="M12.2854 20.6496L17.5562 15.3557L30.0998 20.6496L17.5562 26.8531L12.2854 20.6496Z" fill="white" fillOpacity="0.5"/>
              <path d="M2.04163 1.07666L17.5563 15.3557L12.2855 20.6496L2.04163 1.07666Z" fill="white" fillOpacity="0.6"/>
              <path d="M17.5562 26.8533L30.0999 20.6497L17.5562 31.9236V26.8533Z" fill="white" fillOpacity="0.2"/>
              <path d="M17.5562 31.9236V26.8533L4.90082 20.6497L17.5562 31.9236Z" fill="white" fillOpacity="0.3"/>
              <path d="M2.04163 1.07666L12.2855 20.6496L4.90088 20.6496L2.04163 1.07666Z" fill="white" fillOpacity="0.6"/>
            </svg>
            Connect with MetaMask
          </span>
        )}
      </button>
      {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
    </div>
  );
};

export default WalletConnectButton;
