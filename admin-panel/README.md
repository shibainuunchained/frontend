# Shibau Wallet Admin Panel

A modern, responsive admin panel for managing the Shibau multi-chain wallet system. Built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### 📊 Dashboard
- Real-time overview of user statistics
- Active wallet counts across all supported chains (ETH, BTC, BNB, MATIC, TRX)
- Platform fee earnings and $SHIBAU token usage metrics
- Interactive charts for balance distribution and transaction activity
- System status monitoring

### 👥 User Management
- Comprehensive user listing with search functionality
- Individual user profile views with detailed wallet information
- Multi-chain wallet address display with copy-to-clipboard functionality
- Security status indicators (2FA enabled/disabled)
- Device fingerprint tracking

### 🔐 Security Features
- JWT-based authentication system
- Automatic logout after 15 minutes of inactivity
- Protected routes with authentication middleware
- Secure token handling and storage

### 📱 Device Management
- Device change request approval system
- Side-by-side comparison of old vs new device information
- IP address and fingerprint tracking
- One-click approve/reject functionality

### 💸 Transaction Monitoring
- Complete transaction history across all chains
- Advanced filtering by chain, type, and date range
- Pagination for large datasets
- Direct links to blockchain explorers
- Real-time status updates

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite

## 🎨 Design System

### Color Palette
- **Primary Gold**: `#d4af37` - Main branding color
- **Accent Orange**: `#ff9100` - Secondary highlights
- **Dark Background**: `#0a0a0a` - Main background
- **Dark Cards**: `#1F2937` - Component backgrounds
- **Chain Colors**: 
  - ETH: `#627EEA`
  - BTC: `#F7931A`
  - BNB: `#F3BA2F`
  - MATIC: `#8247E5`
  - TRX: `#FF060A`

### Typography
- **Font Family**: Inter (fallback to system fonts)
- **Responsive**: Mobile-first approach
- **Consistent Spacing**: Tailwind's spacing scale

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your backend API URL:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📋 API Integration

The admin panel integrates with the following backend endpoints:

### Authentication
- `POST /admin/login` - Admin login

### Dashboard
- `GET /admin/dashboard` - Dashboard statistics

### User Management
- `GET /admin/users` - List all users
- `GET /admin/user/:id` - Get specific user details
- `GET /admin/balances/:userId` - Get user wallet balances

### Device Management
- `GET /admin/device-requests` - Get pending device requests
- `PATCH /admin/approve-device` - Approve device change
- `PATCH /admin/reject-device` - Reject device change

### Transactions
- `GET /admin/transactions` - Get transaction history with filters

## 🔐 Authentication Flow

1. Admin enters credentials on `/login` page
2. Backend validates and returns JWT token
3. Token stored securely in localStorage
4. Axios interceptor adds token to all requests
5. Auto-logout on token expiry or inactivity
6. Protected routes redirect to login if unauthenticated

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── TopBar.tsx      # Top navigation bar
│   └── ProtectedRoute.tsx
├── pages/              # Page components
│   ├── Login.tsx       # Authentication page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Users.tsx       # User management
│   ├── UserDetails.tsx # Individual user view
│   ├── DeviceRequests.tsx
│   └── Transactions.tsx
├── services/           # API and auth services
│   ├── authService.ts  # Authentication logic
│   └── apiService.ts   # API calls
├── types/              # TypeScript interfaces
│   └── index.ts
├── utils/              # Helper functions
│   └── index.ts
└── App.tsx             # Main app component
```

## 🔧 Configuration

### Tailwind CSS
Custom configuration in `tailwind.config.js` includes:
- Dark theme color palette
- Custom component classes
- Responsive breakpoints

### Vite
Configuration optimized for:
- Fast development builds
- TypeScript support
- React Fast Refresh

## 🚀 Deployment

### Netlify (Recommended)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard

### Other Platforms
The built files in `dist/` can be deployed to any static hosting service:
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- DigitalOcean App Platform

## 🛡️ Security Best Practices

1. **Token Security**: JWTs stored in localStorage with automatic cleanup
2. **Route Protection**: All admin routes require valid authentication
3. **API Security**: All requests include authorization headers
4. **Input Validation**: Client-side validation for all forms
5. **HTTPS**: Always use HTTPS in production
6. **Environment Variables**: Sensitive data in environment variables

## 📱 Mobile Responsiveness

- **Responsive Design**: Works on all device sizes
- **Touch Friendly**: Optimized for mobile interactions
- **Progressive Enhancement**: Core functionality works without JavaScript

## 🔍 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if backend server is running
   - Verify `VITE_API_BASE_URL` in `.env`
   - Check CORS configuration on backend

2. **Authentication Issues**
   - Clear localStorage and try again
   - Check JWT token expiry
   - Verify admin credentials

3. **Build Errors**
   - Run `npm install` to ensure all dependencies
   - Check TypeScript errors: `npm run lint`

## 📝 License

This project is part of the Shibau Wallet system. All rights reserved.

## 🤝 Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test on multiple screen sizes
4. Update documentation as needed

## 🆘 Support

For technical support or questions about the admin panel, please contact the development team.
