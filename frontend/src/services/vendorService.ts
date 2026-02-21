import { getContract } from '../contracts/contractConfig';

export const vendorService = {
  // Register a new vendor
  async registerVendor(name: string, companyIds: string[]): Promise<string> {
    try {
      const { contract } = await getContract();
      const tx = await contract.registerVendor(name, companyIds);
      const receipt = await tx.wait();
      
      // Find the VendorRegistered event
      const event = receipt.logs
        .filter((log: any) => log.fragment?.name === 'VendorRegistered')
        .map((log: any) => log.args)[0];
      
      // Return vendor ID
      return event.vendorId.toString();
    } catch (error: any) {
      console.error('Error registering vendor:', error);
      throw new Error(`Failed to register vendor: ${error.message}`);
    }
  },
  
  // Get vendor details by ID
  async getVendorDetails(vendorId: string): Promise<{ name: string, owner: string }> {
    try {
      const { contract } = await getContract();
      const details = await contract.getVendorDetails(vendorId);
      return {
        name: details.name,
        owner: details.owner
      };
    } catch (error: any) {
      console.error('Error getting vendor details:', error);
      throw new Error(`Failed to get vendor details: ${error.message}`);
    }
  },
  
  // Check if a vendor is registered
  async isVendorRegistered(vendorId: string): Promise<boolean> {
    try {
      const { contract } = await getContract();
      return await contract.isVendorRegistered(vendorId);
    } catch (error: any) {
      console.error('Error checking vendor registration:', error);
      throw new Error(`Failed to check vendor registration: ${error.message}`);
    }
  },
  
  // Get vendor ID by owner address
  async getVendorIdByOwner(owner: string): Promise<string> {
    try {
      const { contract } = await getContract();
      const vendorId = await contract.getVendorIdByOwner(owner);
      return vendorId.toString();
    } catch (error: any) {
      console.error('Error getting vendor ID:', error);
      throw new Error(`Failed to get vendor ID: ${error.message}`);
    }
  },
  
  // Get all companies associated with a vendor
  async getVendorCompanies(vendorId: string): Promise<string[]> {
    try {
      const { contract } = await getContract();
      const companies = await contract.getVendorCompanies(vendorId);
      return companies.map((id: any) => id.toString());
    } catch (error: any) {
      console.error('Error getting vendor companies:', error);
      throw new Error(`Failed to get vendor companies: ${error.message}`);
    }
  },
  
  // Add a company to a vendor's list
  async addCompanyToVendor(vendorId: string, companyId: string): Promise<void> {
    try {
      const { contract } = await getContract();
      const tx = await contract.addCompanyToVendor(vendorId, companyId);
      await tx.wait();
    } catch (error: any) {
      console.error('Error adding company to vendor:', error);
      throw new Error(`Failed to add company to vendor: ${error.message}`);
    }
  },
  
  // Get all available listings for a vendor
  async getAvailableListingsForVendor(vendorId: string): Promise<string[]> {
    try {
      const { contract } = await getContract();
      const listings = await contract.getAvailableListingsForVendor(vendorId);
      return listings.map((id: any) => id.toString());
    } catch (error: any) {
      console.error('Error getting available listings for vendor:', error);
      throw new Error(`Failed to get available listings: ${error.message}`);
    }
  },
  
  // Check if a vendor is allowed to work with a company
  async isVendorAllowedForCompany(vendorId: string, companyId: string): Promise<boolean> {
    try {
      const { contract } = await getContract();
      return await contract.isVendorAllowedForCompany(vendorId, companyId);
    } catch (error: any) {
      console.error('Error checking vendor permission:', error);
      throw new Error(`Failed to check vendor permission: ${error.message}`);
    }
  },
  
  // Check if a listing is visible to a vendor
  async isListingVisibleToVendor(listingId: string, vendorId: string): Promise<boolean> {
    try {
      const { contract } = await getContract();
      return await contract.isListingVisibleToVendor(listingId, vendorId);
    } catch (error: any) {
      console.error('Error checking listing visibility:', error);
      throw new Error(`Failed to check listing visibility: ${error.message}`);
    }
  }
};
