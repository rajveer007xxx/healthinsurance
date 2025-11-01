# SuperAdmin Frontend - ISP Management System

## Overview

This is the SuperAdmin frontend for the ISP Management System. It provides a web interface for super administrators to manage admin users, view system statistics, and perform administrative tasks.

## Problem Solved

**Issue**: The superadmin panel was showing "No admins found" even though many admin users existed in the main ISP management system database.

**Root Cause**: The superadmin frontend was connected to a separate FastAPI backend (port 8003) with in-memory storage, while the existing admin data was stored in the SQLite database connected to the main backend (port 8000).

**Solution**: Updated the superadmin frontend to connect directly to the main backend's superadmin API endpoints at port 8000, allowing it to access all existing admin users from the main database.

## Key Changes Made

### 1. Frontend API Integration Updates
- Updated Admin interface to match main backend response structure
- Changed field mappings: `admin_name` → `full_name`, `mobile` → `phone`, `status` → `is_active`
- Updated login handler to use `data.access_token` instead of `data.token`
- Modified fetchAdmins to handle `{total, admins: [...]}` response structure
- Updated all CRUD operations to use main backend endpoints

### 2. Form and UI Updates
- Updated Add Admin form fields to match main backend API requirements
- Modified Edit Admin dialog to use correct field names
- Updated admin table columns to display data from main backend
- Removed unused features (state selector, expired status filter)
- Updated toggle status functionality to use single endpoint

### 3. Infrastructure Changes
- Updated nginx configuration to proxy `/api/superadmin/` to port 8000 (main backend)
- Rebuilt and deployed updated frontend to VPS
- Created superadmin user creation script

## Features

### Dashboard
- Total admins count
- Active/inactive admin statistics
- Recent admin registrations
- Customer and revenue metrics
- Invoice statistics

### Admin Management
- View all admin users with pagination and search
- Add new admin users with complete profile information
- Edit existing admin details
- Toggle admin active/inactive status
- Filter admins by status (all, active, deactivated)

### Authentication
- Secure login with JWT tokens
- Session timeout handling
- Role-based access control

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Fetch API
- **Authentication**: JWT tokens
- **Build Tool**: Vite
- **Icons**: Lucide React

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Access to the main ISP backend at port 8000

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Configuration
Create a `.env` file in the root directory:
```
VITE_API_URL=http://82.29.162.153
```

## Deployment

### Production Deployment on VPS
1. Build the application:
   ```bash
   npm run build
   ```

2. Copy dist folder to VPS:
   ```bash
   scp -r dist/ root@82.29.162.153:/var/www/superadmin-frontend/
   ```

3. Ensure nginx is configured to serve the frontend and proxy API calls:
   ```nginx
   location /superadmin/ {
       try_files $uri $uri/ /superadmin/index.html;
   }
   
   location /api/superadmin/ {
       proxy_pass http://127.0.0.1:8000/api/superadmin/;
       # ... other proxy settings
   }
   ```

## Creating a SuperAdmin User

Use the provided script to create a superadmin user:

```bash
# On the VPS, run:
cd /var/www/isp-manager-v2/backend
python3 create_superadmin.py

# Or with custom credentials:
python3 create_superadmin.py --username mysuper --password MyPass123
```

Default credentials:
- Username: `rajveersuper`
- Password: `Pa$$word@123#`

## API Endpoints Used

The frontend connects to these main backend endpoints:

### Authentication
- `POST /api/superadmin/login` - SuperAdmin login
- `GET /api/superadmin/me` - Get current user info

### Dashboard
- `GET /api/superadmin/dashboard/stats` - Get dashboard statistics

### Admin Management
- `GET /api/superadmin/admins` - List all admins with pagination
- `POST /api/superadmin/admins` - Create new admin
- `PUT /api/superadmin/admins/{admin_id}` - Update admin
- `POST /api/superadmin/admins/{admin_id}/toggle-status` - Toggle admin status
- `DELETE /api/superadmin/admins/{admin_id}` - Delete admin

## File Structure

```
superadmin-frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── App.tsx              # Main application component
│   ├── App.css              # Global styles
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite type definitions
├── components.json          # shadcn/ui configuration
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── tsconfig.node.json      # TypeScript Node configuration
├── vite.config.ts          # Vite configuration
├── create_superadmin.py    # SuperAdmin user creation script
└── README.md               # This file
```

## Troubleshooting

### Common Issues

1. **"No admins found" error**
   - Ensure nginx is routing `/api/superadmin/` to port 8000
   - Check that the main backend is running on port 8000
   - Verify database contains admin users

2. **Login fails**
   - Ensure superadmin user exists in database
   - Check that user has role "SUPERADMIN"
   - Verify password is correct

3. **API calls fail**
   - Check nginx configuration
   - Ensure main backend is running
   - Verify CORS settings in backend

### Checking Admin Users in Database
```bash
# On VPS, check existing admins:
cd /var/www/isp-manager/isp-backend
python3 -c "
import sqlite3
conn = sqlite3.connect('ispbilling.db')
cursor = conn.cursor()
cursor.execute('SELECT id, username, email, role, is_active FROM users WHERE role IN (\"ADMIN\", \"SUPERADMIN\")')
print(cursor.fetchall())
conn.close()
"
```

## Access URLs

- **SuperAdmin Panel**: http://82.29.162.153/superadmin/
- **Main ISP System**: http://82.29.162.153/
- **API Base**: http://82.29.162.153/api/superadmin/

## Security Notes

- All API calls require JWT authentication
- Passwords are hashed using bcrypt
- Session timeouts are enforced
- Role-based access control prevents unauthorized access

## Support

For issues or questions, refer to the main ISP Management System documentation or contact the system administrator.
