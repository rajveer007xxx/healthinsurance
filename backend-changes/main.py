from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.database import engine, Base
from pathlib import Path
from app.routers import (
    auth, customers, plans, invoices, payments, 
    complaints, dashboard, companies, localities,
    transactions, addon_bills, expenses, refunds,
    connection_requests, payment_gateways, reports,
    employees, notifications, tracking, superadmin, settings
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ISP Billing Management System",
    description="Complete ISP Billing Software for ispbilling.in",
    version="2.0.0",
    redirect_slashes=False
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "capacitor://localhost", "ionic://localhost", "http://localhost:5173", "http://localhost:8100", "http://82.29.162.153", "https://82.29.162.153", "null"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(customers.router, prefix="/customers", tags=["Customers"])
app.include_router(plans.router, prefix="/plans", tags=["Plans"])
app.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])
app.include_router(complaints.router, prefix="/complaints", tags=["Complaints"])
app.include_router(companies.router, prefix="/companies", tags=["Companies"])
app.include_router(localities.router, prefix="/localities", tags=["Localities"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
app.include_router(addon_bills.router, prefix="/addon-bills", tags=["Addon Bills"])
app.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
app.include_router(refunds.router, prefix="/refunds", tags=["Refunds"])
app.include_router(connection_requests.router, prefix="/connection-requests", tags=["Connection Requests"])
app.include_router(payment_gateways.router, prefix="/payment-gateways", tags=["Payment Gateways"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])
app.include_router(employees.router, prefix="/employees", tags=["Employees"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(tracking.router, prefix="/tracking", tags=["Tracking"])
app.include_router(superadmin.router, prefix="/api/superadmin", tags=["SuperAdmin"])
app.include_router(settings.router, prefix="/settings", tags=["Settings"])

@app.get("/")
def read_root():
    return {
        "message": "ISP Billing Management System API",
        "version": "2.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
