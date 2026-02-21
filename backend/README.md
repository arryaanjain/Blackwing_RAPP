# RAPP Backend - Laravel API

Laravel 12 backend API for the RAPP vendor-company connection platform.

## 🚀 Quick Start

### Installation
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Environment Configuration
```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rapp
DB_USERNAME=root
DB_PASSWORD=

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## 🏗️ Architecture

### Controllers
- **AuthController**: Authentication, profile switching
- **ProfileController**: Profile management (company/vendor)
- **VendorCompanyConnectionController**: Connection system
- **HealthController**: System health checks

### Models
- **User**: Authentication and profile management
- **Company**: Company profile data
- **Vendor**: Vendor profile data  
- **VendorCompanyConnectionRequest**: Connection requests
- **VendorCompanyConnection**: Active connections
- **RefreshToken**: JWT token management

### Key Relationships
```php
// User model relationships
User -> hasMany(Company)
User -> hasMany(Vendor)
User -> hasOne(companyProfile) // First company
User -> hasOne(vendorProfile)  // First vendor

// Connection relationships
VendorCompanyConnectionRequest -> belongsTo(User, 'vendor_user_id')
VendorCompanyConnectionRequest -> belongsTo(User, 'company_user_id')
```

## 🔧 API Endpoints

### Authentication
```
POST   /auth/google                    # Initiate Google OAuth
GET    /auth/google/callback           # OAuth callback
POST   /api/auth/logout               # Logout
GET    /api/auth/me                   # Current user data
```

### Profile Management
```
GET    /api/profiles/check/company     # Check company profile
GET    /api/profiles/check/vendor      # Check vendor profile
POST   /api/profiles/switch            # Switch active profile
POST   /api/profiles/company           # Create company profile
POST   /api/profiles/vendor            # Create vendor profile
PUT    /api/profiles/company/{id}      # Update company profile
PUT    /api/profiles/vendor/{id}       # Update vendor profile
```

### Connection System
```
POST   /api/connections/request        # Send connection request
GET    /api/connections               # Get active connections
GET    /api/connections/requests/sent # Get sent requests (vendor)
GET    /api/connections/requests/received # Get received requests (company)
POST   /api/connections/requests/{id}/approve # Approve request
POST   /api/connections/requests/{id}/deny    # Deny request
POST   /api/connections/{id}/revoke   # Revoke connection
```

### Health & Debug
```
GET    /api/health                    # Public health check
GET    /api/auth-health              # Authenticated health check  
GET    /api/debug-connection         # Connection system debug
```

## 🗄️ Database Schema

### Users Table
```sql
users (
    id, email, name, password,
    google_id, google_sub_id,
    current_profile_type,  -- 'company' | 'vendor' | null
    current_profile_id,    -- Active profile ID
    is_active, created_at, updated_at
)
```

### Companies Table
```sql
companies (
    id, user_id,
    company_name, company_id,     -- COMP-XXXX format
    share_id,                     -- SH-XXXXXXXXXXXX format
    industry, business_description,
    website, contact_email, phone,
    address, city, state, postal_code, country,
    status, created_at, updated_at
)
```

### Connection Requests Table
```sql
vendor_company_connection_requests (
    id, vendor_user_id, company_user_id,
    company_share_id, message,
    status,                       -- 'pending' | 'approved' | 'denied' | 'cancelled'
    reviewed_by, reviewed_at, review_notes,
    vendor_profile_data,          -- JSON snapshot
    expires_at, created_at, updated_at
)
```

## 🔧 Recent Fixes & Improvements

### Authentication System
✅ **Profile Switching**: Fixed `/api/profiles/switch` endpoint
✅ **User Relationships**: Added `companyProfile` and `vendorProfile` relationships
✅ **Fresh User Data**: Enhanced `/api/auth/me` endpoint

### Connection System
✅ **Nullable Fields**: Fixed validation for optional message/notes fields
✅ **Share ID Lookup**: Proper company resolution using `share_id`
✅ **Error Handling**: Improved error messages and debugging
✅ **Request Validation**: Enhanced input validation with proper null handling

### Database Improvements
✅ **Relationship Fixes**: Added missing User model relationships
✅ **Seeders**: Comprehensive test data for development
✅ **Migrations**: Proper database structure with constraints

## 🛠️ Development

### Artisan Commands
```bash
# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Database operations
php artisan migrate:fresh --seed
php artisan db:seed --class=VendorCompanyConnectionSeeder

# Generate API documentation
php artisan route:list --path=api
```

### Testing
```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage
```

### Debugging
```bash
# Check logs
tail -f storage/logs/laravel.log

# Debug routes
php artisan route:list | grep api

# Check database
php artisan tinker
>>> User::with('companies', 'vendors')->find(1)
```

## 🚨 Common Issues

### Profile Switching
**Issue**: 403 errors after profile switching
**Solution**: Ensure `current_profile_type` is updated in database

**Issue**: User state not updating
**Solution**: Call `/api/auth/me` after switching profiles

### Connection Requests
**Issue**: "Company not found" with valid company ID
**Solution**: Use `share_id` (SH-XXXXXXXXXXXX) not `company_id` (COMP-XXXX)

**Issue**: "Undefined array key 'message'" errors
**Solution**: Fixed with nullable field handling in validation

### Database Issues
**Issue**: Missing relationship errors
**Solution**: Added `companyProfile` and `vendorProfile` relationships

## 📦 Dependencies

### Core Dependencies
- **laravel/framework**: ^12.0
- **laravel/sanctum**: ^4.0
- **guzzlehttp/guzzle**: ^7.8

### Development Dependencies
- **phpunit/phpunit**: ^11.0.1
- **laravel/pint**: ^1.13
- **fakerphp/faker**: ^1.23

## 🔒 Security

### Authentication
- OAuth integration with Google
- Sanctum API token authentication
- Refresh token support with automatic rotation

### Authorization
- Profile-based access control
- Endpoint-level permission checking
- User ownership validation

### Data Protection
- Input validation on all endpoints
- SQL injection prevention via Eloquent
- XSS protection through Laravel defaults

---

Built with Laravel 12 for the RAPP platform 🚀

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
