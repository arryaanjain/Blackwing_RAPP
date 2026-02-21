# RAPP Authentication System - Complete API & Route Reference

This document provides a comprehensive overview of all endpoints, routes, and pages in the RAPP application.

## 🔧 Backend API Endpoints

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Parameters |
|--------|----------|-------------|---------------|------------|
| `POST` | `/api/auth/register` | User registration | ❌ | `name`, `email`, `password`, `password_confirmation`, `user_type` |
| `POST` | `/api/auth/login` | User login | ❌ | `email`, `password` |
| `POST` | `/api/auth/logout` | Logout current session | ✅ | - |
| `POST` | `/api/auth/logout-all` | Logout all sessions | ✅ | - |
| `POST` | `/api/auth/refresh` | Refresh access token | ❌ | `refresh_token` |
| `GET` | `/api/auth/me` | Get current user data | ✅ | - |
| `GET` | `/api/auth/user` | Get authenticated user | ✅ | - |
| `POST` | `/api/auth/set-password` | Set password for OAuth users | ✅ | `password`, `password_confirmation` |
| `POST` | `/api/auth/complete-profile` | Complete user profile | ✅ | Profile data (varies by user type) |

### OAuth Endpoints (`/api/auth/oauth`)

| Method | Endpoint | Description | Auth Required | Parameters |
|--------|----------|-------------|---------------|------------|
| `GET` | `/api/auth/providers` | Get available OAuth providers | ❌ | - |
| `POST` | `/api/auth/oauth/google` | Process Google OAuth token | ❌ | `google_token`, `user_type` |
| `DELETE` | `/api/auth/oauth/{provider}` | Unlink OAuth provider | ✅ | - |

### Web OAuth Routes (`/auth`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/auth/google` | Redirect to Google OAuth | `type` (company/vendor) |
| `GET` | `/auth/google/callback` | Handle Google OAuth callback | `code`, `state` |

### Session Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/auth/sessions` | Get active sessions | ✅ |
| `DELETE` | `/api/auth/sessions/{id}` | Revoke specific session | ✅ |

---

## 🎨 Frontend Routes

### Public Routes (No Authentication Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `LandingPage` | Application home page |
| `/login` | Login selector | Choose between company/vendor login |
| `/company/login` | `CompanyLogin` | Company login form |
| `/vendor/login` | `VendorLogin` | Vendor login form |
| `/company/signup` | `CompanySignup` | Company registration |
| `/vendor/signup` | `VendorSignup` | Vendor registration |
| `/about` | `About` | About page |
| `/contact` | `Contact` | Contact page |
| `/privacy` | `Privacy` | Privacy policy |
| `/terms` | `Terms` | Terms of service |

### Authentication Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/auth/callback` | `AuthCallback` | OAuth callback handler |
| `/verify-email` | `VerifyEmail` | Email verification |

### Protected Routes - Company (`/company/*`)

| Route | Component | Auth Level | Description |
|-------|-----------|------------|-------------|
| `/company/dashboard` | `CompanyDashboard` | Complete Profile | Company dashboard |
| `/company/complete-profile` | Profile completion | Authenticated | Complete company profile |
| `/company/profile` | `CompanyProfile` | Complete Profile | View/edit company profile |
| `/company/vendors` | `ManageVendors` | Complete Profile | Manage vendor relationships |
| `/company/projects` | `CompanyProjects` | Complete Profile | Project management |
| `/company/contracts` | `CompanyContracts` | Complete Profile | Contract management |
| `/company/billing` | `CompanyBilling` | Complete Profile | Billing and payments |
| `/company/analytics` | `CompanyAnalytics` | Complete Profile | Business analytics |
| `/company/settings` | `CompanySettings` | Complete Profile | Account settings |

### Protected Routes - Vendor (`/vendor/*`)

| Route | Component | Auth Level | Description |
|-------|-----------|------------|-------------|
| `/vendor/dashboard` | `VendorDashboard` | Complete Profile | Vendor dashboard |
| `/vendor/complete-profile` | Profile completion | Authenticated | Complete vendor profile |
| `/vendor/profile` | `VendorProfile` | Complete Profile | View/edit vendor profile |
| `/vendor/companies` | `ManageCompanies` | Complete Profile | Manage company relationships |
| `/vendor/projects` | `VendorProjects` | Complete Profile | Project assignments |
| `/vendor/contracts` | `VendorContracts` | Complete Profile | Contract management |
| `/vendor/portfolio` | `VendorPortfolio` | Complete Profile | Portfolio showcase |
| `/vendor/earnings` | `VendorEarnings` | Complete Profile | Earnings and payments |
| `/vendor/settings` | `VendorSettings` | Complete Profile | Account settings |

### Error Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/404` | `NotFound` | Page not found |
| `/401` | `Unauthorized` | Unauthorized access |
| `/500` | `ServerError` | Server error |

---

## 🔐 Authentication Flow

### Registration Flow
1. User visits `/company/signup` or `/vendor/signup`
2. User fills registration form or clicks "Sign up with Google"
3. **Manual Registration**: `POST /api/auth/register` → Immediate login
4. **Google OAuth**: Redirect to `/auth/google?type={user_type}` → Google OAuth → `/auth/google/callback` → `/auth/callback?tokens=...`
5. If profile incomplete: Redirect to `/company/complete-profile` or `/vendor/complete-profile`
6. If profile complete: Redirect to dashboard

### Login Flow
1. User visits `/company/login` or `/vendor/login`
2. User enters credentials or clicks "Sign in with Google"
3. **Manual Login**: `POST /api/auth/login` → Dashboard redirect
4. **Google OAuth**: Same as registration OAuth flow
5. Tokens stored in localStorage with auto-refresh

### OAuth Callback Flow
1. Google redirects to `/auth/google/callback?code=...&state=...`
2. Backend processes OAuth, creates/updates user
3. Backend redirects to `/auth/callback?tokens={base64_encoded_data}`
4. Frontend `AuthCallback` component processes tokens
5. Redirect based on profile completion status

---

## 🛡️ Route Protection

### Protection Levels

1. **Public Routes**: No authentication required
2. **Authenticated Routes**: Valid access token required
3. **Complete Profile Routes**: Authentication + completed profile required
4. **User Type Routes**: Authentication + specific user type (company/vendor)

### Route Guards

- `PublicRoute`: Redirects authenticated users to dashboard
- `ProtectedRoute`: Ensures authentication and proper user type
- Auto-redirect to profile completion if needed
- Automatic token refresh on 401 responses

---

## 📱 Navigation Structure

### Company Navigation
- Dashboard → Analytics overview, quick actions
- Vendors → Browse, hire, manage vendor relationships
- Projects → Create, manage, track projects
- Contracts → Contract templates, active contracts
- Analytics → Business metrics, performance
- Billing → Invoices, payments, subscription

### Vendor Navigation
- Dashboard → Opportunities, earnings overview
- Companies → Browse companies, applications
- Projects → Current projects, deadlines
- Portfolio → Showcase work, case studies
- Contracts → Active contracts, proposals
- Earnings → Payment history, invoices

---

## 🔧 Technical Implementation

### Axios Interceptors
- **Request Interceptor**: Automatically adds Bearer token to all requests
- **Response Interceptor**: Handles 401 errors with automatic token refresh
- **Base URL**: Configured via environment variables

### Token Management
- **Access Token**: 15-minute expiration, stored in localStorage
- **Refresh Token**: 7-day expiration, HTTP-only recommended
- **Auto-refresh**: Transparent token refresh on API calls
- **Logout**: Clears all tokens and localStorage

### State Management
- **AuthContext**: Centralized authentication state
- **User Data**: Cached in localStorage with token
- **Profile Status**: Automatic redirect handling
- **Loading States**: Proper loading indicators

---

## 🔗 Integration Points

### Frontend-Backend Integration
- All API calls go through configured axios instance
- Automatic token handling via interceptors
- Error boundary handling for auth failures
- Consistent response format expectations

### OAuth Integration
- Google OAuth 2.0 with custom sub_id extraction
- State parameter for user type preservation
- Secure token exchange via backend
- Frontend callback processing

### Database Integration
- User profiles stored with type-specific data
- Refresh token rotation for security
- Session management across devices
- Audit logging for authentication events

---

## 🚀 Quick Reference Commands

### Test Authentication Flow
```bash
# Run backend
cd backend && php artisan serve

# Run frontend  
cd frontend && npm run dev

# Test OAuth
curl -X GET "http://localhost:8000/auth/google?type=company"

# Test API
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Common Debugging
```bash
# Clear Laravel caches
php artisan config:clear
php artisan route:clear

# Check Laravel logs
tail -f storage/logs/laravel.log

# Frontend network debugging
# Open browser DevTools → Network tab
# Check localStorage in Application tab
```

This comprehensive reference ensures you know exactly what endpoints and pages are available in your RAPP authentication system! 🎉
