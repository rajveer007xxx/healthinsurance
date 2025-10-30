# Complaints List Page Specification

## URL
/admin/complaints

## Page Title
"Complaints"

## Table Columns (5 columns)
1. Complaint ID - Unique complaint ID
2. Subject - Complaint subject
3. Priority - Priority level (HIGH, MEDIUM, LOW)
4. Status - Complaint status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
5. Created - Creation date

## Empty State
- Message: "No complaints found"
- Displayed when no complaints exist

## API Endpoints
- GET /complaints - Fetch all complaints
- POST /complaints - Create new complaint
- PUT /complaints/{id} - Update complaint
- DELETE /complaints/{id} - Delete complaint

## Features
- Simple table layout
- Empty state handling
- Complaint tracking system
