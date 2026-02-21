import React, { useState } from 'react';
import { companyService } from '../services/companyService';
import { vendorService } from '../services/vendorService';
// import { useAuth } from '../context/AuthContext'; // TODO: Re-enable when needed

const ContractTester: React.FC = () => {
  // TODO: Implement wallet functionality later
  // const { walletAddress } = useAuth();
  const walletAddress = null;
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data states
  const [companyName, setCompanyName] = useState<string>('');
  const [vendorName, setVendorName] = useState<string>('');
  const [companyId, setCompanyId] = useState<string>('');
  const [vendorId, setVendorId] = useState<string>('');
  const [listingTitle, setListingTitle] = useState<string>('');
  const [listingDesc, setListingDesc] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  // const [listingId, setListingId] = useState<string>(''); // TODO: Use when needed
  
  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const id = await companyService.registerCompany(companyName);
      setResult(`Company registered successfully with ID: ${id}`);
      setCompanyId(id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Convert company ID to array
      const companyIds = companyId ? [companyId] : [];
      const id = await vendorService.registerVendor(vendorName, companyIds);
      setResult(`Vendor registered successfully with ID: ${id}`);
      setVendorId(id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const id = await companyService.createListing(
        companyId,
        listingTitle,
        listingDesc,
        isPrivate
      );
      setResult(`Listing created successfully with ID: ${id}`);
      // setListingId(id); // TODO: Implement when needed
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGetListings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const listings = await companyService.getCompanyListings(companyId);
      setResult(`Company listings: ${listings.join(', ')}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGetVendorListings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const listings = await vendorService.getAvailableListingsForVendor(vendorId);
      setResult(`Available listings for vendor: ${listings.join(', ')}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Smart Contract Tester</h1>
      <p className="mb-4">Connected wallet: {walletAddress || 'Not connected'}</p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {result}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Register Company Form */}
        <div className="border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Register Company</h2>
          <form onSubmit={handleRegisterCompany}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Register Company'}
            </button>
          </form>
        </div>
        
        {/* Register Vendor Form */}
        <div className="border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Register Vendor</h2>
          <form onSubmit={handleRegisterVendor}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Vendor Name</label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Company ID (Optional)</label>
              <input
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Register Vendor'}
            </button>
          </form>
        </div>
        
        {/* Create Listing Form */}
        <div className="border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Create Listing</h2>
          <form onSubmit={handleCreateListing}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Company ID</label>
              <input
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={listingTitle}
                onChange={(e) => setListingTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={listingDesc}
                onChange={(e) => setListingDesc(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Private Listing</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Create Listing'}
            </button>
          </form>
        </div>
        
        {/* Get Listings */}
        <div className="border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">View Listings</h2>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Company Listings</h3>
            <form onSubmit={handleGetListings} className="flex gap-2">
              <input
                type="text"
                placeholder="Company ID"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="flex-grow px-3 py-2 border rounded"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Get Listings
              </button>
            </form>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Vendor Available Listings</h3>
            <form onSubmit={handleGetVendorListings} className="flex gap-2">
              <input
                type="text"
                placeholder="Vendor ID"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="flex-grow px-3 py-2 border rounded"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Get Listings
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractTester;
