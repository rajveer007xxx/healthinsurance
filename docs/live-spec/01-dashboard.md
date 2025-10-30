# Dashboard Page Specification

## URL
/admin/dashboard

## Page Title
"Dashboard"

## Heading
"Welcome to your ISP management dashboard"

## Stats Cards (3x4 grid)
Row 1:
1. Total Customers - Value: 2 - Icon: Users (blue)
2. Active Customers - Value: 2 - Icon: Users (green)
3. Broadband Customers - Value: 2 - Icon: Users (cyan)
4. Cable TV Customers - Value: 0 - Icon: Users (pink)

Row 2:
5. Deactive Customers - Value: 0 - Icon: Users (blue)
6. Suspended Customers - Value: 0 - Icon: Users (orange)
7. Today's Collection - Value: ₹707 - Subtext: "1 payments" - Icon: Currency (purple)
8. Month's Collection - Value: ₹11,833 - Subtext: "15 payments" - Icon: Currency (purple)

Row 3:
9. Total Dues - Value: ₹707 - Icon: Document (red)
10. Today's Expiry - Value: 0 - Icon: Calendar (yellow)
11. Next 3 Days Expiry - Value: 0 - Icon: Calendar (orange)
12. Today's Recharged - Value: 1 - Icon: Trending (green)

Row 4:
13. Month's Complaints - Value: 0 - Icon: Alert (red)
14. Month's Enrollments - Value: 2 - Icon: Users (blue)
15. Online Payments (Month) - Value: 0 - Icon: Currency (teal)

## Revenue Trend Chart
- Type: Line chart
- Title: "Revenue Trend"
- Y-axis: 0 to 12000
- X-axis: Dates/months
- Data: Shows revenue trend over time

## API Endpoints
- GET /dashboard/stats - Fetch all dashboard statistics
- GET /dashboard/revenue - Fetch revenue trend data

## Layout
- Sidebar: Left side, teal background (#448996)
- Main content: Right side, white background
- Stats cards: Grid layout with colored icons
- Chart: Full width below stats cards

## Colors
- Sidebar: #448996 (teal)
- Active menu: #00A0A0 (accent teal)
- Card icons: Various colors (blue, green, cyan, pink, orange, purple, red, yellow)
- Text: Dark gray/black
- Background: White

## Features
- Responsive grid layout
- Icon-based stat cards
- Interactive line chart
- Real-time data display
