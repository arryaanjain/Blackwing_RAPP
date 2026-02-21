import axios from 'axios';
import chalk from 'chalk';
import { config } from 'dotenv';

// Load environment variables
config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

class RefreshTokenTester {
  constructor() {
    this.testResults = [];
    this.testUser = null;
    this.userTokens = null;
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

  async setupTestUser() {
    // Create a test user for refresh token testing
    const testUserData = {
      name: 'Refresh Token Test User',
      email: `refresh_test_${Date.now()}@example.com`,
      password: 'password123',
      password_confirmation: 'password123',
      user_type: 'company'
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, testUserData);
      
      if (response.status !== 201) {
        throw new Error(`Failed to create test user: ${response.status}`);
      }

      this.testUser = testUserData;
      this.userTokens = response.data;
      
      console.log(chalk.cyan(`  Test user created: ${testUserData.email}`));
      return response.data;
    } catch (error) {
      throw new Error(`Failed to setup test user: ${error.message}`);
    }
  }

  async cleanupTestUser() {
    if (this.testUser && this.userTokens) {
      try {
        // Logout to clean up tokens
        await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${this.userTokens.access_token}`
          }
        });
        console.log(chalk.cyan(`  Test user cleaned up: ${this.testUser.email}`));
      } catch (error) {
        console.log(chalk.yellow(`  Warning: Failed to cleanup test user: ${error.message}`));
      }
    }
  }

  async testRefreshTokenGeneration() {
    if (!this.userTokens) {
      throw new Error('Test user not set up');
    }

    // Verify that refresh token was generated during registration
    if (!this.userTokens.refresh_token) {
      throw new Error('Refresh token not generated during registration');
    }

    if (!this.userTokens.access_token) {
      throw new Error('Access token not generated during registration');
    }

    // Verify token structure
    const tokenParts = this.userTokens.access_token.split('|');
    if (tokenParts.length !== 2) {
      throw new Error('Access token has invalid structure');
    }

    console.log(chalk.cyan(`  ✓ Access token generated with ID: ${tokenParts[0]}`));
    console.log(chalk.cyan(`  ✓ Refresh token generated: ${this.userTokens.refresh_token.substring(0, 20)}...`));
  }

  async testRefreshTokenUsage() {
    if (!this.userTokens?.refresh_token) {
      throw new Error('No refresh token available for testing');
    }

    const originalAccessToken = this.userTokens.access_token;
    const originalRefreshToken = this.userTokens.refresh_token;

    // Use refresh token to get new tokens
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refresh_token: originalRefreshToken
    });

    if (response.status !== 200) {
      throw new Error(`Refresh failed with status: ${response.status}`);
    }

    const newTokens = response.data;

    // Verify new tokens are different
    if (newTokens.access_token === originalAccessToken) {
      throw new Error('New access token is the same as original');
    }

    if (newTokens.refresh_token === originalRefreshToken) {
      throw new Error('New refresh token is the same as original');
    }

    // Update our tokens for subsequent tests
    this.userTokens = newTokens;

    console.log(chalk.cyan(`  ✓ New access token generated`));
    console.log(chalk.cyan(`  ✓ New refresh token generated`));
    console.log(chalk.cyan(`  ✓ Token rotation successful`));
  }

  async testOldRefreshTokenInvalidation() {
    // First, get current tokens
    const currentRefreshToken = this.userTokens.refresh_token;

    // Refresh once
    const firstRefreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refresh_token: currentRefreshToken
    });

    if (firstRefreshResponse.status !== 200) {
      throw new Error(`First refresh failed: ${firstRefreshResponse.status}`);
    }

    // Try to use the old refresh token again - this should fail
    try {
      await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refresh_token: currentRefreshToken
      });
      
      throw new Error('Old refresh token was accepted (should have been invalidated)');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 422) {
        console.log(chalk.cyan(`  ✓ Old refresh token properly invalidated`));
      } else {
        throw new Error(`Unexpected error when using old refresh token: ${error.message}`);
      }
    }

    // Update tokens from first refresh
    this.userTokens = firstRefreshResponse.data;
  }

  async testRefreshTokenExpiration() {
    // Test with an obviously expired/invalid refresh token
    const expiredToken = 'expired_token_12345';

    try {
      await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refresh_token: expiredToken
      });
      
      throw new Error('Expired refresh token was accepted');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 422) {
        console.log(chalk.cyan(`  ✓ Expired refresh token properly rejected`));
      } else {
        throw new Error(`Unexpected error with expired token: ${error.message}`);
      }
    }
  }

  async testAccessTokenValidation() {
    if (!this.userTokens?.access_token) {
      throw new Error('No access token available for testing');
    }

    // Test that access token works for protected endpoints
    const response = await axios.get(`${API_BASE_URL}/api/auth/user`, {
      headers: {
        'Authorization': `Bearer ${this.userTokens.access_token}`
      }
    });

    if (response.status !== 200) {
      throw new Error(`Protected endpoint failed: ${response.status}`);
    }

    if (!response.data.user) {
      throw new Error('User data not returned from protected endpoint');
    }

    console.log(chalk.cyan(`  ✓ Access token works for protected endpoints`));
    console.log(chalk.cyan(`  ✓ User data retrieved: ${response.data.user.email}`));
  }

  async testInvalidAccessToken() {
    const invalidToken = 'invalid_access_token_12345';

    try {
      await axios.get(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${invalidToken}`
        }
      });
      
      throw new Error('Invalid access token was accepted');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(chalk.cyan(`  ✓ Invalid access token properly rejected`));
      } else {
        throw new Error(`Unexpected error with invalid access token: ${error.message}`);
      }
    }
  }

  async testTokenRefreshSecurity() {
    // Test that refresh tokens can't be used as access tokens
    if (!this.userTokens?.refresh_token) {
      throw new Error('No refresh token available for testing');
    }

    try {
      await axios.get(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${this.userTokens.refresh_token}`
        }
      });
      
      throw new Error('Refresh token was accepted as access token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(chalk.cyan(`  ✓ Refresh token properly rejected as access token`));
      } else {
        throw new Error(`Unexpected error using refresh token as access token: ${error.message}`);
      }
    }
  }

  async testMultipleTokenRefresh() {
    // Test multiple consecutive refreshes
    const refreshCount = 3;
    let currentTokens = this.userTokens;

    for (let i = 0; i < refreshCount; i++) {
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refresh_token: currentTokens.refresh_token
      });

      if (response.status !== 200) {
        throw new Error(`Refresh ${i + 1} failed with status: ${response.status}`);
      }

      currentTokens = response.data;
      
      // Verify the new tokens work
      const userResponse = await axios.get(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${currentTokens.access_token}`
        }
      });

      if (userResponse.status !== 200) {
        throw new Error(`Access token from refresh ${i + 1} doesn't work`);
      }
    }

    this.userTokens = currentTokens;
    console.log(chalk.cyan(`  ✓ Successfully completed ${refreshCount} consecutive refreshes`));
  }

  async testLogoutTokenInvalidation() {
    if (!this.userTokens) {
      throw new Error('No tokens available for logout testing');
    }

    const accessToken = this.userTokens.access_token;
    const refreshToken = this.userTokens.refresh_token;

    // Logout
    const response = await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status !== 200) {
      throw new Error(`Logout failed with status: ${response.status}`);
    }

    // Try to use access token after logout - should fail
    try {
      await axios.get(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      throw new Error('Access token still valid after logout');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(chalk.cyan(`  ✓ Access token invalidated after logout`));
      } else {
        throw new Error(`Unexpected error testing logout access token: ${error.message}`);
      }
    }

    // Try to use refresh token after logout - should fail
    try {
      await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refresh_token: refreshToken
      });
      
      throw new Error('Refresh token still valid after logout');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 422) {
        console.log(chalk.cyan(`  ✓ Refresh token invalidated after logout`));
      } else {
        throw new Error(`Unexpected error testing logout refresh token: ${error.message}`);
      }
    }

    // Clear our tokens since we logged out
    this.userTokens = null;
  }

  async runAllTests() {
    console.log(chalk.yellow('\n🚀 Starting RAPP Refresh Token Tests\n'));
    console.log(chalk.cyan(`API Base URL: ${API_BASE_URL}\n`));

    try {
      // Setup
      await this.runTest('Setup Test User', () => this.setupTestUser());

      // Token Generation Tests
      await this.runTest('Refresh Token Generation', () => this.testRefreshTokenGeneration());
      await this.runTest('Access Token Validation', () => this.testAccessTokenValidation());

      // Token Refresh Tests
      await this.runTest('Refresh Token Usage', () => this.testRefreshTokenUsage());
      await this.runTest('Old Refresh Token Invalidation', () => this.testOldRefreshTokenInvalidation());
      await this.runTest('Multiple Token Refresh', () => this.testMultipleTokenRefresh());

      // Security Tests
      await this.runTest('Refresh Token Expiration', () => this.testRefreshTokenExpiration());
      await this.runTest('Invalid Access Token', () => this.testInvalidAccessToken());
      await this.runTest('Token Refresh Security', () => this.testTokenRefreshSecurity());

      // Cleanup Tests
      await this.runTest('Logout Token Invalidation', () => this.testLogoutTokenInvalidation());

    } finally {
      // Always try to cleanup
      try {
        await this.cleanupTestUser();
      } catch (error) {
        console.log(chalk.yellow(`Warning: Cleanup failed: ${error.message}`));
      }
    }

    // Print results summary
    this.printSummary();
  }

  printSummary() {
    console.log(chalk.yellow('\n📊 Refresh Token Test Results Summary'));
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

    const totalDuration = this.testResults
      .filter(t => t.duration)
      .reduce((sum, t) => sum + t.duration, 0);
    console.log(chalk.blue(`⏱️  Total Duration: ${totalDuration}ms`));

    if (successRate === '100.0') {
      console.log(chalk.green('\n🎉 All refresh token tests passed! Token system is secure and working properly.'));
    } else {
      console.log(chalk.red('\n⚠️  Some refresh token tests failed. Please check the token management system.'));
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new RefreshTokenTester();
  tester.runAllTests().catch(error => {
    console.error(chalk.red('\n💥 Refresh token test suite crashed:'), error);
    process.exit(1);
  });
}

export default RefreshTokenTester;
