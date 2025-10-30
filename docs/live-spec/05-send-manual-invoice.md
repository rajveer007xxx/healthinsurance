# Send Manual Invoice Page Specification

## URL
/admin/send-invoices

## Page Title
"Send Manually Invoice"

## Top Actions
- "Send Invoice" button (teal, top right)

## Table Columns (6 columns)
1. Invoice Number - Unique invoice ID (e.g., MINV5111682445)
2. Sent Date - Date invoice was sent (DD/MM/YYYY)
3. Customer Name - Customer name
4. Amount - Invoice amount (₹)
5. Status - Invoice status (SENT, PENDING, etc.)
6. Actions - 3 action buttons per row

## Action Buttons (3 per invoice row)
1. Download PDF (download icon)
2. Resend Invoice (send icon)
3. Delete Invoice (trash icon)

## API Endpoints
- GET /manual-invoices - Fetch all manual invoices
- POST /manual-invoices - Create new manual invoice
- GET /manual-invoices/{id}/pdf - Download invoice PDF
- POST /manual-invoices/{id}/resend - Resend invoice
- DELETE /manual-invoices/{id} - Delete invoice

## Features
- Simple table layout
- Create manual invoices
- Download invoice PDFs
- Resend invoices
- Delete invoices
- Status tracking
