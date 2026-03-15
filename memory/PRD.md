# ResCue Research Management Dashboard - PRD

## Original Problem Statement
Build ResCue, a professional, hospital-grade research management dashboard with React, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, and Recharts. Features include localStorage persistence with JSON Export/Import, Dark/Light theme toggle, and comprehensive study management.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + shadcn/ui components
- **Storage**: localStorage with JSON Export/Import
- **Charts**: Recharts for visualizations
- **Icons**: Lucide React
- **State Management**: React Context API (ThemeContext, DataContext)

## User Personas
1. **Research Coordinators** - Manage day-to-day study operations, track enrollment, update tasks
2. **Principal Investigators** - Monitor study progress, review budgets, track publications
3. **Clinical Trial Managers** - Oversee multiple studies, financial tracking, team management
4. **Hospital Administrators** - High-level portfolio oversight, grant management

## Core Requirements (Static)
- Dashboard with interactive metric cards
- All Studies page with filtering and status badges
- Grants page with financial tracking table
- Publications page with type filtering
- Tasks page with priority sorting (Crucial > Normal)
- Study Detail page with collapsible sections
- Edit modals with mandatory change reason prompt (audit trail)
- Version history viewer
- Dark/Light theme toggle
- JSON Export/Import for data backup

## What's Been Implemented (Mar 15, 2026)

### Pages
- [x] Dashboard - 4 metric cards, recent studies grid, priority tasks list
- [x] All Studies - Search filter, status dropdown, status badge counts, Add Study modal
- [x] Grants - Horizontal bar charts for fund categories, summary panel with budget colors
- [x] Publications - Type filter, publication list with links
- [x] Tasks - Priority sorting, completion toggle, overdue indicators
- [x] Study Detail - 7 collapsible sections with edit modals, Timer icons on expiry badges

### Features
- [x] localStorage persistence
- [x] JSON Export/Import buttons
- [x] Dark/Light theme toggle
- [x] Audit trail with change reason prompts
- [x] History modal for version viewing
- [x] 5 seed studies (Optomed, VR Rehab, NeuroShield, PedVax, FLEX)
- [x] Interactive charts (Recharts - Bar, Pie, Horizontal Bar)
- [x] IRB/Grant expiry badges with Timer icons (Green > 60 days, Yellow < 60 days, Red < 30 days)
- [x] Multi-site recruitment tracking
- [x] Demographics with gender/ethnicity pie charts
- [x] Team member management
- [x] Tag management
- [x] Optional grant section in Add Study modal
- [x] Free-text Phase field input
- [x] "Not Applicable" display for studies without grants

### Components
- Layout with sidebar navigation
- Metric cards (clickable, navigating)
- Status badges with color coding
- Progress bars for enrollment/budget
- Collapsible sections
- Edit modals for all data sections
- Change reason modal (audit trail)
- History modal

## Prioritized Backlog

### P0 (Critical) - Completed
- All core pages implemented
- All edit functionality with audit trail
- Data persistence

### P1 (High Priority) - Future
- Study creation form
- Publication creation modal
- Task creation within study detail
- Data export to CSV/Excel

### P2 (Medium Priority) - Future
- Advanced filtering (date ranges, multiple criteria)
- Study comparison view
- Budget forecasting
- Email notifications for expiring dates
- Print-friendly reports

### P3 (Low Priority) - Future
- Calendar integration
- File attachments
- Comments/notes system
- Role-based access (if auth added later)

## Completed Tasks (Mar 15, 2026)
- [x] Add Study modal with optional grant section
- [x] Free-text Phase field (no longer a dropdown)
- [x] Timer icons on IRB and Grant expiry date badges
- [x] "Not Applicable" for Grant Approval Period when no funds exist
- [x] Horizontal bar chart on Grants page replacing category cards
- [x] Removed colored background from Grants summary panel
- [x] Studies without grants don't appear on Grants page
- [x] Expiry badges show exact days with "d" suffix (e.g., "45d" instead of "> 60 days")
- [x] Grants tooltip shows "Used" and "Remaining" labels properly
- [x] Handle invalid/missing dates gracefully (show "N/A")

## Next Tasks
1. User/Role-Based Access Control - Implement login system with permissions
2. Notifications - Email or in-app alerts for expiring grants and overdue tasks
3. Export functionality - CSV/PDF export for studies, grants, tasks
4. Budget forecasting - Predict budget depletion based on burn rate
