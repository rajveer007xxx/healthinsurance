# Payment History Page Specification

## URL
/admin/transactions

## Page Title
"Payment History"

## Top Summary
- "Total Collection: ₹11833.00" (green text, top right)

## Filters (6 filters in a row)
1. Service Type dropdown - Options: "Broadband", "Cable TV", "Both" (default: Both)
2. Locality dropdown - Options: "All", "COLLECTORATE"
3. Mode dropdown - Options: "All", "Online", "Offline"
4. Employee dropdown - Options: "All"
5. Financial Year dropdown - Options: "2025-2026", "2024-2025", "2023-2024"
6. Search input - Text search with search icon button

## Alphabet Filter
- Buttons: "All", "A" through "Z" (27 buttons total)

## Table Columns (8 columns - NO Sl. No. column)
1. Date - Transaction date (DD/MM/YYYY)
2. Transaction ID - Unique transaction ID (e.g., TXN97713603)
3. Type - Payment type (CASH, ONLINE, etc.)
4. Description - Customer name and ID
5. Collected/Added - Who collected (Admin, employee name, or notes)
6. Amount - Transaction amount (₹)
7. After Balance - Balance after transaction (₹)
8. Action - 1 action button per row

## Action Button (1 per transaction row)
1. Download Receipt (download icon)

## Pagination
- "Showing 1 to 15 of 15 entries" text
- Records per page dropdown: 15, 25, 50, 100 (default: 25)
- Previous/Next buttons
- Page number buttons

## API Endpoints
- GET /transactions - Fetch transaction history with filters
- GET /transactions/{id}/receipt - Download receipt PDF

## Features
- Multi-filter system
- Alphabet-based quick filter
- Search functionality
- Total collection summary
- Scrollable table
- Pagination with configurable page size
- Receipt download functionality
- Financial year filtering
