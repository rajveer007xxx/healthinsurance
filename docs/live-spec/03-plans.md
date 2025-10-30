# Plans Management Page Specification

## URL
/admin/plans

## Page Title
"Plans Management"

## Top Actions
- "Add Plan" button (teal, top right)

## Table Columns (9 columns)
1. Plan Name - Name of the plan
2. Service Type - BROADBAND/CABLE_TV
3. Speed - Internet speed (e.g., "50 Mbps")
4. Data Limit - Data limit (e.g., "Unlimited")
5. Price - Base price (₹)
6. Total Amount - Total amount with taxes (₹)
7. Validity - Plan validity period (e.g., "1 month")
8. Status - Active/Inactive
9. Actions - 2 action buttons per row

## Action Buttons (2 per plan row)
1. Edit Plan (edit icon)
2. Delete Plan (trash icon)

## API Endpoints
- GET /plans - Fetch all plans
- POST /plans - Create new plan
- PUT /plans/{id} - Update plan
- DELETE /plans/{id} - Delete plan

## Features
- Simple table layout
- Add/Edit/Delete plans
- Display plan details with pricing
- Service type categorization
