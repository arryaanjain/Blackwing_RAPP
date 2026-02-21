# RAPP Frontend - React TypeScript Application

Modern React frontend for the RAPP vendor-company connection platform.

## 🚀 Quick Start

### Installation
```bash
npm install
npm run dev
```

### Environment Configuration
```env
# .env.local
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Build for Production
```bash
npm run build
npm run preview
```

## 🏗️ Architecture

### Tech Stack
- **React 18**: UI framework with hooks
- **TypeScript**: Type safety and better DX
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client with interceptors

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── AuthCallback.tsx # OAuth callback handler
│   ├── ProtectedRoute.tsx # Route protection
│   └── profile/         # Profile management components
├── context/             # React Context providers
│   └── AuthContext.tsx  # Authentication state management
├── pages/              # Page components
│   ├── vendor/         # Vendor-specific pages
│   └── company/        # Company-specific pages
├── services/           # API service layer
│   ├── httpClient.ts   # Axios configuration
│   ├── authService.ts  # Authentication services
│   └── connectionService.ts # Connection management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔧 Key Features

### Authentication System
- **Google OAuth**: Seamless authentication flow
- **Profile Switching**: Dynamic switching between vendor/company profiles
- **Token Management**: Automatic token refresh and storage
- **Protected Routes**: Route-level authentication guards

### Profile Management
- **Dual Profiles**: Users can have both vendor and company profiles
- **Profile Creation**: Step-by-step profile setup wizards
- **Profile Switching**: Real-time profile switching with database sync
- **Profile Validation**: Form validation and completion tracking

### Connection Management
- **Request System**: Send/receive connection requests
- **Status Tracking**: Real-time connection status updates
- **Approval Workflow**: Company approval/denial of vendor requests
- **Connection Dashboard**: Manage active connections

### State Management
- **AuthContext**: Centralized authentication state
- **Profile State**: User profile and switching state
- **Connection State**: Connection request and status management
- **Local Storage**: Persistent state across sessions

## 🔧 Recent Fixes & Improvements

### Authentication System
✅ **Profile Switching**: Fixed race conditions in profile switching flow
✅ **Fresh User Data**: Implemented `fetchFreshUserData()` for real-time updates
✅ **State Synchronization**: Proper sync between frontend and backend state
✅ **Token Refresh**: Automatic token refresh with proper error handling

### TypeScript Improvements
✅ **Interface Fixes**: Resolved missing properties in AuthContext interface
✅ **Type Safety**: Added proper types for all API responses
✅ **Error Handling**: Enhanced error types and handling
✅ **Component Props**: Proper typing for all component props

### UI/UX Enhancements
✅ **Loading States**: Proper loading indicators during async operations
✅ **Error Display**: User-friendly error messages and feedback
✅ **Profile Selection**: Improved profile selection and switching UI
✅ **Responsive Design**: Mobile-friendly responsive layouts

## 🛠️ API Integration

### HTTP Client Configuration
```typescript
// httpClient.ts
const httpClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Automatic token attachment
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic token refresh
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
    }
    return Promise.reject(error);
  }
);
```

### Service Layer
```typescript
// authService.ts
class AuthService {
  async switchProfile(profileType: 'company' | 'vendor') {
    return httpClient.post('/api/profiles/switch', {
      profile_type: profileType
    });
  }

  async getCurrentUser() {
    return httpClient.get('/api/auth/me');
  }
}

// connectionService.ts
class ConnectionService {
  async sendConnectionRequest(shareId: string, message?: string) {
    return httpClient.post('/api/connections/request', {
      company_share_id: shareId,
      message
    });
  }

  async getConnections() {
    return httpClient.get('/api/connections');
  }
}
```

## 🧪 Development

### Available Scripts
```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Building
npm run build

# Preview production build
npm run preview
```

### Environment Variables
```bash
# Development
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_ENVIRONMENT=development

# Production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
VITE_ENVIRONMENT=production
```

## 🚨 Common Issues & Solutions

### Authentication Issues
**Issue**: Profile switching not working
**Solution**: Ensure `fetchFreshUserData()` is called after `authService.switchProfile()`

**Issue**: Token refresh failing
**Solution**: Check refresh token validity and localStorage state

### State Management Issues
**Issue**: User state not updating after profile switch
**Solution**: Use `fetchFreshUserData()` instead of `checkAuth()` for fresh server data

**Issue**: Race conditions in profile switching
**Solution**: Implement proper waiting mechanism for state updates

### TypeScript Issues
**Issue**: Missing properties in interfaces
**Solution**: Update AuthContext interface to include all required properties

**Issue**: Type mismatches in API responses
**Solution**: Define proper response interfaces and use generic types

## 🔒 Security Considerations

### Token Management
- Secure token storage in localStorage
- Automatic token refresh before expiration
- Proper token cleanup on logout

### Route Protection
- Protected routes with authentication guards
- Profile-based access control
- Redirect handling for unauthorized access

### Data Validation
- Client-side form validation
- API response validation
- Input sanitization

## 📦 Dependencies

### Core Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "axios": "^1.7.7",
  "typescript": "~5.6.2"
}
```

### Development Dependencies
```json
{
  "@vitejs/plugin-react": "^4.3.2",
  "vite": "^5.4.8",
  "eslint": "^9.11.1",
  "@types/react": "^18.3.10"
}
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] API endpoints pointing to production
- [ ] Google OAuth configured for production domain
- [ ] CORS settings updated on backend
- [ ] Static assets optimized

---

Built with React 18 and TypeScript for the RAPP platform ⚡

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
