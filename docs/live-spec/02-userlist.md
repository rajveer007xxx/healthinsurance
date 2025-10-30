# Userlist (Customer List) Page Specification

## URL
/admin/customers

## Page Title
"Customer List"

## Top Actions
- "Add Customer" button (teal, top right)

## Filters (6 filters in a row)
1. Location dropdown - Options: "All Locations", "COLLECTORATE"
2. Category Type dropdown - Options: "All Categories", "Prepaid", "Postpaid"
3. Expiry Date - Date picker input
4. Status dropdown - Options: "All", "Active", "Inactive", "Suspended"
5. Service Type dropdown - Options: "Both", "Broadband", "Cable TV"
6. Search input - Text search with search icon button

## Alphabet Filter
- Buttons: "All", "A" through "Z" (27 buttons total)
- Used to filter customers by first letter of name

## Table Columns (10 columns)
1. Cust ID - Customer ID number
2. Cust Name - Customer name
3. Mobile - Phone number
4. Status - ACTIVE/DEACTIVE/SUSPENDED (colored badge)
5. Plan - Plan name
6. Amount - Amount due (₹)
7. Received - Amount received (₹)
8. Balance - Balance amount (₹)
9. Exp. Date - Expiry date (DD/MM/YYYY)
10. Actions - 9 action buttons per row

## Action Buttons (9 per customer row)
1. Collect Payment (currency icon)
2. View Transactions (list icon)
3. Edit Customer (edit icon)
4. Renew Subscription (refresh icon)
5. Send Payment Link (link icon)
6. Create Complaint (alert icon)
7. Send WhatsApp (message icon)
8. Addon Bill (document icon)
9. Delete Customer (trash icon)

## Pagination
- "Showing 1 to 2 of 2 entries" text
- Records per page dropdown: 15, 25, 50, 100 (default: 25)
- Previous/Next buttons
- Page number buttons

## API Endpoints
- GET /customers - Fetch customer list with filters
- POST /customers - Add new customer
- PUT /customers/{id} - Update customer
- DELETE /customers/{id} - Delete customer
- POST /payments - Collect payment
- GET /transactions/{customer_id} - View transactions
- POST /renew - Renew subscription
- POST /send-payment-link - Send payment link
- POST /complaints - Create complaint
- POST /send-whatsapp - Send WhatsApp message
- POST /addon-bills - Create addon bill

## Features
- Multi-filter system
- Alphabet-based quick filter
- Search functionality
- Sortable table columns
- Pagination with configurable page size
- Multiple actions per customer
- Color-coded status badges
- Responsive table layout
