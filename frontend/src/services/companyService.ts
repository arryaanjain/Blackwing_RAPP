import { getContract } from '../contracts/contractConfig';

export const companyService = {
  // Register a new company
  async registerCompany(name: string): Promise<string> {
    try {
      const { contract } = await getContract();
      const tx = await contract.registerCompany(name);
      const receipt = await tx.wait();
      
      // Find the CompanyRegistered event
      const event = receipt.logs
        .filter((log: any) => log.fragment?.name === 'CompanyRegistered')
        .map((log: any) => log.args)[0];
      
      // Return company ID
      return event.companyId.toString();
    } catch (error: any) {
      console.error('Error registering company:', error);
      throw new Error(`Failed to register company: ${error.message}`);
    }
  },
  
  // Get company details by ID
  async getCompanyDetails(companyId: string): Promise<{ name: string, owner: string }> {
    try {
      const { contract } = await getContract();
      const details = await contract.getCompanyDetails(companyId);
      return {
        name: details.name,
        owner: details.owner
      };
    } catch (error: any) {
      console.error('Error getting company details:', error);
      throw new Error(`Failed to get company details: ${error.message}`);
    }
  },
  
  // Check if a company is registered
  async isCompanyRegistered(companyId: string): Promise<boolean> {
    try {
      const { contract } = await getContract();
      return await contract.isCompanyRegistered(companyId);
    } catch (error: any) {
      console.error('Error checking company registration:', error);
      throw new Error(`Failed to check company registration: ${error.message}`);
    }
  },
  
  // Get company ID by owner address
  async getCompanyIdByOwner(owner: string): Promise<string> {
    try {
      const { contract } = await getContract();
      const companyId = await contract.getCompanyIdByOwner(owner);
      return companyId.toString();
    } catch (error: any) {
      console.error('Error getting company ID:', error);
      throw new Error(`Failed to get company ID: ${error.message}`);
    }
  },
  
  // Create a new listing for a company
  async createListing(companyId: string, title: string, description: string, isPrivate: boolean): Promise<string> {
    try {
      const { contract } = await getContract();
      const tx = await contract.createListing(companyId, title, description, isPrivate);
      const receipt = await tx.wait();
      
      // Find the ListingCreated event
      const event = receipt.logs
        .filter((log: any) => log.fragment?.name === 'ListingCreated')
        .map((log: any) => log.args)[0];
      
      // Return listing ID
      return event.listingId.toString();
    } catch (error: any) {
      console.error('Error creating listing:', error);
      throw new Error(`Failed to create listing: ${error.message}`);
    }
  },
  
  // Get all listings for a company
  async getCompanyListings(companyId: string): Promise<string[]> {
    try {
      const { contract } = await getContract();
      const listings = await contract.getCompanyListings(companyId);
      return listings.map((id: any) => id.toString());
    } catch (error: any) {
      console.error('Error getting company listings:', error);
      throw new Error(`Failed to get company listings: ${error.message}`);
    }
  },
  
  // Get details of a specific listing
  async getListingDetails(listingId: string): Promise<{
    title: string;
    description: string;
    isPrivate: boolean;
    companyId: string;
    owner: string;
  }> {
    try {
      const { contract } = await getContract();
      const details = await contract.getListingDetails(listingId);
      return {
        title: details.title,
        description: details.description,
        isPrivate: details.isPrivate,
        companyId: details.companyId.toString(),
        owner: details.owner
      };
    } catch (error: any) {
      console.error('Error getting listing details:', error);
      throw new Error(`Failed to get listing details: ${error.message}`);
    }
  }
};