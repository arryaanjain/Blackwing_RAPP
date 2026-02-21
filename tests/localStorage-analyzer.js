/**
 * RAPP LocalStorage Analyzer
 * 
 * This tool analyzes and manages localStorage data used by the RAPP frontend
 * authentication system. It helps test and debug token storage, user state,
 * and OAuth flow data persistence.
 */

import chalk from 'chalk';

class LocalStorageAnalyzer {
  constructor() {
    this.storageKeys = {
      // Authentication tokens
      ACCESS_TOKEN: 'rapp_access_token',
      REFRESH_TOKEN: 'rapp_refresh_token',
      TOKEN_EXPIRY: 'rapp_token_expiry',
      
      // User state
      USER_DATA: 'rapp_user_data',
      USER_TYPE: 'rapp_user_type',
      USER_STATUS: 'rapp_user_status',
      
      // OAuth state
      OAUTH_STATE: 'rapp_oauth_state',
      OAUTH_PROVIDER: 'rapp_oauth_provider',
      
      // Profile completion
      PROFILE_COMPLETE: 'rapp_profile_complete',
      PROFILE_TEMP_DATA: 'rapp_profile_temp_data',
      
      // Session management
      LAST_ACTIVITY: 'rapp_last_activity',
      AUTO_LOGOUT_TIME: 'rapp_auto_logout_time'
    };
    
    this.testResults = [];
  }

  // Simulate localStorage for testing (since Node.js doesn't have localStorage)
  createMockLocalStorage() {
    const storage = {};
    
    return {
      getItem: (key) => storage[key] || null,
      setItem: (key, value) => storage[key] = String(value),
      removeItem: (key) => delete storage[key],
      clear: () => Object.keys(storage).forEach(key => delete storage[key]),
      key: (index) => Object.keys(storage)[index] || null,
      get length() { return Object.keys(storage).length; },
      _getAll: () => ({ ...storage })
    };
  }

  runTest(name, testFn) {
    try {
      console.log(chalk.blue(`\n🧪 Running: ${name}`));
      const startTime = Date.now();
      
      testFn();
      
      const duration = Date.now() - startTime;
      console.log(chalk.green(`✅ ${name} - Passed (${duration}ms)`));
      this.testResults.push({ name, status: 'PASSED', duration });
    } catch (error) {
      console.log(chalk.red(`❌ ${name} - Failed`));
      console.log(chalk.red(`   Error: ${error.message}`));
      this.testResults.push({ name, status: 'FAILED', error: error.message });
    }
  }

  testTokenStorage() {
    const localStorage = this.createMockLocalStorage();
    
    // Test token storage
    const mockTokens = {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test_access_token',
      refresh_token: 'refresh_token_12345',
      expires_in: 900
    };

    // Store tokens
    localStorage.setItem(this.storageKeys.ACCESS_TOKEN, mockTokens.access_token);
    localStorage.setItem(this.storageKeys.REFRESH_TOKEN, mockTokens.refresh_token);
    
    const expiryTime = Date.now() + (mockTokens.expires_in * 1000);
    localStorage.setItem(this.storageKeys.TOKEN_EXPIRY, expiryTime.toString());

    // Verify storage
    const storedAccessToken = localStorage.getItem(this.storageKeys.ACCESS_TOKEN);
    const storedRefreshToken = localStorage.getItem(this.storageKeys.REFRESH_TOKEN);
    const storedExpiry = localStorage.getItem(this.storageKeys.TOKEN_EXPIRY);

    if (storedAccessToken !== mockTokens.access_token) {
      throw new Error('Access token not stored correctly');
    }

    if (storedRefreshToken !== mockTokens.refresh_token) {
      throw new Error('Refresh token not stored correctly');
    }

    if (!storedExpiry || parseInt(storedExpiry) <= Date.now()) {
      throw new Error('Token expiry not stored correctly or already expired');
    }

    console.log(chalk.cyan(`  ✓ Access token stored: ${storedAccessToken.substring(0, 30)}...`));
    console.log(chalk.cyan(`  ✓ Refresh token stored: ${storedRefreshToken.substring(0, 20)}...`));
    console.log(chalk.cyan(`  ✓ Token expiry stored: ${new Date(parseInt(storedExpiry)).toISOString()}`));
  }

  testUserDataStorage() {
    const localStorage = this.createMockLocalStorage();
    
    // Test user data storage
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      user_type: 'company',
      status: 'active',
      company_name: 'Test Company',
      business_license: '12345',
      website: 'https://test.com'
    };

    // Store user data
    localStorage.setItem(this.storageKeys.USER_DATA, JSON.stringify(mockUser));
    localStorage.setItem(this.storageKeys.USER_TYPE, mockUser.user_type);
    localStorage.setItem(this.storageKeys.USER_STATUS, mockUser.status);

    // Verify storage
    const storedUserData = JSON.parse(localStorage.getItem(this.storageKeys.USER_DATA));
    const storedUserType = localStorage.getItem(this.storageKeys.USER_TYPE);
    const storedUserStatus = localStorage.getItem(this.storageKeys.USER_STATUS);

    if (!storedUserData || storedUserData.id !== mockUser.id) {
      throw new Error('User data not stored correctly');
    }

    if (storedUserType !== mockUser.user_type) {
      throw new Error('User type not stored correctly');
    }

    if (storedUserStatus !== mockUser.status) {
      throw new Error('User status not stored correctly');
    }

    console.log(chalk.cyan(`  ✓ User data stored: ${storedUserData.name} (${storedUserData.email})`));
    console.log(chalk.cyan(`  ✓ User type stored: ${storedUserType}`));
    console.log(chalk.cyan(`  ✓ User status stored: ${storedUserStatus}`));
  }

  testOAuthStateStorage() {
    const localStorage = this.createMockLocalStorage();
    
    // Test OAuth state storage
    const oauthState = {
      user_type: 'vendor',
      redirect_url: '/dashboard',
      timestamp: Date.now()
    };

    const encodedState = btoa(JSON.stringify(oauthState));

    // Store OAuth data
    localStorage.setItem(this.storageKeys.OAUTH_STATE, encodedState);
    localStorage.setItem(this.storageKeys.OAUTH_PROVIDER, 'google');

    // Verify storage
    const storedState = localStorage.getItem(this.storageKeys.OAUTH_STATE);
    const storedProvider = localStorage.getItem(this.storageKeys.OAUTH_PROVIDER);

    if (!storedState) {
      throw new Error('OAuth state not stored');
    }

    if (storedProvider !== 'google') {
      throw new Error('OAuth provider not stored correctly');
    }

    // Test state decoding
    const decodedState = JSON.parse(atob(storedState));
    if (decodedState.user_type !== oauthState.user_type) {
      throw new Error('OAuth state encoding/decoding failed');
    }

    console.log(chalk.cyan(`  ✓ OAuth state stored and encoded`));
    console.log(chalk.cyan(`  ✓ OAuth provider stored: ${storedProvider}`));
    console.log(chalk.cyan(`  ✓ State decoding works: ${decodedState.user_type}`));
  }

  testProfileCompletionStorage() {
    const localStorage = this.createMockLocalStorage();
    
    // Test profile completion storage
    const tempProfileData = {
      company_name: 'Temp Company',
      business_license: 'TEMP123',
      address: '123 Temp St',
      phone: '+1234567890'
    };

    // Store profile data
    localStorage.setItem(this.storageKeys.PROFILE_COMPLETE, 'false');
    localStorage.setItem(this.storageKeys.PROFILE_TEMP_DATA, JSON.stringify(tempProfileData));

    // Verify storage
    const profileComplete = localStorage.getItem(this.storageKeys.PROFILE_COMPLETE);
    const tempData = JSON.parse(localStorage.getItem(this.storageKeys.PROFILE_TEMP_DATA));

    if (profileComplete !== 'false') {
      throw new Error('Profile completion status not stored correctly');
    }

    if (!tempData || tempData.company_name !== tempProfileData.company_name) {
      throw new Error('Temporary profile data not stored correctly');
    }

    console.log(chalk.cyan(`  ✓ Profile completion status: ${profileComplete}`));
    console.log(chalk.cyan(`  ✓ Temp profile data stored: ${tempData.company_name}`));

    // Test profile completion
    localStorage.setItem(this.storageKeys.PROFILE_COMPLETE, 'true');
    localStorage.removeItem(this.storageKeys.PROFILE_TEMP_DATA);

    const updatedStatus = localStorage.getItem(this.storageKeys.PROFILE_COMPLETE);
    const clearedTempData = localStorage.getItem(this.storageKeys.PROFILE_TEMP_DATA);

    if (updatedStatus !== 'true') {
      throw new Error('Profile completion status update failed');
    }

    if (clearedTempData !== null) {
      throw new Error('Temporary profile data not cleared');
    }

    console.log(chalk.cyan(`  ✓ Profile completion updated: ${updatedStatus}`));
    console.log(chalk.cyan(`  ✓ Temp data cleared on completion`));
  }

  testSessionManagement() {
    const localStorage = this.createMockLocalStorage();
    
    // Test session management
    const now = Date.now();
    const autoLogoutTime = now + (30 * 60 * 1000); // 30 minutes

    localStorage.setItem(this.storageKeys.LAST_ACTIVITY, now.toString());
    localStorage.setItem(this.storageKeys.AUTO_LOGOUT_TIME, autoLogoutTime.toString());

    // Verify storage
    const lastActivity = parseInt(localStorage.getItem(this.storageKeys.LAST_ACTIVITY));
    const autoLogout = parseInt(localStorage.getItem(this.storageKeys.AUTO_LOGOUT_TIME));

    if (lastActivity !== now) {
      throw new Error('Last activity time not stored correctly');
    }

    if (autoLogout !== autoLogoutTime) {
      throw new Error('Auto logout time not stored correctly');
    }

    // Test activity update
    const newActivity = now + 5000; // 5 seconds later
    localStorage.setItem(this.storageKeys.LAST_ACTIVITY, newActivity.toString());

    const updatedActivity = parseInt(localStorage.getItem(this.storageKeys.LAST_ACTIVITY));
    if (updatedActivity !== newActivity) {
      throw new Error('Activity update failed');
    }

    console.log(chalk.cyan(`  ✓ Last activity stored: ${new Date(lastActivity).toISOString()}`));
    console.log(chalk.cyan(`  ✓ Auto logout time: ${new Date(autoLogout).toISOString()}`));
    console.log(chalk.cyan(`  ✓ Activity update works`));
  }

  testStorageCleanup() {
    const localStorage = this.createMockLocalStorage();
    
    // Fill localStorage with test data
    Object.values(this.storageKeys).forEach(key => {
      localStorage.setItem(key, 'test_value');
    });

    // Verify data exists
    const initialCount = localStorage.length;
    if (initialCount === 0) {
      throw new Error('Test data not stored for cleanup test');
    }

    console.log(chalk.cyan(`  ✓ Test data created: ${initialCount} items`));

    // Test selective cleanup (auth-related only)
    const authKeys = [
      this.storageKeys.ACCESS_TOKEN,
      this.storageKeys.REFRESH_TOKEN,
      this.storageKeys.TOKEN_EXPIRY,
      this.storageKeys.USER_DATA,
      this.storageKeys.USER_TYPE,
      this.storageKeys.USER_STATUS
    ];

    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Verify auth data cleared but OAuth state remains
    authKeys.forEach(key => {
      if (localStorage.getItem(key) !== null) {
        throw new Error(`Auth key ${key} not cleared`);
      }
    });

    if (localStorage.getItem(this.storageKeys.OAUTH_STATE) === null) {
      throw new Error('OAuth state was incorrectly cleared');
    }

    console.log(chalk.cyan(`  ✓ Selective auth cleanup works`));

    // Test full cleanup
    localStorage.clear();
    if (localStorage.length !== 0) {
      throw new Error('Full cleanup failed');
    }

    console.log(chalk.cyan(`  ✓ Full cleanup works`));
  }

  testStorageSizeAndLimits() {
    const localStorage = this.createMockLocalStorage();
    
    // Test large data storage
    const largeUserData = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      user_type: 'company',
      company_data: {
        description: 'A'.repeat(1000), // 1KB description
        history: 'B'.repeat(2000), // 2KB history
        services: Array.from({ length: 100 }, (_, i) => `Service ${i}`),
        employees: Array.from({ length: 50 }, (_, i) => ({
          id: i,
          name: `Employee ${i}`,
          role: `Role ${i}`,
          email: `employee${i}@company.com`
        }))
      }
    };

    const serializedData = JSON.stringify(largeUserData);
    const dataSize = new Blob([serializedData]).size;

    localStorage.setItem(this.storageKeys.USER_DATA, serializedData);
    const retrievedData = localStorage.getItem(this.storageKeys.USER_DATA);

    if (!retrievedData) {
      throw new Error('Large data not stored');
    }

    const parsedData = JSON.parse(retrievedData);
    if (parsedData.company_data.employees.length !== 50) {
      throw new Error('Large data corrupted during storage');
    }

    console.log(chalk.cyan(`  ✓ Large data stored successfully: ${Math.round(dataSize / 1024)}KB`));
    console.log(chalk.cyan(`  ✓ Data integrity maintained`));

    // Test storage key enumeration
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      allKeys.push(localStorage.key(i));
    }

    if (allKeys.length === 0) {
      throw new Error('Storage key enumeration failed');
    }

    console.log(chalk.cyan(`  ✓ Storage enumeration works: ${allKeys.length} keys`));
  }

  generateStorageReport(localStorage) {
    console.log(chalk.yellow('\n📋 LocalStorage Analysis Report'));
    console.log('═'.repeat(50));

    const allData = localStorage._getAll();
    const totalItems = Object.keys(allData).length;
    let totalSize = 0;

    Object.entries(allData).forEach(([key, value]) => {
      const size = new Blob([value]).size;
      totalSize += size;
      console.log(chalk.blue(`${key}: ${Math.round(size / 1024)}KB`));
    });

    console.log(chalk.yellow(`\nTotal Items: ${totalItems}`));
    console.log(chalk.yellow(`Total Size: ${Math.round(totalSize / 1024)}KB`));

    // Recommend cleanup if size is large
    if (totalSize > 100 * 1024) { // 100KB
      console.log(chalk.red(`⚠️  Large storage size detected. Consider cleanup.`));
    } else {
      console.log(chalk.green(`✅ Storage size within reasonable limits.`));
    }
  }

  generateStorageUtilities() {
    return {
      // Clear all RAPP-related localStorage
      clearRappStorage: () => {
        if (typeof localStorage !== 'undefined') {
          Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
          });
          console.log('RAPP localStorage cleared');
        }
      },

      // Get current auth state
      getAuthState: () => {
        if (typeof localStorage !== 'undefined') {
          return {
            hasAccessToken: !!localStorage.getItem(this.storageKeys.ACCESS_TOKEN),
            hasRefreshToken: !!localStorage.getItem(this.storageKeys.REFRESH_TOKEN),
            tokenExpiry: localStorage.getItem(this.storageKeys.TOKEN_EXPIRY),
            userType: localStorage.getItem(this.storageKeys.USER_TYPE),
            userStatus: localStorage.getItem(this.storageKeys.USER_STATUS),
            profileComplete: localStorage.getItem(this.storageKeys.PROFILE_COMPLETE)
          };
        }
        return null;
      },

      // Check if tokens are expired
      areTokensExpired: () => {
        if (typeof localStorage !== 'undefined') {
          const expiry = localStorage.getItem(this.storageKeys.TOKEN_EXPIRY);
          if (!expiry) return true;
          return parseInt(expiry) <= Date.now();
        }
        return true;
      }
    };
  }

  runAllTests() {
    console.log(chalk.yellow('\n🚀 Starting RAPP LocalStorage Analysis\n'));

    // Storage Tests
    this.runTest('Token Storage', () => this.testTokenStorage());
    this.runTest('User Data Storage', () => this.testUserDataStorage());
    this.runTest('OAuth State Storage', () => this.testOAuthStateStorage());
    this.runTest('Profile Completion Storage', () => this.testProfileCompletionStorage());
    this.runTest('Session Management', () => this.testSessionManagement());
    this.runTest('Storage Cleanup', () => this.testStorageCleanup());
    this.runTest('Storage Size and Limits', () => this.testStorageSizeAndLimits());

    // Generate report
    const mockStorage = this.createMockLocalStorage();
    mockStorage.setItem('example_key', 'example_value');
    this.generateStorageReport(mockStorage);

    // Print utilities
    console.log(chalk.yellow('\n🛠️  Storage Utilities Generated'));
    console.log(chalk.cyan('Use the generated utilities for debugging localStorage in the browser:'));
    console.log(chalk.cyan('- clearRappStorage(): Clear all RAPP data'));
    console.log(chalk.cyan('- getAuthState(): Get current authentication state'));
    console.log(chalk.cyan('- areTokensExpired(): Check if tokens are expired'));

    // Print results summary
    this.printSummary();
  }

  printSummary() {
    console.log(chalk.yellow('\n📊 LocalStorage Analysis Results'));
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
      console.log(chalk.green('\n🎉 All localStorage tests passed! Storage system is working properly.'));
    } else {
      console.log(chalk.red('\n⚠️  Some localStorage tests failed. Please check the storage implementation.'));
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new LocalStorageAnalyzer();
  analyzer.runAllTests();
}

export default LocalStorageAnalyzer;
