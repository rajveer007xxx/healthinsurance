# Multi-Tenant ISP Billing System

A comprehensive multi-tenant ISP (Internet Service Provider) billing and management system built with FastAPI backend and React TypeScript frontends.

## Features

### Backend (FastAPI)
- Multi-tenancy architecture with company_id isolation
- JWT authentication for 4 user types (SuperAdmin, Admin, Employee, Customer)
- RESTful API endpoints for all operations
- SQLite database with SQLAlchemy ORM
- Password hashing with bcrypt
- Automatic invoice generation
- GST invoice support
- Employee GPS tracking

### Frontend Portals

#### 1. SuperAdmin Portal
- Company management (CRUD operations)
- Admin user management per company
- Platform-wide statistics dashboard
- Company detail view with admin list

#### 2. Admin Portal (12 pages)
- Dashboard with statistics
- Customer management (add, edit, delete, view)
- GST Invoice Needed option in customer forms
- Employee management
- Plan management
- Payment recording and filtering
- Invoice creation with GST display
- Complaint registration and resolution
- Employee GPS tracking interface
- Settings (company, profile, notifications, security)

#### 3. Employee Portal (4 pages)
- Dashboard with assigned customers overview
- Assigned customers list
- Payment collection interface
- GPS location tracking and history

#### 4. Customer Portal (5 pages)
- Dashboard with account overview
- Profile management
- Invoice history and download
- Payment history
- Complaint submission and tracking

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT with python-jose
- **Password Hashing**: passlib with bcrypt
- **Validation**: Pydantic schemas

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Charts**: Recharts

## Project Structure

```
isp-billing-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── database.py          # Database configuration
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── company.py
│   │   │   ├── user.py
│   │   │   ├── customer.py
│   │   │   ├── plan.py
│   │   │   ├── invoice.py
│   │   │   ├── payment.py
│   │   │   ├── complaint.py
│   │   │   └── employee_location.py
│   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── company.py
│   │   │   ├── user.py
│   │   │   ├── customer.py
│   │   │   ├── plan.py
│   │   │   ├── invoice.py
│   │   │   ├── payment.py
│   │   │   ├── complaint.py
│   │   │   └── employee_location.py
│   │   └── routers/             # API routers
│   │       ├── auth.py
│   │       ├── superadmin.py
│   │       ├── admin.py
│   │       ├── employee.py
│   │       └── customer.py
│   ├── pyproject.toml           # Poetry dependencies
│   └── .env                     # Environment variables
├── superadmin-frontend/         # SuperAdmin React app
├── admin-frontend/              # Admin React app
├── employee-frontend/           # Employee React app
├── customer-frontend/           # Customer React app
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies using Poetry:
```bash
poetry install
```

3. Create a `.env` file:
```bash
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./isp_billing.db
```

4. Run the development server:
```bash
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Frontend Setup

Each frontend portal follows the same setup process:

1. Navigate to the frontend directory (e.g., `admin-frontend`):
```bash
cd admin-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
VITE_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

### Port Configuration

- Backend API: `http://localhost:8000`
- SuperAdmin Frontend: `http://localhost:5173`
- Admin Frontend: `http://localhost:5174`
- Employee Frontend: `http://localhost:5175`
- Customer Frontend: `http://localhost:5176`

## API Endpoints

### Authentication
- `POST /auth/superadmin/login` - SuperAdmin login
- `POST /auth/admin/login` - Admin login
- `POST /auth/employee/login` - Employee login
- `POST /auth/customer/login` - Customer login

### SuperAdmin
- `GET /superadmin/companies` - List all companies
- `POST /superadmin/companies` - Create company
- `GET /superadmin/companies/{id}` - Get company details
- `PUT /superadmin/companies/{id}` - Update company
- `DELETE /superadmin/companies/{id}` - Delete company
- `POST /superadmin/companies/{id}/admins` - Create admin for company
- `GET /superadmin/companies/{id}/admins` - List company admins

### Admin
- `GET /admin/customers` - List customers
- `POST /admin/customers` - Create customer
- `GET /admin/customers/{id}` - Get customer details
- `PUT /admin/customers/{id}` - Update customer
- `DELETE /admin/customers/{id}` - Delete customer
- `GET /admin/employees` - List employees
- `POST /admin/employees` - Create employee
- `GET /admin/plans` - List plans
- `POST /admin/plans` - Create plan
- `GET /admin/payments` - List payments
- `POST /admin/payments` - Record payment
- `GET /admin/invoices` - List invoices
- `POST /admin/invoices` - Create invoice
- `GET /admin/complaints` - List complaints
- `POST /admin/complaints/{id}/resolve` - Resolve complaint
- `GET /admin/employees/locations` - Get employee locations

### Employee
- `GET /employee/assigned-customers` - List assigned customers
- `POST /employee/collect-payment` - Record payment collection
- `POST /employee/update-location` - Update GPS location
- `GET /employee/location-history` - Get location history

### Customer
- `GET /customer/profile` - Get customer profile
- `PUT /customer/profile` - Update profile
- `GET /customer/invoices` - List invoices
- `GET /customer/payments` - List payments
- `GET /customer/complaints` - List complaints
- `POST /customer/complaints` - Submit complaint

## Key Features

### Multi-Tenancy
- All data is isolated by `company_id`
- Each company has its own admins, employees, customers, plans, etc.
- SuperAdmin can manage multiple companies

### GST Invoice Support
- Optional GST invoice generation per customer
- "GST Invoice Needed" dropdown in customer forms (Yes/No, default No)
- Company GST number displayed only when GST invoice is needed
- Invoice number format: 10-11 digits

### Employee GPS Tracking
- Real-time location updates from employees
- Location history tracking
- Admin can view all employee locations on map
- Employee can update location from mobile device

### Role-Based Access Control
- **SuperAdmin**: Manage companies and platform-wide operations
- **Admin**: Manage customers, employees, plans, payments, invoices, complaints
- **Employee**: View assigned customers, collect payments, update location
- **Customer**: View profile, invoices, payments, submit complaints

## Security

- JWT token-based authentication
- Password hashing with bcrypt
- Token expiration and refresh
- Protected API endpoints with role-based access
- CORS configuration for frontend access

## Development

### Running Tests
```bash
cd backend
poetry run pytest
```

### Code Quality
```bash
# Backend
cd backend
poetry run black .
poetry run flake8 .

# Frontend
cd admin-frontend
npm run lint
```

## Deployment

### Backend Deployment
1. Set up production environment variables
2. Use a production-grade database (PostgreSQL recommended)
3. Deploy using Docker or cloud platform (AWS, GCP, Azure)
4. Set up SSL/TLS certificates
5. Configure reverse proxy (Nginx)

### Frontend Deployment
1. Build production bundles: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, AWS S3)
3. Configure environment variables for production API URL
4. Set up CDN for optimal performance

## License

Proprietary - All rights reserved

## Support

For support and questions, please contact the development team.
