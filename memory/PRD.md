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

## What's Been Implemented (Jan 15, 2026)

### Pages
- [x] Dashboard - 4 metric cards, recent studies grid, priority tasks list
- [x] All Studies - Search filter, status dropdown, status badge counts
- [x] Grants - Financial summary cards, detailed grants table
- [x] Publications - Type filter, publication list with links
- [x] Tasks - Priority sorting, completion toggle, overdue indicators
- [x] Study Detail - 7 collapsible sections with edit modals

### Features
- [x] localStorage persistence
- [x] JSON Export/Import buttons
- [x] Dark/Light theme toggle
- [x] Audit trail with change reason prompts
- [x] History modal for version viewing
- [x] 5 seed studies (Optomed, VR Rehab, NeuroShield, PedVax, FLEX)
- [x] Interactive charts (Recharts - Bar, Pie)
- [x] IRB/Grant expiry badges (Green > 60 days, Yellow < 60 days, Red < 30 days)
- [x] Multi-site recruitment tracking
- [x] Demographics with gender/ethnicity pie charts
- [x] Team member management
- [x] Tag management

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

## Next Tasks
1. Add study creation functionality (Add Study button)
2. Add publication creation modal
3. Implement CSV export for grants/tasks
4. Add notification system for expiring IRB/grants
