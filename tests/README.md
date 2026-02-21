# RAPP Authentication System Tests

This directory contains comprehensive test suites for the RAPP (Company-Vendor Platform) authentication system. The tests validate the complete authentication flow for both company and vendor user types, OAuth integration with Google, token management, and frontend storage.

## 🏗️ Test Architecture

### Test Suites

1. **`auth-flow-test.js`** - Core authentication flow testing
2. **`oauth-flow-test.js`** - Google OAuth integration testing  
3. **`refresh-token-test.js`** - Token rotation and security testing
4. **`localStorage-analyzer.js`** - Frontend storage analysis and debugging

## 🚀 Quick Start

### Prerequisites

1. **Backend Setup**: Ensure Laravel backend is running on `http://localhost:8000`
2. **Frontend Setup**: Ensure React frontend is running on `http://localhost:5173`
3. **Database**: MySQL database should be set up and migrations run
4. **Environment**: Copy `.env.example` to `.env` and configure test credentials

### Installation

```bash
# Navigate to tests directory
cd tests

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your test configuration
```

### Running Tests

```bash
# Run all tests
npm run test:all

# Run individual test suites
npm run test:auth        # Authentication flow tests
npm run test:oauth       # OAuth integration tests  
npm run test:refresh     # Refresh token tests
npm run test:storage     # LocalStorage analysis

# Run with verbose output
npm run test:verbose
```

## 📋 Test Configuration

### Environment Variables (`.env`)

```bash
# API Configuration
API_BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Test User Credentials
TEST_COMPANY_EMAIL=test.company@example.com
TEST_COMPANY_PASSWORD=password123
TEST_VENDOR_EMAIL=test.vendor@example.com  
TEST_VENDOR_PASSWORD=password123

# Test Company Data
TEST_COMPANY_NAME=Test Company Inc
TEST_BUSINESS_LICENSE=TEST123456
TEST_COMPANY_WEBSITE=https://testcompany.com
TEST_COMPANY_ADDRESS=123 Test Street, Test City
TEST_COMPANY_PHONE=+1234567890

# Test Vendor Data
TEST_VENDOR_BUSINESS_NAME=Test Vendor LLC
TEST_VENDOR_LICENSE=VENDOR789
TEST_VENDOR_SERVICES=Web Development,Design,Consulting
TEST_VENDOR_EXPERIENCE=5 years
TEST_VENDOR_PORTFOLIO=https://testvendor.com

# OAuth Test Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🧪 Test Suites Detailed

### 1. Authentication Flow Tests (`auth-flow-test.js`)

Tests the complete authentication workflow for both user types.

**Test Coverage:**
- User registration (company & vendor)
- Email validation and verification
- Login with credentials
- Password validation
- Profile completion flow
- User data validation
- Error handling and validation

**Key Scenarios:**
```javascript
// Company registration flow
await tester.testCompanyRegistration();
await tester.testCompanyLogin();
await tester.testCompanyProfileCompletion();

// Vendor registration flow  
await tester.testVendorRegistration();
await tester.testVendorLogin();
await tester.testVendorProfileCompletion();

// Security tests
await tester.testInvalidCredentials();
await tester.testPasswordValidation();
```

### 2. OAuth Flow Tests (`oauth-flow-test.js`)

Validates Google OAuth integration and sub_id extraction functionality.

**Test Coverage:**
- OAuth provider configuration
- Google OAuth redirect URLs
- OAuth callback handling
- Sub ID extraction from Google tokens
- OAuth state management
- Frontend integration
- Security validations

**Key Features:**
```javascript
// Sub ID extraction testing
await tester.testGoogleSubIdExtraction();

// OAuth provider tests
await tester.testOAuthProviders();
await tester.testOAuthRedirectUrls();

// Security tests
await tester.testInvalidOAuthUserType();
await tester.testOAuthTokenValidation();
```

### 3. Refresh Token Tests (`refresh-token-test.js`)

Comprehensive testing of the token rotation system and security.

**Test Coverage:**
- Refresh token generation
- Token rotation mechanism
- Old token invalidation
- Multiple consecutive refreshes
- Token expiration handling
- Access token validation
- Logout token cleanup
- Security vulnerabilities

**Security Tests:**
```javascript
// Token security
await tester.testOldRefreshTokenInvalidation();
await tester.testRefreshTokenExpiration();
await tester.testTokenRefreshSecurity();

// Multiple refresh cycles
await tester.testMultipleTokenRefresh();

// Cleanup validation
await tester.testLogoutTokenInvalidation();
```

### 4. LocalStorage Analyzer (`localStorage-analyzer.js`)

Analyzes and validates frontend storage management.

**Analysis Coverage:**
- Token storage structure
- User data persistence
- OAuth state management
- Profile completion data
- Session management
- Storage cleanup procedures
- Size and performance analysis

**Debug Utilities:**
```javascript
// Storage debugging tools
const utilities = analyzer.generateStorageUtilities();
utilities.clearRappStorage();     // Clear all RAPP data
utilities.getAuthState();         // Get current auth state
utilities.areTokensExpired();     // Check token expiration
```

## 🔍 Test Results and Reporting

### Test Output Format

Each test suite provides detailed colored output:

```
🚀 Starting RAPP Authentication Tests

🧪 Running: Company Registration
✅ Company Registration - Passed (1,234ms)

🧪 Running: OAuth Integration  
❌ OAuth Integration - Failed
   Error: Invalid Google client configuration

📊 Test Results Summary
═══════════════════════════════
✅ Passed: 8
❌ Failed: 2  
📈 Total: 10
🎯 Success Rate: 80.0%
⏱️  Total Duration: 12,345ms
```

### Detailed Error Reporting

Failed tests include:
- Specific error messages
- Stack traces (when available)
- Request/response data
- Troubleshooting suggestions

## 🐛 Debugging and Troubleshooting

### Common Issues

**1. Connection Errors**
```bash
Error: connect ECONNREFUSED 127.0.0.1:8000
```
- Ensure Laravel backend is running
- Check API_BASE_URL in `.env`
- Verify database connection

**2. Authentication Failures**
```bash
Error: Request failed with status code 422
```
- Check test user credentials
- Verify database has proper migrations
- Check Laravel logs

**3. OAuth Configuration**
```bash
Error: Invalid Google client configuration
```
- Verify Google OAuth credentials
- Check Laravel `.env` OAuth settings
- Ensure proper redirect URLs

### Debug Mode

Run tests with additional debugging:

```bash
# Enable debug output
DEBUG=true npm run test:auth

# Run single test with verbose logging
node auth-flow-test.js --verbose

# Check specific test section
node oauth-flow-test.js --test="Sub ID Extraction"
```

### Manual Testing Tools

Use the localStorage analyzer utilities in browser console:

```javascript
// In browser console (F12)
const utilities = {
  clearRappStorage: () => {
    ['rapp_access_token', 'rapp_refresh_token', 'rapp_user_data'].forEach(key => {
      localStorage.removeItem(key);
    });
  },
  
  getAuthState: () => ({
    hasTokens: !!localStorage.getItem('rapp_access_token'),
    userType: localStorage.getItem('rapp_user_type'),
    profileComplete: localStorage.getItem('rapp_profile_complete')
  })
};

utilities.getAuthState();
```

## 🚀 Continuous Integration

### GitHub Actions Integration

```yaml
# .github/workflows/auth-tests.yml
name: RAPP Auth Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: rapp_test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Laravel
      run: |
        cd backend
        composer install
        php artisan migrate --env=testing
        php artisan serve &
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Run Auth Tests  
      run: |
        cd tests
        npm install
        npm run test:all
```

## 📈 Performance Benchmarks

### Expected Performance

- **Registration Flow**: < 2 seconds
- **Login Flow**: < 1 second  
- **Token Refresh**: < 500ms
- **OAuth Callback**: < 3 seconds
- **Profile Completion**: < 2 seconds

### Performance Monitoring

```javascript
// Performance tracking in tests
const startTime = Date.now();
await performOperation();
const duration = Date.now() - startTime;

if (duration > 2000) {
  console.warn(`Slow operation detected: ${duration}ms`);
}
```

## 🔧 Test Maintenance

### Adding New Tests

1. **Create test function** in appropriate suite
2. **Add test to runner** in `runAllTests()` method
3. **Update documentation** with new test coverage
4. **Add environment variables** if needed

### Test Data Management

- Use dynamic test data with timestamps
- Clean up test users after completion
- Avoid hardcoded credentials in tests
- Use environment variables for configuration

### Version Compatibility

- **Laravel**: 12.x compatible
- **React**: 18.x compatible  
- **Node.js**: 18.x+ required
- **MySQL**: 8.0+ recommended

## 📞 Support

For test-related issues:

1. Check test output for specific error messages
2. Verify backend/frontend are running correctly
3. Check database connectivity and migrations
4. Review environment configuration
5. Check Laravel and React application logs

## 🎯 Test Coverage Goals

- ✅ **Authentication**: 100% flow coverage
- ✅ **OAuth Integration**: Complete Google OAuth
- ✅ **Token Management**: Full security testing  
- ✅ **Frontend Storage**: Complete localStorage testing
- ✅ **Error Handling**: All error scenarios
- ✅ **User Types**: Both company and vendor flows
- ✅ **Profile Management**: Complete profile workflows

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Compatibility**: Laravel 12.x, React 18.x
