export const ROUTES = {
  // Public routes (accessible without authentication)
  PUBLIC: {
    HOME: '/',
    ONBOARDING: '/onboarding',
    ABOUT: '/about',
    CONTACT: '/contact',
    PRIVACY: '/privacy',
    TERMS: '/terms',
    FEATURES: '/features',
    SOLUTIONS: '/solutions',
    PRICING: '/pricing',
    DEMO: '/demo',
    TEAM: '/team',
    CAREERS: '/careers',
    NEWS: '/news',
    DOCS: '/documentation', // Updated to match file name/content
    KNOWLEDGE_BASE: '/knowledge-base',
    BLOG: '/blog',
    GUIDES: '/guides',
    GUIDE_COMPANY_SETUP: '/guides/company-setup',
    GUIDE_VENDOR_ONBOARDING: '/guides/vendor-onboarding',
    GUIDE_MANAGING_LISTING: '/guides/managing-listing',
    GUIDE_SECURITY_BEST_PRACTICES: '/guides/security-best-practices',
  },

  // Authentication related routes
  AUTH: {
    CALLBACK: '/auth/callback',
    GOOGLE: '/auth/google',
  },

  // Protected routes (require authentication)
  PROTECTED: {
    // Shared or base protected routes
    DASHBOARD_SELECT: '/dashboard/select',

    // Company specific routes
    COMPANY: {
      DASHBOARD: '/company/dashboard',
      PROFILE: '/company/profile',
      COMPLETE_PROFILE: '/company/complete-profile',
      SETTINGS: '/company/settings',
      VENDORS: '/company/vendors',
      PROJECTS: '/company/projects',
      CONTRACTS: '/company/contracts',
      BILLING: '/company/billing',
      ANALYTICS: '/company/analytics',
      LISTINGS: '/company/listings',
      CREATE_LISTING: '/company/listings/create',
      LISTINGS_CREATE: '/company/listings/create', // Alias for compatibility
      LISTINGS_DETAIL: '/company/listings/:id',
      LISTINGS_EDIT: '/company/listings/:id/edit',
      LISTINGS_QUOTES: '/company/listings/:id/quotes',
    },

    // Vendor specific routes
    VENDOR: {
      DASHBOARD: '/vendor/dashboard',
      PROFILE: '/vendor/profile',
      COMPLETE_PROFILE: '/vendor/complete-profile',
      SETTINGS: '/vendor/settings',
      COMPANIES: '/vendor/companies',
      PROJECTS: '/vendor/projects',
      CONTRACTS: '/vendor/contracts',
      PORTFOLIO: '/vendor/portfolio',
      EARNINGS: '/vendor/earnings',
      LISTINGS: '/vendor/listings',
      MY_LISTINGS: '/vendor/my-listings',
      SEARCH_LISTINGS: '/vendor/search-listings',
      LISTINGS_DETAIL: '/vendor/listings/:id',
      QUOTES: '/vendor/quotes',
      QUOTES_CREATE: '/vendor/listings/:id/quote',
      QUOTES_EDIT: '/vendor/quotes/:id/edit',
    },
  },
};

export interface RouteMetadata {
  title: string;
  description: string;
  breadcrumb: string;
  requiresAuth: boolean;
  profileType?: 'company' | 'vendor' | 'any';
}

export const ROUTE_METADATA: Record<string, RouteMetadata> = {
  [ROUTES.PUBLIC.HOME]: {
    title: 'RAPP - Company-Vendor Platform',
    description: 'Connect companies with trusted vendors',
    breadcrumb: 'Home',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.ONBOARDING]: {
    title: 'Onboarding - RAPP',
    description: 'Select your role to get started',
    breadcrumb: 'Onboarding',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.ABOUT]: {
    title: 'About Us - RAPP',
    description: 'Learn about the RAPP protocol',
    breadcrumb: 'About',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.CONTACT]: {
    title: 'Contact Us - RAPP',
    description: 'Get in touch with the RAPP team',
    breadcrumb: 'Contact',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.FEATURES]: {
    title: 'Features - RAPP',
    description: 'Explore RAPP protocol features',
    breadcrumb: 'Features',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.SOLUTIONS]: {
    title: 'Solutions - RAPP',
    description: 'Company and Vendor solutions',
    breadcrumb: 'Solutions',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.PRICING]: {
    title: 'Pricing - RAPP',
    description: 'Protocol usage fees and plans',
    breadcrumb: 'Pricing',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.DEMO]: {
    title: 'Demo - RAPP',
    description: 'Try RAPP in a sandbox environment',
    breadcrumb: 'Demo',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.TEAM]: {
    title: 'Our Team - RAPP',
    description: 'Meet the architects of RAPP',
    breadcrumb: 'Team',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.CAREERS]: {
    title: 'Careers - RAPP',
    description: 'Join the RAPP core team',
    breadcrumb: 'Careers',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.NEWS]: {
    title: 'News & Updates - RAPP',
    description: 'Latest protocol developments',
    breadcrumb: 'News',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.DOCS]: {
    title: 'Documentation - RAPP',
    description: 'Developer and architect docs',
    breadcrumb: 'Documentation',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.KNOWLEDGE_BASE]: {
    title: 'Knowledge Base - RAPP',
    description: 'Master the protocol',
    breadcrumb: 'Knowledge Base',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.BLOG]: {
    title: 'Blog - RAPP',
    description: 'Insights into decentralized procurement',
    breadcrumb: 'Blog',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.GUIDES]: {
    title: 'Guides - RAPP',
    description: 'Master the protocol',
    breadcrumb: 'Guides',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.GUIDE_COMPANY_SETUP]: {
    title: 'Company Profile Setup - RAPP',
    description: 'Step-by-step guide',
    breadcrumb: 'Company Setup',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.GUIDE_VENDOR_ONBOARDING]: {
    title: 'Vendor Onboarding - RAPP',
    description: 'Step-by-step guide',
    breadcrumb: 'Vendor Onboarding',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.GUIDE_MANAGING_LISTING]: {
    title: 'Managing Listing - RAPP',
    description: 'Step-by-step guide',
    breadcrumb: 'Managing Listing',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.GUIDE_SECURITY_BEST_PRACTICES]: {
    title: 'Security Best Practices - RAPP',
    description: 'Step-by-step guide',
    breadcrumb: 'Security',
    requiresAuth: false,
  },
  [ROUTES.PROTECTED.COMPANY.DASHBOARD]: {
    title: 'Company Dashboard',
    description: 'Manage your procurement needs',
    breadcrumb: 'Dashboard',
    requiresAuth: true,
    profileType: 'company',
  },
  [ROUTES.PROTECTED.VENDOR.DASHBOARD]: {
    title: 'Vendor Dashboard',
    description: 'Manage your bids and contracts',
    breadcrumb: 'Dashboard',
    requiresAuth: true,
    profileType: 'vendor',
  },
};

export const getRouteMetadata = (path: string): RouteMetadata | undefined => {
  return ROUTE_METADATA[path];
};
