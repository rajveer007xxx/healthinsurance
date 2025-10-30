# ISP Management System - Frontend v2

Complete React/TypeScript frontend for ISP Management System with proper source code backup.

## 🎯 Features Implemented

### ✅ Completed Tasks
- **Transaction History with Sl. No. Column**: Added serial number column to payment history page
- **Addon Bill Menu Removed**: Removed "Addon Bills" menu item from admin sidebar
- **Complete Source Code Recovery**: Recreated all frontend source files from corrupted backup
- **Git Version Control**: Full Git backup to prevent future data loss

### 📋 Pages Included
- **Admin Dashboard**: Overview and statistics
- **Customer Management**: Add, edit, view customers
- **Plans Management**: Manage service plans
- **Transaction History**: Payment history with serial numbers
- **Payments**: Payment records with receipt download
- **Send Manual Invoices**: Create and send custom invoices
- **Complaints Management**: Handle customer complaints
- **Settings & Profile**: Admin profile and system settings
- **And many more...**

## 🛠️ Tech Stack

- **React 18.2** - UI framework
- **TypeScript 5.2** - Type safety
- **Vite 5.0** - Build tool
- **React Router 6.20** - Client-side routing
- **Axios 1.6** - HTTP client
- **Tailwind CSS 3.3** - Styling
- **Lucide React** - Icon library

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Backend API running on port 8001/8002

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajveer007xxx/healthinsurance.git
   cd healthinsurance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoints**
   - Development: Automatically uses `http://localhost:8001`
   - Production: Uses `/api` (configured in Nginx)
   - Edit `src/utils/api.ts` if needed

4. **Run development server**
   ```bash
   npm run dev
   ```
   Access at: http://localhost:5173

5. **Build for production**
   ```bash
   npm run build
   ```
   Output: `dist/` folder

## 🚀 Deployment

### Deploy to VPS (Current Setup)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Copy to VPS**
   ```bash
   scp -r dist/* root@82.29.162.153:/var/www/isp-manager-v2/frontend/
   ```

3. **Restart Nginx** (if needed)
   ```bash
   ssh root@82.29.162.153 "systemctl restart nginx"
   ```

### Current Production URL
- Frontend: http://82.29.162.153
- Admin Panel: http://82.29.162.153/admin/login
- Backend API: http://82.29.162.153:8001

## 📁 Project Structure

```
isp-frontend-v2/
├── src/
│   ├── components/          # Reusable components
│   │   ├── AdminLayout.tsx  # Admin sidebar layout (Addon Bill removed)
│   │   └── SuperadminLayout.tsx
│   ├── pages/              # Page components
│   │   ├── TransactionHistory.tsx  # With Sl. No. column
│   │   ├── Payments.tsx            # Payment records
│   │   ├── SendInvoices.tsx        # Manual invoices
│   │   ├── AdminDashboard.tsx
│   │   ├── Customers.tsx
│   │   └── ... (20+ pages)
│   ├── utils/              # Utility functions
│   │   ├── api.ts          # Main API client
│   │   ├── api2.ts         # Alternative API client
│   │   └── dateFormate.ts
│   ├── hooks/              # Custom React hooks
│   │   └── useSessionTimeout.ts
│   ├── App.tsx             # Main app component
│   ├── App.css             # Global styles
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
├── tailwind.config.js      # Tailwind config
└── README.md               # This file
```

## 🔑 Key Features

### Authentication
- JWT token-based authentication
- Role-based access control (Superadmin, Admin, Customer)
- Automatic token refresh
- Session timeout warnings

### API Integration
- Axios interceptors for automatic token injection
- Separate token handling for different user roles
- Error handling and retry logic

### UI/UX
- Responsive design with Tailwind CSS
- Minimizable sidebar navigation
- Profile dropdown menu
- Loading states and error messages
- Toast notifications

## 🔧 Configuration Files

### API Configuration (`src/utils/api.ts`)
- Handles authentication tokens
- Configures base URL based on environment
- Implements request/response interceptors

### Routing (`src/App.tsx`)
- Defines all application routes
- Protected routes for admin/customer areas
- Public routes for login pages

## 📝 Important Notes

### Corrupted Files Recovered
The following files were corrupted in the backup and have been recreated based on backend API structure:
- `TransactionHistory.tsx` - Now includes Sl. No. column
- `Payments.tsx` - Payment records with receipt download
- `SendInvoices.tsx` - Manual invoice creation with PDF generation

### Changes Made
1. ✅ Added Sl. No. (serial number) column to Transaction History page
2. ✅ Removed "Addon Bills" menu item from AdminLayout sidebar
3. ✅ Recreated corrupted files from backend API structure
4. ✅ Set up complete Git version control

### Two API Files
- `api.ts` - Main API client (recommended)
- `api2.ts` - Alternative API client (hardcoded localhost:8000)

Use `api.ts` for production as it automatically switches between development and production URLs.

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Connection Issues
- Check backend is running on port 8001
- Verify CORS settings in backend
- Check browser console for errors

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check token expiry
- Verify backend authentication endpoints

## 📞 Support

For issues or questions:
- Email: rajveersingh007bond@gmail.com
- GitHub: @rajveer007xxx

## 🔐 Security

- Never commit `.env` files
- Keep API tokens secure
- Use HTTPS in production
- Regular security updates

## 📜 License

Private project - All rights reserved

---

**Note**: This project was recovered and backed up with assistance from Devin AI after a previous session crash resulted in source code loss. All source code is now safely backed up in Git to prevent future data loss.

**Devin Run**: https://app.devin.ai/sessions/33a699d0970848a9994672e6a7a77ee9
**Created by**: Rajveer Singh (@rajveer007xxx)
