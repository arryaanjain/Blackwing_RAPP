// RAPP Application Routes Configuration
// This file contains all the route definitions and page mappings for the application

export const ROUTES = {
  // Public routes (accessible without authentication)
  PUBLIC: {
    HOME: '/',
    LOGIN: '/',  // Redirect to home page with JoinPlatformSection
    COMPANY_LOGIN: '/company/login',
    VENDOR_LOGIN: '/vendor/login',
    COMPANY_SIGNUP: '/company/signup',
    VENDOR_SIGNUP: '/vendor/signup',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    ABOUT: '/about',
    CONTACT: '/contact',
    PRIVACY: '/privacy',
    TERMS: '/terms',
  },

  // Authentication related routes
  AUTH: {
    CALLBACK: '/auth/callback',
    OAUTH_GOOGLE: '/auth/google',
    VERIFY_EMAIL: '/verify-email',
  },

  // Protected routes requiring authentication
  PROTECTED: {
    // General authenticated routes
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    COMPLETE_PROFILE: '/complete-profile',
    
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
      // Listings management routes
      LISTINGS: '/company/listings',
      LISTINGS_CREATE: '/company/listings/create',
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
      // Listings and quotes routes
      LISTINGS: '/vendor/listings',
      LISTINGS_DETAIL: '/vendor/listings/:id',
      QUOTES: '/vendor/quotes',
      QUOTES_CREATE: '/vendor/listings/:listingId/quote',
      QUOTES_DETAIL: '/vendor/quotes/:quoteId',
      QUOTES_EDIT: '/vendor/quotes/:quoteId/edit',
    },
  },

  // Error and utility routes
  UTILITY: {
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/401',
    SERVER_ERROR: '/500',
    MAINTENANCE: '/maintenance',
  }
};

// Route metadata for navigation and breadcrumbs
interface RouteMetadata {
  title: string;
  description: string;
  breadcrumb: string;
  requiresAuth: boolean;
  userType?: 'company' | 'vendor';
}

export const ROUTE_METADATA: Record<string, RouteMetadata> = {
  [ROUTES.PUBLIC.HOME]: {
    title: 'RAPP - Company-Vendor Platform',
    description: 'Connect companies with trusted vendors',
    breadcrumb: 'Home',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.LOGIN]: {
    title: 'Login - RAPP',
    description: 'Sign in to your account',
    breadcrumb: 'Login',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.COMPANY_LOGIN]: {
    title: 'Company Login - RAPP',
    description: 'Company sign in',
    breadcrumb: 'Company Login',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.VENDOR_LOGIN]: {
    title: 'Vendor Login - RAPP',
    description: 'Vendor sign in',
    breadcrumb: 'Vendor Login',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.COMPANY_SIGNUP]: {
    title: 'Company Signup - RAPP',
    description: 'Create your company account',
    breadcrumb: 'Company Signup',
    requiresAuth: false,
  },
  [ROUTES.PUBLIC.VENDOR_SIGNUP]: {
    title: 'Vendor Signup - RAPP',
    description: 'Create your vendor account',
    breadcrumb: 'Vendor Signup',
    requiresAuth: false,
  },
  [ROUTES.PROTECTED.COMPANY.DASHBOARD]: {
    title: 'Company Dashboard - RAPP',
    description: 'Your company dashboard',
    breadcrumb: 'Dashboard',
    requiresAuth: true,
    userType: 'company',
  },
  [ROUTES.PROTECTED.VENDOR.DASHBOARD]: {
    title: 'Vendor Dashboard - RAPP',
    description: 'Your vendor dashboard',
    breadcrumb: 'Dashboard',
    requiresAuth: true,
    userType: 'vendor',
  },
  [ROUTES.PROTECTED.COMPANY.COMPLETE_PROFILE]: {
    title: 'Complete Profile - RAPP',
    description: 'Complete your company profile',
    breadcrumb: 'Complete Profile',
    requiresAuth: true,
    userType: 'company',
  },
  [ROUTES.PROTECTED.VENDOR.COMPLETE_PROFILE]: {
    title: 'Complete Profile - RAPP',
    description: 'Complete your vendor profile',
    breadcrumb: 'Complete Profile',
    requiresAuth: true,
    userType: 'vendor',
  },
};

// Navigation menus for different user types
export const NAVIGATION_MENUS = {
  COMPANY: [
    {
      name: 'Dashboard',
      href: ROUTES.PROTECTED.COMPANY.DASHBOARD,
      icon: 'dashboard',
    },
    {
      name: 'Listings',
      href: ROUTES.PROTECTED.COMPANY.LISTINGS,
      icon: 'document-text',
    },
    {
      name: 'Vendors',
      href: ROUTES.PROTECTED.COMPANY.VENDORS,
      icon: 'users',
    },
    {
      name: 'Projects',
      href: ROUTES.PROTECTED.COMPANY.PROJECTS,
      icon: 'briefcase',
    },
    {
      name: 'Contracts',
      href: ROUTES.PROTECTED.COMPANY.CONTRACTS,
      icon: 'document',
    },
    {
      name: 'Analytics',
      href: ROUTES.PROTECTED.COMPANY.ANALYTICS,
      icon: 'chart',
    },
    {
      name: 'Billing',
      href: ROUTES.PROTECTED.COMPANY.BILLING,
      icon: 'creditcard',
    },
  ],
  VENDOR: [
    {
      name: 'Dashboard',
      href: ROUTES.PROTECTED.VENDOR.DASHBOARD,
      icon: 'dashboard',
    },
    {
      name: 'Listings',
      href: ROUTES.PROTECTED.VENDOR.LISTINGS,
      icon: 'document-text',
    },
    {
      name: 'My Quotes',
      href: ROUTES.PROTECTED.VENDOR.QUOTES,
      icon: 'document-duplicate',
    },
    {
      name: 'Companies',
      href: ROUTES.PROTECTED.VENDOR.COMPANIES,
      icon: 'building',
    },
    {
      name: 'Projects',
      href: ROUTES.PROTECTED.VENDOR.PROJECTS,
      icon: 'briefcase',
    },
    {
      name: 'Portfolio',
      href: ROUTES.PROTECTED.VENDOR.PORTFOLIO,
      icon: 'collection',
    },
    {
      name: 'Contracts',
      href: ROUTES.PROTECTED.VENDOR.CONTRACTS,
      icon: 'document',
    },
    {
      name: 'Earnings',
      href: ROUTES.PROTECTED.VENDOR.EARNINGS,
      icon: 'currency',
    },
  ],
  PUBLIC: [
    {
      name: 'Home',
      href: ROUTES.PUBLIC.HOME,
      icon: 'home',
    },
    {
      name: 'About',
      href: ROUTES.PUBLIC.ABOUT,
      icon: 'info',
    },
    {
      name: 'Contact',
      href: ROUTES.PUBLIC.CONTACT,
      icon: 'mail',
    },
  ],
};

// Helper functions for route management
export const routeHelpers = {
  // Check if route requires authentication
  requiresAuth: (path: string): boolean => {
    return ROUTE_METADATA[path]?.requiresAuth ?? false;
  },

  // Get route title
  getTitle: (path: string): string => {
    return ROUTE_METADATA[path]?.title ?? 'RAPP';
  },

  // Get route description
  getDescription: (path: string): string => {
    return ROUTE_METADATA[path]?.description ?? '';
  },

  // Get breadcrumb
  getBreadcrumb: (path: string): string => {
    return ROUTE_METADATA[path]?.breadcrumb ?? '';
  },

  // Check if route requires specific user type
  getRequiredUserType: (path: string): 'company' | 'vendor' | null => {
    return ROUTE_METADATA[path]?.userType ?? null;
  },

  // Get navigation menu for user type
  getNavigationMenu: (userType: 'company' | 'vendor' | null) => {
    if (userType === 'company') return NAVIGATION_MENUS.COMPANY;
    if (userType === 'vendor') return NAVIGATION_MENUS.VENDOR;
    return NAVIGATION_MENUS.PUBLIC;
  },

  // Check if current path matches route
  isActive: (currentPath: string, routePath: string): boolean => {
    return currentPath === routePath || currentPath.startsWith(routePath + '/');
  },

  // Get redirect path after login based on user type
  getDefaultRedirect: (userType: 'company' | 'vendor' | null, needsProfileCompletion = false) => {
    if (needsProfileCompletion) {
      if (userType === 'company') return ROUTES.PROTECTED.COMPANY.COMPLETE_PROFILE;
      if (userType === 'vendor') return ROUTES.PROTECTED.VENDOR.COMPLETE_PROFILE;
      return ROUTES.PROTECTED.COMPLETE_PROFILE;
    }

    if (userType === 'company') return ROUTES.PROTECTED.COMPANY.DASHBOARD;
    if (userType === 'vendor') return ROUTES.PROTECTED.VENDOR.DASHBOARD;
    return ROUTES.PROTECTED.DASHBOARD;
  },
};

export default ROUTES;
