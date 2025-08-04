# Schedule Components

This directory contains the schedule management components for the manager dashboard.

## Components

### ScheduleTableView
Displays staff schedules in a table format with filtering and action buttons.

**Props:**
- `schedules` (array): List of schedule objects
- `onView` (function): Callback when view button is clicked
- `onEdit` (function): Callback when edit button is clicked
- `onDelete` (function): Callback when delete button is clicked
- `getTypeColor` (function): Function to get type color classes
- `getStatusColor` (function): Function to get status color classes
- `loading` (boolean): Loading state
- `className` (string): Additional CSS classes

### ScheduleCalendarView
Displays staff schedules in a custom calendar format.

**Props:**
- `schedules` (array): List of schedule objects
- `onScheduleClick` (function): Callback when a schedule is clicked
- `getTypeColor` (function): Function to get type color classes
- `getStatusColor` (function): Function to get status color classes

## Features

### Table View
- ✅ Responsive table layout
- ✅ Staff information display
- ✅ Date and time formatting
- ✅ Type badges with colors
- ✅ Status badges with colors
- ✅ Action buttons (View, Edit, Delete)
- ✅ Empty state handling
- ✅ Loading skeleton

### Calendar View
- ✅ Custom calendar implementation
- ✅ Month view with navigation
- ✅ Click to view schedule details
- ✅ Color-coded events by type
- ✅ Responsive design
- ✅ Legend for type colors
- ✅ Shows up to 3 schedules per day with overflow indicator

## Usage

```jsx
import ScheduleTableView from './components/schedules/ScheduleTableView';
import ScheduleCalendarView from './components/schedules/ScheduleCalendarView';

// In your component
const [viewMode, setViewMode] = useState('table');

{viewMode === 'table' && (
  <ScheduleTableView
    schedules={filteredSchedules}
    onView={(schedule) => handleView(schedule)}
    onEdit={(schedule) => handleEdit(schedule)}
    onDelete={(schedule) => handleDelete(schedule)}
    getTypeColor={getTypeColor}
    getStatusColor={getStatusColor}
    loading={loading}
  />
)}

{viewMode === 'calendar' && (
  <ScheduleCalendarView
    schedules={filteredSchedules}
    onScheduleClick={(schedule) => handleView(schedule)}
    getTypeColor={getTypeColor}
    getStatusColor={getStatusColor}
  />
)}
```

## Dependencies

- `date-fns`: Date formatting utilities
- `lucide-react`: Icons

## Styling

The calendar uses Tailwind CSS classes for styling and matches the application's design system.

## Schedule Types

- **Shift**: Blue color - Regular work shifts
- **Meeting**: Green color - Staff meetings
- **Training**: Yellow color - Training sessions
- **Leave**: Red color - Leave requests

## Schedule Statuses

- **Scheduled**: Blue - Upcoming schedules
- **Completed**: Green - Finished schedules
- **Canceled**: Gray - Cancelled schedules
- **No Show**: Red - Missed schedules 