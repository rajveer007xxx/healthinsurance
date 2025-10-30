# Complete Button Functionality Scan

## Customer List Page (/admin/customers)
**URL**: http://82.29.162.153/admin/customers (NOT /admin/userlist)

### Page Title
"Customer List" (not "Userlist")

### Top Actions
- "Add Customer" button (teal, top right)

### Filters (6 filters)
1. Location dropdown - Options: "All Locations", "COLLECTORATE"
2. Category Type dropdown - Options: "All Categories", "Prepaid", "Postpaid"
3. Expiry Date - Date picker input
4. Status dropdown - Options: "All", "Active", "Inactive", "Suspended"
5. Service Type dropdown - Options: "Both", "Broadband", "Cable TV"
6. Search input with search button

### Alphabet Filter
- Buttons: "All", "A" through "Z" (27 buttons total)

### Table Columns (10 columns)
1. Cust ID - Customer ID number
2. Cust Name - Customer name
3. Mobile - Mobile number
4. Status - Status badge (ACTIVE, DEACTIVE, SUSPENDED)
5. Plan - Plan name
6. Amount - Plan amount (₹)
7. Received - Amount received (₹)
8. Balance - Current balance (₹)
9. Exp. Date - Expiry date (DD/MM/YYYY)
10. Actions - 9 action buttons per row

### Action Buttons (9 per customer row) - CRITICAL DISCOVERY
1. **Collect Payment** (dollar icon) - Opens payment collection modal
2. **View Transactions** (list icon) - Shows transaction history for customer
3. **Edit Customer** (edit icon) - Opens edit customer form
4. **Renew Subscription** (refresh icon) - Renew customer subscription
5. **Send Payment Link** (link icon) - Send payment link via SMS/Email
6. **Create Complaint** (message icon) - Create complaint for customer
7. **Send WhatsApp** (phone icon) - Send WhatsApp message to customer
8. **Addon Bill** (document icon) - Create addon bill for customer
9. **Delete Customer** (trash icon) - Delete customer (with confirmation)

## Button 1: Collect Payment Modal

**Modal Title**: "Collect Payment"

**Fields**:
1. **Customer** - Text input (disabled, pre-filled with customer name)
2. **Balance Due** - Text input (disabled, shows current balance in ₹)
3. **Amount *** - Number input (required, pre-filled with balance due)
4. **Discount** - Number input (optional, for applying discount)
5. **Transaction No** - Text input (auto-generated, format: TXN########)
6. **Payment Date *** - Date input (required, defaults to today)
7. **Payment Method *** - Dropdown (required) with options:
   - Cash (default)
   - Paytm
   - PhonePe
   - GooglePay
   - Cheque
   - Net Banking
   - UPI
8. **Remarks** - Textarea (optional, for additional notes)

**Actions**:
- Submit Payment button (teal, submits the payment)
- Cancel button (gray, closes modal)
- X button (top right, closes modal)

**Behavior**:
- Opens as modal overlay on customer list page
- Pre-fills customer name and balance due
- Auto-generates transaction number
- Defaults payment date to today
- Defaults payment method to Cash
- Amount field pre-filled with balance due amount


## Button 2: View Transactions Modal

**Modal Title**: "Transaction History - {CUSTOMER_NAME}"

**Table Columns (7 columns)**:
1. **Date** - Transaction date (DD/MM/YYYY format)
2. **Transaction ID** - Unique transaction ID (TXN######## or RNWINV#########)
3. **Type** - Badge showing transaction type:
   - PAYMENT (green badge)
   - RENEWAL (red badge)
4. **Description** - Transaction description text
   - For payments: "Payment via {METHOD}" or "Payment via {METHOD} (Discount: ₹{AMOUNT})"
   - For renewals: "Auto-renewal for {N} month(s) - Invoice {INVOICE_ID}"
5. **Collected/Added** - Employee/admin name who processed transaction
6. **Amount** - Transaction amount in ₹
7. **After Balance** - Customer balance after transaction in ₹

**Features**:
- Scrollable table (shows many transactions)
- Close button (X) at top right
- Modal overlay on customer list page

**Sample Data**:
- Payment: 29/10/2025, TXN81800245, PAYMENT, "Payment via CASH", RAJVEER SINGH, ₹1000, ₹207
- Renewal: 29/10/2025, RNWINV321419280, RENEWAL, "Auto-renewal for 1 month(s) - Invoice INV321419280", Admin, ₹707, ₹1207
- Payment with discount: 29/10/2025, TXN93521772, PAYMENT, "Payment via CASH (Discount: ₹100)", RAJVEER SINGH, ₹500, ₹500


## Button 3: Edit Customer Modal

**Modal Title**: "Edit Customer - {CUSTOMER_NAME}"

**Multi-Step Form with 3 Tabs**:
1. General Info (active by default)
2. Address Details
3. Billing Details

### Tab 1: General Info Fields (12 fields)

**Left Column**:
1. **Customer ID *** - Text input (disabled, pre-filled with customer ID)
2. **Full Name *** - Text input (required)
3. **Email** - Email input (optional)
4. **Mobile *** - Text input (required)
5. **ID Proof Type** - Dropdown with options:
   - Aadhar Card (default)
   - PAN Card
   - Voter ID
   - Driving License
6. **Customer GST No** - Text input (optional)

**Right Column**:
1. **Username** - Text input (optional)
2. **Nickname** - Text input (optional)
3. **Phone** - Text input (optional)
4. **Alternate Mobile** - Text input (optional)
5. **ID Proof Number** - Text input (optional)
6. **Customer State Code** - Text input (optional)

**Actions**:
- Previous button (disabled on first tab)
- Cancel button (gray, closes modal)
- Next button (teal, goes to next tab)
- X button (top right, closes modal)

**Sample Data**:
- Customer ID: 7452403038
- Username: test123
- Full Name: RAJVEER_PREPAID
- Email: RAJVEERSINGH007BOND@GMAIL.COM
- Phone: 09826384268
- Mobile: 09826384268
- ID Proof Type: Aadhar Card
- Customer GST No: 23RFFDFGD4343TG


### Tab 2: Address Details Fields (6 fields)

**Left Column**:
1. **House Number** - Text input (optional)
2. **Address** - Textarea (multi-line address input)
3. **City** - Dropdown with 136+ cities in Madhya Pradesh

**Right Column**:
1. **Locality** - Dropdown (Select Locality, COLLECTORATE)
2. **State** - Dropdown with all 36 Indian states/UTs (Andaman and Nicobar Islands through West Bengal)
3. **Pincode** - Text input (6-digit pincode)

**Sample Data**:
- House Number: 22
- Locality: COLLECTORATE
- Address: "Vijay nagar,Near Vaishali Avenue,Ahead Bhagat Nagar\nVijay Nagar"
- State: Madhya Pradesh
- City: Tikamgarh
- Pincode: 472001

**Actions**:
- Previous button (enabled, goes back to General Info)
- Cancel button (gray, closes modal)
- Next button (teal, goes to Billing Details)


### Tab 3: Billing Details Fields (11 fields)

**Left Column**:
1. **Service Type *** - Dropdown (required):
   - Broadband (default)
   - Cable TV
2. **CAF No** - Text input (disabled, auto-generated, format: CAF########)
3. **MAC Address** - Text input (optional)
4. **IP Address** - Text input (optional)
5. **Modem No** - Text input (optional)
6. **GST Invoice Needed** - Dropdown:
   - No
   - Yes (default)

**Right Column**:
1. **Billing Type *** - Dropdown (required):
   - Prepaid (default)
   - Postpaid
2. **MAC Address Detail** - Text input (optional)
3. **Vendor** - Text input (optional)
4. **Modem No Detail** - Text input (optional)
5. **Status *** - Dropdown (required):
   - Active (default)
   - Deactive
   - Suspended
   - Terminated

**Sample Data**:
- Service Type: Broadband
- Billing Type: Prepaid
- CAF No: CAF39134803 (disabled)
- GST Invoice Needed: Yes
- Status: Active

**Actions**:
- Previous button (enabled, goes back to Address Details)
- Cancel button (gray, closes modal)
- Update Customer button (teal, saves all changes and closes modal)

**Complete Edit Customer Modal Summary**:
- 3-tab multi-step form
- Total 29 fields across all tabs
- 12 fields in General Info
- 6 fields in Address Details
- 11 fields in Billing Details
- Navigation: Previous/Next/Cancel/Update Customer buttons
- Modal closes on Cancel or Update Customer


## Summary of Customer List Page Scanning (Buttons 1-3 Complete)

✅ **Button 1: Collect Payment** - Modal with 8 fields for payment collection
✅ **Button 2: View Transactions** - Modal with transaction history table (7 columns)
✅ **Button 3: Edit Customer** - 3-tab modal with 29 total fields

**Remaining Buttons to Scan (4-9)**:
- Button 4: Renew Subscription
- Button 5: Send Payment Link
- Button 6: Create Complaint
- Button 7: Send WhatsApp
- Button 8: Addon Bill
- Button 9: Delete Customer

**Next Steps**:
1. Scan remaining 6 action buttons on Customer List page
2. Scan backend database (ispbilling.db) for complete schema
3. Scan backend API endpoints (/home/ubuntu/isp-management-system/isp-backend-v2)
4. Document all API endpoints, request/response structures
5. Update source code with all discovered functionality
6. Build and test application
7. Push to GitHub
8. Create pull request


## Plans Page (/admin/plans)

### Page Structure
- **Title**: "Plans Management"
- **Top Action**: Add Plan button (teal)
- **Table Columns (9 columns)**:
  1. Plan Name
  2. Service Type
  3. Speed
  4. Data Limit
  5. Price (₹)
  6. Total Amount (₹)
  7. Validity
  8. Status
  9. Actions (2 buttons per row)

### Sample Data
- Plan: "50 Mbps Unlimited Data"
- Service Type: BROADBAND
- Speed: 50 Mbps
- Data Limit: Unlimited
- Price: ₹599
- Total Amount: ₹706.82 (includes taxes)
- Validity: 1 month
- Status: Active

### Add Plan Modal

**Modal Title**: "Add New Plan"

**Fields (12 fields)**:
1. **Plan Name*** - Text input (required)
2. **Service Type*** - Dropdown (required)
   - Options: Broadband, Cable TV
   - Default: Broadband
3. **Speed*** - Text input (required)
   - Placeholder: "e.g., 100 Mbps"
4. **Data Limit*** - Text input (required)
   - Placeholder: "e.g., Unlimited or 500 GB"
   - Default: "Unlimited"
5. **Price (₹)*** - Number input (required)
6. **Validity (Months)*** - Number input (required, disabled)
   - Default: 1
   - Note: Appears to be fixed at 1 month
7. **CGST %** - Number input (optional)
8. **SGST %** - Number input (optional)
9. **IGST %** - Number input (optional)
10. **Total Plan Amount** - Text input (disabled, auto-calculated)
    - Placeholder: "Auto-calculated"
    - Calculation: Price + (Price × CGST%) + (Price × SGST%) + (Price × IGST%)
11. **Description** - Textarea (optional)
12. **Active** - Checkbox (checked by default)

**Actions**:
- Cancel button (gray)
- Add Plan button (teal)
- X close button (top right)

**Key Observations**:
- Validity is fixed at 1 month (disabled field)
- Total Amount is auto-calculated based on Price and tax percentages
- Active checkbox is checked by default
- Service Type defaults to Broadband


### Edit Plan Modal

**Modal Title**: "Edit Plan"

**Fields (12 fields)** - Same as Add Plan but pre-filled:
1. **Plan Name*** - Pre-filled: "50 Mbps Unlimited Data"
2. **Service Type*** - Pre-filled: "Broadband"
3. **Speed*** - Pre-filled: "50 Mbps"
4. **Data Limit*** - Pre-filled: "Unlimited"
5. **Price (₹)*** - Pre-filled: 599
6. **Validity (Months)*** - Pre-filled: 1 (disabled)
7. **CGST %** - Pre-filled: 9
8. **SGST %** - Pre-filled: 9
9. **IGST %** - Pre-filled: 0
10. **Total Plan Amount** - Pre-filled: ₹706.82 (auto-calculated)
11. **Description** - Pre-filled: "50 Mbps Unlimited Data"
12. **Active** - Checked

**Actions**:
- Cancel button (gray)
- Update Plan button (teal)
- X close button (top right)

**Key Observations**:
- Identical to Add Plan modal but with pre-filled data
- Button text changes from "Add Plan" to "Update Plan"
- Tax calculation: ₹599 + (₹599 × 9%) + (₹599 × 9%) = ₹706.82

### Delete Plan Button

**Action**: Clicking Delete Plan button (red trash icon)
**Expected Behavior**: Shows confirmation dialog, then deletes plan from database


## Payment History Page (/admin/transactions)

### Page Structure
- **Title**: "Payment History"
- **Total Collection Display**: Shows total amount collected (e.g., "Total Collection: ₹11833.00") in green
- **5 Filter Dropdowns**:
  1. Service Type (Broadband, Cable TV, Both) - Default: Both
  2. Locality (All, COLLECTORATE, etc.) - Default: All
  3. Mode (All, Online, Offline) - Default: All
  4. Employee (All, employee names) - Default: All
  5. Financial Year (2025-2026, 2024-2025, 2023-2024) - Default: 2025-2026
- **Search Box**: Text input with search icon button
- **Alphabet Navigation**: All, A-Z buttons (27 buttons total)
- **Table Columns (8 columns)**:
  1. Date (DD/MM/YYYY format)
  2. Transaction ID (TXN + 8 digits)
  3. Type (CASH, PAYTM, PHONEPE, etc.)
  4. Description (Customer name and mobile)
  5. Collected/Added (Admin name or description)
  6. Amount (₹)
  7. After Balance (₹)
  8. Action (Download Receipt button)

### Sample Data
- Date: 30/10/2025
- Transaction ID: TXN97713603
- Type: CASH
- Description: RAJVEER_POSTPAID (6997361014)
- Collected/Added: Admin
- Amount: ₹707
- After Balance: ₹500

### Pagination
- Shows "Showing 1 to 15 of 15 entries"
- Records per page dropdown: 15, 25, 50, 100 (Default: 25)
- Previous/Next buttons
- Page number buttons (1, 2, 3, etc.)

### Action Buttons
1. **Download Receipt** - Download icon button for each transaction row

**Note**: This is the page where user originally requested "Sl. No." column to be added as the first column.


### Download Receipt Button

**Action**: Clicking Download Receipt button (download icon)
**Expected Behavior**: Downloads PDF receipt for the transaction
**Implementation**: Generates PDF receipt with transaction details and downloads as blob URL


## Dashboard Page (/admin/dashboard)

### Page Structure
- **Title**: "Dashboard"
- **Subtitle**: "Welcome to your ISP management dashboard"
- **15 Stat Cards** (4x4 grid layout):

**Row 1 (Customer Stats)**:
1. **Total Customers** - Count: 2, Icon: Users (blue)
2. **Active Customers** - Count: 2, Icon: Users (green)
3. **Broadband Customers** - Count: 2, Icon: Users (cyan)
4. **Cable TV Customers** - Count: 0, Icon: Users (pink)

**Row 2 (Customer Status)**:
5. **Deactive Customers** - Count: 0, Icon: Users (blue)
6. **Suspended Customers** - Count: 0, Icon: Users (orange)
7. **Today's Collection** - Amount: ₹707, Subtext: "1 payments", Icon: Rupee (purple)
8. **Month's Collection** - Amount: ₹11,833, Subtext: "15 payments", Icon: Rupee (purple)

**Row 3 (Financial & Expiry)**:
9. **Total Dues** - Amount: ₹707, Icon: Document (red)
10. **Today's Expiry** - Count: 0, Icon: Clock (yellow)
11. **Next 3 Days Expiry** - Count: 0, Icon: Clock (orange)
12. **Today's Recharged** - Count: 1, Icon: Trending Up (green)

**Row 4 (Activity Stats)**:
13. **Month's Complaints** - Count: 0, Icon: Alert Circle (red)
14. **Month's Enrollments** - Count: 2, Icon: Users (blue)
15. **Online Payments (Month)** - Count: 0, Icon: Rupee (teal)

### Revenue Trend Chart
- **Title**: "Revenue Trend"
- **Chart Type**: Line chart (appears to be using recharts library)
- **Y-axis**: Revenue scale (0, 3000, 6000, 9000, 12000)
- **X-axis**: Time period (dates/months)

**Key Observations**:
- All stat cards have colored circular icons on the right
- Cards use white background with shadow
- Numbers are large and bold
- Subtext provides additional context (e.g., "1 payments", "15 payments")
- Color scheme: Blue, Green, Cyan, Pink, Purple, Orange, Red, Yellow, Teal


## Send Manual Invoice Page (/admin/send-invoice)

### Page Structure
- **Status**: Page appears blank/not loading properly
- **Possible Issue**: JavaScript error or page not implemented
- **Note**: Need to check console errors and investigate further


## Complaints Page (/admin/complaints)

### Page Structure
- **Title**: "Complaints"
- **Table Columns (5 columns)**:
  1. Complaint ID
  2. Subject
  3. Priority
  4. Status
  5. Created

### Current State
- **Empty State**: "No complaints found" message displayed
- **Note**: Table structure exists but no data to show action buttons

**Expected Features** (based on backend API):
- Create Complaint button (likely at top)
- View/Edit complaint buttons per row
- Update status button
- Priority levels: LOW, MEDIUM, HIGH, URGENT
- Status values: OPEN, IN_PROGRESS, RESOLVED, CLOSED


## Addon Bills Page (/admin/addon-bills)

### Page Structure
- **Status**: Under Construction
- **Display**: Shows "UnderConstruction" component with:
  - Construction icon (person with tools)
  - Title: "🚧 Page Under Construction 🚧"
  - Message: "We're working hard to bring you this feature!"
  - Info box: "Please Visit Again Soon - This page is currently being developed and will be available shortly."
  - Two buttons: "← Go Back" (purple), "Dashboard" (outlined)
  - Footer: "Thank you for your patience! 🙏"

**Note**: This page is not yet implemented and shows the UnderConstruction component.

