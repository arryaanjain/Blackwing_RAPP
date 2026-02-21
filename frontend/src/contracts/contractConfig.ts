import { ethers } from 'ethers';

// Contract address from Sepolia deployment
export const CONTRACT_ADDRESS = '0x541E197ad31ba3Db637273f5433F2f4C2b872B1e';

// Contract ABI - will be populated from actual ABI file once we can locate it
export const CONTRACT_ABI = [
  // Company Registration
  "function registerCompany(string memory name) external returns (uint256)",
  "function getCompanyDetails(uint256 companyId) external view returns (string memory name, address owner)",
  "function isCompanyRegistered(uint256 companyId) external view returns (bool)",
  "function getCompanyIdByOwner(address owner) external view returns (uint256)",
  
  // Vendor Registration
  "function registerVendor(string memory name, uint256[] memory companyIds) external returns (uint256)",
  "function getVendorDetails(uint256 vendorId) external view returns (string memory name, address owner)",
  "function isVendorRegistered(uint256 vendorId) external view returns (bool)",
  "function getVendorIdByOwner(address owner) external view returns (uint256)",
  "function getVendorCompanies(uint256 vendorId) external view returns (uint256[] memory)",
  "function addCompanyToVendor(uint256 vendorId, uint256 companyId) external",
  
  // Listings
  "function createListing(uint256 companyId, string memory title, string memory description, bool isPrivate) external returns (uint256)",
  "function getListingDetails(uint256 listingId) external view returns (string memory title, string memory description, bool isPrivate, uint256 companyId, address owner)",
  "function getCompanyListings(uint256 companyId) external view returns (uint256[] memory)",
  "function getAvailableListingsForVendor(uint256 vendorId) external view returns (uint256[] memory)",
  
  // Permission Management
  "function isVendorAllowedForCompany(uint256 vendorId, uint256 companyId) external view returns (bool)",
  "function isListingVisibleToVendor(uint256 listingId, uint256 vendorId) external view returns (bool)",
  
  // Events
  "event CompanyRegistered(uint256 indexed companyId, address indexed owner, string name)",
  "event VendorRegistered(uint256 indexed vendorId, address indexed owner, string name)",
  "event ListingCreated(uint256 indexed listingId, uint256 indexed companyId, string title)",
  "event CompanyAddedToVendor(uint256 indexed vendorId, uint256 indexed companyId)"
];

export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask to use this application.");
  }
  
  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create Web3Provider instance
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Get the signer
    const signer = await provider.getSigner();
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    return { contract, signer };
  } catch (error) {
    console.error("Error connecting to contract:", error);
    throw error;
  }
};
