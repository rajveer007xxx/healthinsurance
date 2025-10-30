# Backend API Comprehensive Scan

## Database Location
- Path: `/root/isp-backend-v2/ispbilling.db`
- Type: SQLite database

## Backend Router Files (21 routers)
1. **auth.py** (4520 bytes) - Authentication endpoints
2. **customers.py** (9806 bytes) - Customer management endpoints
3. **plans.py** (2417 bytes) - Plan management endpoints
4. **payments.py** (2670 bytes) - Payment processing endpoints
5. **transactions.py** (717 bytes) - Transaction endpoints
6. **invoices.py** (3386 bytes) - Invoice management endpoints
7. **dashboard.py** (6408 bytes) - Dashboard statistics endpoints
8. **complaints.py** (3134 bytes) - Complaint management endpoints
9. **companies.py** (2164 bytes) - Company management endpoints
10. **localities.py** (2156 bytes) - Locality management endpoints
11. **addon_bills.py** (717 bytes) - Addon bill endpoints
12. **employees.py** (717 bytes) - Employee management endpoints
13. **expenses.py** (717 bytes) - Expense tracking endpoints
14. **refunds.py** (717 bytes) - Refund management endpoints
15. **reports.py** (717 bytes) - Report generation endpoints
16. **notifications.py** (717 bytes) - Notification endpoints
17. **payment_gateways.py** (717 bytes) - Payment gateway endpoints
18. **connection_requests.py** (717 bytes) - Connection request endpoints

## Customer Router API Endpoints (from customers.py)

### POST /customers/
- **Purpose**: Create new customer
- **Request Body**: CustomerCreate schema
- **Response**: Customer object
- **Key Fields**:
  - Generates unique 10-digit customer_id
  - Hashes password
  - Calculates end_date from start_date + period_months * 30
  - Creates initial invoice (DRAFT status)
  - Sets status to "ACTIVE"

### GET /customers/
- **Purpose**: List all customers with filtering
- **Query Parameters**:
  - skip (pagination offset)
  - limit (pagination limit, default 100)
  - status (filter by status)
  - service_type (filter by service type)
  - search (search by name, customer_id, mobile)
  - locality_id (filter by locality)
  - company_id (filter by company)
- **Response**: List of Customer objects

### GET /customers/{customer_id}
- **Purpose**: Get single customer details
- **Response**: Customer object

## Customer Model Fields (from customers.py)
- customer_id (10-digit unique ID)
- username
- password_hash
- full_name
- nickname
- email
- mobile
- alternate_mobile
- customer_gst_no
- id_proof_type
- id_proof_no
- house_number
- address
- locality_id
- city
- state
- pincode
- service_type
- no_of_connections
- company_id
- auto_renew
- caf_no (Customer Application Form number)
- mac_address
- mac_address_detail
- ip_address
- vendor
- modem_no
- modem_no_detail
- stb_modem_security_amount
- plan_id
- period_months
- start_date
- end_date
- billing_type (PREPAID/POSTPAID)
- assigned_employee_id
- status (ACTIVE/DEACTIVE/SUSPENDED/TERMINATED)


## Payment Router API Endpoints (from payments.py)

### POST /payments/
- **Purpose**: Create payment and update invoice
- **Generates**: PAY + 12-digit payment ID
- **Creates**: Transaction record (TXN + 12-digit ID)
- **Updates**: Invoice paid_amount and balance_amount
- **Auto-marks**: Invoice as PAID when balance_amount <= 0

### GET /payments/
- **Query Parameters**: skip, limit, customer_id
- **Response**: List of Payment objects

## Plans Router API Endpoints (from plans.py)

### POST /plans/
- **Purpose**: Create new plan
- **Response**: Plan object

### GET /plans/
- **Query Parameters**: skip, limit, service_type, company_id, is_active
- **Response**: List of Plan objects

### PUT /plans/{plan_id}
- **Purpose**: Update plan
- **Response**: Updated Plan object

### DELETE /plans/{plan_id}
- **Purpose**: Delete plan
- **Response**: Success message

## Invoices Router API Endpoints (from invoices.py)

### POST /invoices/
- **Purpose**: Create manual invoice
- **Generates**: INV + timestamp invoice number
- **Calculates**: total_amount = bill_amount + taxes + installation - discount
- **Sets**: status to DRAFT, balance_amount to total_amount

### GET /invoices/
- **Query Parameters**: skip, limit, customer_id, status
- **Response**: List of Invoice objects

### PUT /invoices/{invoice_id}/status
- **Purpose**: Update invoice status
- **Sets**: sent_at timestamp when status = SENT

### DELETE /invoices/{invoice_id}
- **Purpose**: Delete invoice

## Complaints Router API Endpoints (from complaints.py)

### POST /complaints/
- **Purpose**: Create complaint
- **Generates**: CMP + 10-digit complaint ID
- **Sets**: status to OPEN

### GET /complaints/
- **Query Parameters**: skip, limit, customer_id, status
- **Response**: List of Complaint objects

### PUT /complaints/{complaint_id}
- **Purpose**: Update complaint
- **Sets**: resolved_at timestamp when status = RESOLVED

### DELETE /complaints/{complaint_id}
- **Purpose**: Delete complaint

## Database Models Summary

### Customer Model (Complete)
- **Primary Key**: id (Integer)
- **Unique Fields**: customer_id (10-digit), username
- **Personal Info**: full_name, nickname, email, mobile, alternate_mobile
- **ID Proof**: id_proof_type (VOTER_ID, PASSPORT, DRIVING_LICENSE, SERVICE_ID_CARD, AADHAR_CARD, PASSBOOK, OTHER), id_proof_no
- **Address**: house_number, address, locality_id, city, state, pincode
- **Service**: service_type (BROADBAND, CABLE_TV), no_of_connections, company_id
- **Billing**: billing_type (PREPAID, POSTPAID), plan_id, period_months, start_date, end_date
- **Technical**: caf_no, mac_address, mac_address_detail, ip_address, vendor, modem_no, modem_no_detail
- **Status**: status (ACTIVE, DEACTIVE, SUSPENDED), auto_renew
- **Relationships**: locality, company, plan, assigned_employee, invoices, payments, complaints, transactions, addon_bills

### Plan Model
- **Fields**: name, description, service_type, speed, data_limit, price, validity_days, company_id, is_active

### Invoice Model
- **Fields**: invoice_number, customer_id, bill_amount, cgst_tax, sgst_tax, igst_tax, installation_charges, discount, total_amount, paid_amount, balance_amount, invoice_date, due_date, billing_period_start, billing_period_end, status (DRAFT, SENT, PAID, OVERDUE, CANCELLED)

### Payment Model
- **Fields**: payment_id, customer_id, invoice_id, amount, payment_method (CASH, PAYTM, PHONEPE, GOOGLEPAY, CHEQUE, NET_BANKING, EXCITEL, WIOM), payment_reference, remarks, status (PENDING, COMPLETED, FAILED)

### Complaint Model
- **Fields**: complaint_id, customer_id, title, description, category, priority, status (OPEN, IN_PROGRESS, RESOLVED, CLOSED), resolved_at

### Transaction Model
- **Fields**: transaction_id, customer_id, transaction_type, amount, description

### Payment Methods Available
1. CASH
2. PAYTM
3. PHONEPE
4. GOOGLEPAY
5. CHEQUE
6. NET_BANKING
7. EXCITEL
8. WIOM

## Key Findings for Frontend Implementation

1. **Customer ID Generation**: 10-digit random number
2. **Payment ID Format**: PAY + 12 digits
3. **Transaction ID Format**: TXN + 12 digits
4. **Complaint ID Format**: CMP + 10 digits
5. **Invoice Number Format**: INV + timestamp (YYYYMMDDHHmmss)
6. **CAF Number Format**: CAF + 8 digits (auto-generated)

7. **Customer Status Values**: ACTIVE, DEACTIVE, SUSPENDED, TERMINATED
8. **Billing Types**: PREPAID, POSTPAID
9. **Service Types**: BROADBAND, CABLE_TV
10. **Invoice Statuses**: DRAFT, SENT, PAID, OVERDUE, CANCELLED
11. **Complaint Statuses**: OPEN, IN_PROGRESS, RESOLVED, CLOSED
12. **Payment Statuses**: PENDING, COMPLETED, FAILED

13. **ID Proof Types**: VOTER_ID, PASSPORT, DRIVING_LICENSE, SERVICE_ID_CARD, AADHAR_CARD, PASSBOOK, OTHER

14. **Auto-calculations**:
    - end_date = start_date + (period_months * 30 days)
    - total_amount = bill_amount + cgst + sgst + igst + installation - discount
    - balance_amount = total_amount - paid_amount
    - Invoice auto-marked PAID when balance_amount <= 0

15. **Relationships**:
    - Customer → Plan (many-to-one)
    - Customer → Locality (many-to-one)
    - Customer → Company (many-to-one)
    - Customer → Invoices (one-to-many)
    - Customer → Payments (one-to-many)
    - Customer → Complaints (one-to-many)
    - Customer → Transactions (one-to-many)

