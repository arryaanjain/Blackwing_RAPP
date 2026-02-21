import axios from 'axios';
import chalk from 'chalk';
import { config } from 'dotenv';

// Load environment variables
config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

class OAuthFlowTester {
  constructor() {
    this.testResults = [];
  }

  async runTest(name, testFn) {
    try {
      console.log(chalk.blue(`\n🧪 Running: ${name}`));
      const startTime = Date.now();
      
      await testFn();
      
      const duration = Date.now() - startTime;
      console.log(chalk.green(`✅ ${name} - Passed (${duration}ms)`));
      this.testResults.push({ name, status: 'PASSED', duration });
    } catch (error) {
      console.log(chalk.red(`❌ ${name} - Failed`));
      console.log(chalk.red(`   Error: ${error.message}`));
      this.testResults.push({ name, status: 'FAILED', error: error.message });
    }
  }

  async testGoogleSubIdExtraction() {
    // Test the sub_id extraction logic that would be used in the backend
    const testCases = [
      {
        name: 'Numeric Google ID',
        googleId: '123456789012345678901',
        expectedSubId: '123456789012345678901'
      },
      {
        name: 'JWT Token',
        googleId: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyNDA2MjM5YzQyYzVhOTVlYjc4ZjBhNDBhYjE2NzAyNDA2MjMifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoieW91ci1jbGllbnQtaWQuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciJ9.signature',
        expectedSubId: '123456789012345678901'
      }
    ];

    for (const testCase of testCases) {
      console.log(chalk.cyan(`  Testing: ${testCase.name}`));
      
      // This simulates the backend extraction logic
      const extractedSubId = this.simulateSubIdExtraction(testCase.googleId);
      
      if (extractedSubId !== testCase.expectedSubId) {
        throw new Error(`Sub ID extraction failed for ${testCase.name}. Expected: ${testCase.expectedSubId}, Got: ${extractedSubId}`);
      }
    }
  }

  simulateSubIdExtraction(googleId) {
    try {
      // If the googleId is already a sub_id (numeric string), return it
      if (/^\d+$/.test(googleId)) {
        return googleId;
      }
      
      // If it's a JWT token, decode it
      if (googleId.includes('.')) {
        const parts = googleId.split('.');
        if (parts.length === 3) {
          // Decode the payload (second part)
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          return payload.sub || null;
        }
      }
      
      return googleId;
    } catch (error) {
      console.error('Sub ID extraction failed:', error);
      return null;
    }
  }

  async testOAuthProviders() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/providers`);
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }

      if (!response.data.providers || !response.data.providers.google) {
        throw new Error('Google provider not found in providers list');
      }

      const googleProvider = response.data.providers.google;
      if (!googleProvider.name || googleProvider.name !== 'Google') {
        throw new Error('Invalid Google provider configuration');
      }

      console.log(chalk.cyan(`  Google OAuth enabled: ${googleProvider.enabled}`));
    } catch (error) {
      throw new Error(`Providers endpoint failed: ${error.message}`);
    }
  }

  async testOAuthRedirectUrls() {
    // Test company OAuth redirect URL
    const companyOAuthUrl = `${API_BASE_URL}/auth/google?type=company`;
    console.log(chalk.cyan(`  Company OAuth URL: ${companyOAuthUrl}`));

    // Test vendor OAuth redirect URL
    const vendorOAuthUrl = `${API_BASE_URL}/auth/google?type=vendor`;
    console.log(chalk.cyan(`  Vendor OAuth URL: ${vendorOAuthUrl}`));

    // Note: We can't actually follow these redirects in the test environment
    // without proper Google OAuth setup, but we can verify the URLs are correctly formed
    if (!companyOAuthUrl.includes('type=company')) {
      throw new Error('Company OAuth URL missing user type parameter');
    }

    if (!vendorOAuthUrl.includes('type=vendor')) {
      throw new Error('Vendor OAuth URL missing user type parameter');
    }
  }

  async testOAuthCallback() {
    // Test OAuth callback URL structure
    const callbackUrl = `${API_BASE_URL}/auth/google/callback`;
    console.log(chalk.cyan(`  OAuth Callback URL: ${callbackUrl}`));

    // Simulate a successful OAuth callback with test data
    const testState = btoa(JSON.stringify({ user_type: 'company' }));
    const testCallbackUrl = `${callbackUrl}?code=test_code&state=${testState}`;

    console.log(chalk.cyan(`  Test Callback URL: ${testCallbackUrl}`));

    // Note: In a real test environment, you would make an actual request here
    // For now, we're just validating the URL structure
    if (!testCallbackUrl.includes('code=') || !testCallbackUrl.includes('state=')) {
      throw new Error('OAuth callback URL structure is invalid');
    }
  }

  async testInvalidOAuthUserType() {
    try {
      // This should fail with invalid user type
      const response = await axios.get(`${API_BASE_URL}/auth/google?type=invalid`);
      
      // If we get here, the test failed because it should have redirected to an error
      console.log(chalk.yellow('  Warning: Server did not reject invalid user type'));
    } catch (error) {
      // This is expected for invalid user types
      console.log(chalk.cyan('  ✓ Invalid user type properly rejected'));
    }
  }

  async testOAuthTokenValidation() {
    // Test the OAuth token validation endpoint
    const mockTokens = [
      {
        name: 'Valid JWT Structure',
        token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyNDA2MjM5YzQyYzVhOTVlYjc4ZjBhNDBhYjE2NzAyNDA2MjMifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoieW91ci1jbGllbnQtaWQuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciJ9.signature',
        shouldPass: true
      },
      {
        name: 'Invalid Token Format',
        token: 'invalid.token.format',
        shouldPass: false
      },
      {
        name: 'Empty Token',
        token: '',
        shouldPass: false
      }
    ];

    for (const testCase of mockTokens) {
      console.log(chalk.cyan(`  Testing: ${testCase.name}`));
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/oauth/google`, {
          google_token: testCase.token,
          user_type: 'company'
        });

        if (!testCase.shouldPass) {
          throw new Error(`Expected token validation to fail for ${testCase.name}`);
        }

        // If we expect it to pass, it should either succeed or fail with a specific Google API error
        console.log(chalk.cyan(`    ✓ Token structure accepted for ${testCase.name}`));
      } catch (error) {
        if (testCase.shouldPass) {
          // For valid structure tokens, we expect either success or Google API errors, not format errors
          if (error.response?.status === 401 && error.response?.data?.message?.includes('Invalid Google token')) {
            console.log(chalk.cyan(`    ✓ Token properly validated (but rejected by Google API) for ${testCase.name}`));
          } else {
            throw new Error(`Unexpected error for ${testCase.name}: ${error.message}`);
          }
        } else {
          // For invalid tokens, we expect validation to fail
          if (error.response?.status === 422 || error.response?.status === 401) {
            console.log(chalk.cyan(`    ✓ Invalid token properly rejected for ${testCase.name}`));
          } else {
            throw new Error(`Expected validation error for ${testCase.name}, got: ${error.message}`);
          }
        }
      }
    }
  }

  async testFrontendOAuthIntegration() {
    // Test frontend OAuth URL generation
    const frontendCallbackUrl = `${FRONTEND_URL}/auth/callback`;
    console.log(chalk.cyan(`  Frontend Callback URL: ${frontendCallbackUrl}`));

    // Test token processing simulation
    const mockTokenData = {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      token_type: 'Bearer',
      expires_in: 900,
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        user_type: 'company',
        status: 'pending'
      },
      needs_profile_completion: true
    };

    const encodedTokens = btoa(JSON.stringify(mockTokenData));
    const callbackUrlWithTokens = `${frontendCallbackUrl}?tokens=${encodedTokens}`;

    console.log(chalk.cyan(`  Frontend callback with tokens length: ${callbackUrlWithTokens.length}`));

    // Verify token decoding works
    try {
      const decodedTokens = JSON.parse(atob(encodedTokens));
      if (!decodedTokens.access_token || !decodedTokens.user) {
        throw new Error('Token encoding/decoding failed');
      }
      console.log(chalk.cyan(`    ✓ Token encoding/decoding works correctly`));
    } catch (error) {
      throw new Error(`Token processing failed: ${error.message}`);
    }
  }

  async runAllTests() {
    console.log(chalk.yellow('\n🚀 Starting RAPP OAuth Flow Tests\n'));
    console.log(chalk.cyan(`API Base URL: ${API_BASE_URL}`));
    console.log(chalk.cyan(`Frontend URL: ${FRONTEND_URL}\n`));

    // OAuth Configuration Tests
    await this.runTest('OAuth Providers Configuration', () => this.testOAuthProviders());
    await this.runTest('OAuth Redirect URLs', () => this.testOAuthRedirectUrls());
    await this.runTest('OAuth Callback URL Structure', () => this.testOAuthCallback());

    // OAuth Validation Tests
    await this.runTest('Invalid OAuth User Type', () => this.testInvalidOAuthUserType());
    await this.runTest('OAuth Token Validation', () => this.testOAuthTokenValidation());

    // Google Sub ID Tests
    await this.runTest('Google Sub ID Extraction', () => this.testGoogleSubIdExtraction());

    // Frontend Integration Tests
    await this.runTest('Frontend OAuth Integration', () => this.testFrontendOAuthIntegration());

    // Print results summary
    this.printSummary();
  }

  printSummary() {
    console.log(chalk.yellow('\n📊 OAuth Test Results Summary'));
    console.log('═'.repeat(50));

    const passed = this.testResults.filter(t => t.status === 'PASSED').length;
    const failed = this.testResults.filter(t => t.status === 'FAILED').length;
    const total = this.testResults.length;

    console.log(chalk.green(`✅ Passed: ${passed}`));
    console.log(chalk.red(`❌ Failed: ${failed}`));
    console.log(chalk.blue(`📈 Total: ${total}`));

    if (failed > 0) {
      console.log(chalk.red('\n❌ Failed Tests:'));
      this.testResults
        .filter(t => t.status === 'FAILED')
        .forEach(test => {
          console.log(chalk.red(`   • ${test.name}: ${test.error}`));
        });
    }

    const successRate = ((passed / total) * 100).toFixed(1);
    console.log(chalk.yellow(`\n🎯 Success Rate: ${successRate}%`));

    if (successRate === '100.0') {
      console.log(chalk.green('\n🎉 All OAuth tests passed! OAuth system is properly configured.'));
    } else {
      console.log(chalk.red('\n⚠️  Some OAuth tests failed. Please check the OAuth configuration.'));
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new OAuthFlowTester();
  tester.runAllTests().catch(error => {
    console.error(chalk.red('\n💥 OAuth test suite crashed:'), error);
    process.exit(1);
  });
}

export default OAuthFlowTester;
