import axios from 'axios';
import chalk from 'chalk';
import { config } from 'dotenv';

// Load environment variables
config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const TEST_TIMEOUT = parseInt(process.env.TEST_TIMEOUT) || 30000;

// Configure axios
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = TEST_TIMEOUT;

class AuthFlowTester {
  constructor() {
    this.testResults = [];
    this.accessToken = null;
    this.refreshToken = null;
    this.userId = null;
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

  async testCompanyRegistration() {
    const email = `test.company.${Date.now()}@rapp.com`;
    const response = await axios.post('/api/auth/register', {
      name: 'Test Company',
      email: email,
      password: 'TestPassword123!',
      password_confirmation: 'TestPassword123!',
      user_type: 'company'
    });

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    if (!response.data.access_token || !response.data.refresh_token) {
      throw new Error('Missing tokens in response');
    }

    if (response.data.user.user_type !== 'company') {
      throw new Error('User type should be company');
    }

    if (!response.data.user.company_data?.company_id) {
      throw new Error('Company ID should be generated');
    }

    this.accessToken = response.data.access_token;
    this.refreshToken = response.data.refresh_token;
    this.userId = response.data.user.id;
  }

  async testVendorRegistration() {
    const email = `test.vendor.${Date.now()}@rapp.com`;
    const response = await axios.post('/api/auth/register', {
      name: 'Test Vendor',
      email: email,
      password: 'TestPassword123!',
      password_confirmation: 'TestPassword123!',
      user_type: 'vendor'
    });

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    if (response.data.user.user_type !== 'vendor') {
      throw new Error('User type should be vendor');
    }

    if (response.data.user.status !== 'pending') {
      throw new Error('Vendor status should be pending');
    }
  }

  async testCompanyLogin() {
    // First register a company
    const email = `test.login.company.${Date.now()}@rapp.com`;
    await axios.post('/api/auth/register', {
      name: 'Test Login Company',
      email: email,
      password: 'TestPassword123!',
      password_confirmation: 'TestPassword123!',
      user_type: 'company'
    });

    // Then login
    const response = await axios.post('/api/auth/login', {
      email: email,
      password: 'TestPassword123!'
    });

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    if (!response.data.access_token) {
      throw new Error('Missing access token');
    }

    this.accessToken = response.data.access_token;
  }

  async testInvalidLogin() {
    try {
      await axios.post('/api/auth/login', {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });
      throw new Error('Should have failed with invalid credentials');
    } catch (error) {
      if (error.response?.status !== 401) {
        throw new Error(`Expected status 401, got ${error.response?.status}`);
      }
    }
  }

  async testProtectedRoute() {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await axios.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    });

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    if (!response.data.user) {
      throw new Error('User data missing in response');
    }
  }

  async testTokenRefresh() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post('/api/auth/refresh', {
      refresh_token: this.refreshToken
    });

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    if (!response.data.access_token || !response.data.refresh_token) {
      throw new Error('Missing tokens in refresh response');
    }

    // Verify new tokens are different
    if (response.data.access_token === this.accessToken) {
      throw new Error('New access token should be different');
    }

    if (response.data.refresh_token === this.refreshToken) {
      throw new Error('New refresh token should be different');
    }

    this.accessToken = response.data.access_token;
    this.refreshToken = response.data.refresh_token;
  }

  async testProfileCompletion() {
    // Test company profile completion
    const companyResponse = await axios.post('/api/auth/complete-profile', {
      company_name: 'Test Company Ltd',
      gst_number: '27ABCDE1234F1Z5',
      business_type: 'manufacturing',
      location: 'Mumbai, Maharashtra',
      description: 'Test company description',
      contact_phone: '+91 9876543210',
      website: 'https://testcompany.com'
    }, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    });

    if (companyResponse.status !== 200) {
      throw new Error(`Expected status 200, got ${companyResponse.status}`);
    }

    if (companyResponse.data.user.status !== 'active') {
      throw new Error('User status should be active after profile completion');
    }
  }

  async testLogout() {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await axios.post('/api/auth/logout', {}, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    });

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    // Try to access protected route with old token (should fail)
    try {
      await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });
      throw new Error('Should have failed with revoked token');
    } catch (error) {
      if (error.response?.status !== 401) {
        throw new Error(`Expected status 401, got ${error.response?.status}`);
      }
    }

    this.accessToken = null;
    this.refreshToken = null;
  }

  async testPasswordValidation() {
    try {
      await axios.post('/api/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: '123', // Too short
        password_confirmation: '123',
        user_type: 'company'
      });
      throw new Error('Should have failed with weak password');
    } catch (error) {
      if (error.response?.status !== 422) {
        throw new Error(`Expected status 422, got ${error.response?.status}`);
      }
    }
  }

  async testEmailValidation() {
    try {
      await axios.post('/api/auth/register', {
        name: 'Test User',
        email: 'invalid-email', // Invalid email
        password: 'TestPassword123!',
        password_confirmation: 'TestPassword123!',
        user_type: 'company'
      });
      throw new Error('Should have failed with invalid email');
    } catch (error) {
      if (error.response?.status !== 422) {
        throw new Error(`Expected status 422, got ${error.response?.status}`);
      }
    }
  }

  async testDuplicateEmail() {
    const email = `duplicate.${Date.now()}@rapp.com`;
    
    // First registration
    await axios.post('/api/auth/register', {
      name: 'Test User 1',
      email: email,
      password: 'TestPassword123!',
      password_confirmation: 'TestPassword123!',
      user_type: 'company'
    });

    // Second registration with same email
    try {
      await axios.post('/api/auth/register', {
        name: 'Test User 2',
        email: email,
        password: 'TestPassword123!',
        password_confirmation: 'TestPassword123!',
        user_type: 'vendor'
      });
      throw new Error('Should have failed with duplicate email');
    } catch (error) {
      if (error.response?.status !== 422) {
        throw new Error(`Expected status 422, got ${error.response?.status}`);
      }
    }
  }

  async runAllTests() {
    console.log(chalk.yellow('\n🚀 Starting RAPP Authentication Flow Tests\n'));
    console.log(chalk.cyan(`API Base URL: ${API_BASE_URL}`));
    console.log(chalk.cyan(`Test Timeout: ${TEST_TIMEOUT}ms\n`));

    // Registration Tests
    await this.runTest('Company Registration', () => this.testCompanyRegistration());
    await this.runTest('Vendor Registration', () => this.testVendorRegistration());

    // Login Tests
    await this.runTest('Company Login', () => this.testCompanyLogin());
    await this.runTest('Invalid Login', () => this.testInvalidLogin());

    // Protected Route Tests
    await this.runTest('Protected Route Access', () => this.testProtectedRoute());

    // Token Management Tests
    await this.runTest('Token Refresh', () => this.testTokenRefresh());

    // Profile Management Tests
    await this.runTest('Profile Completion', () => this.testProfileCompletion());

    // Validation Tests
    await this.runTest('Password Validation', () => this.testPasswordValidation());
    await this.runTest('Email Validation', () => this.testEmailValidation());
    await this.runTest('Duplicate Email Check', () => this.testDuplicateEmail());

    // Logout Tests
    await this.runTest('Logout', () => this.testLogout());

    // Print results summary
    this.printSummary();
  }

  printSummary() {
    console.log(chalk.yellow('\n📊 Test Results Summary'));
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
      console.log(chalk.green('\n🎉 All tests passed! Authentication system is working correctly.'));
    } else {
      console.log(chalk.red('\n⚠️  Some tests failed. Please check the authentication system.'));
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AuthFlowTester();
  tester.runAllTests().catch(error => {
    console.error(chalk.red('\n💥 Test suite crashed:'), error);
    process.exit(1);
  });
}

export default AuthFlowTester;
