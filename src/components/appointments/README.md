# Appointment Components

This directory contains the appointment management components for the consultant dashboard.

## Components

### AppointmentTableView
Displays appointments in a table format with filtering and action buttons.

**Props:**
- `appointments` (array): List of appointment objects
- `onView` (function): Callback when view button is clicked
- `onEdit` (function): Callback when edit button is clicked
- `onDelete` (function): Callback when delete button is clicked
- `onJoin` (function): Callback when join meeting button is clicked
- `getStatusColor` (function): Function to get status color classes
- `getTypeIcon` (function): Function to get appointment type icon component

### AppointmentCalendarView
Displays appointments in a custom calendar format.

**Props:**
- `appointments` (array): List of appointment objects
- `onAppointmentClick` (function): Callback when an appointment is clicked
- `getStatusColor` (function): Function to get status color classes
- `getTypeIcon` (function): Function to get appointment type icon component

## Features

### Table View
- ✅ Responsive table layout
- ✅ Student information display
- ✅ Date and time formatting
- ✅ Status badges with colors
- ✅ Action buttons (View, Edit, Delete, Join)
- ✅ Empty state handling

### Calendar View
- ✅ Custom calendar implementation
- ✅ Month view with navigation
- ✅ Click to view appointment details
- ✅ Color-coded events by status
- ✅ Responsive design
- ✅ Legend for status colors
- ✅ Shows up to 3 appointments per day with overflow indicator

## Usage

```jsx
import AppointmentTableView from './components/appointments/AppointmentTableView';
import AppointmentCalendarView from './components/appointments/AppointmentCalendarView';

// In your component
const [viewMode, setViewMode] = useState('table');

{viewMode === 'table' && (
  <AppointmentTableView
    appointments={filteredAppointments}
    onView={(appointment) => handleView(appointment)}
    onEdit={(appointment) => handleEdit(appointment)}
    onDelete={(id) => handleDelete(id)}
    onJoin={(appointment) => handleJoin(appointment)}
    getStatusColor={getStatusColor}
    getTypeIcon={getTypeIcon}
  />
)}

{viewMode === 'calendar' && (
  <AppointmentCalendarView
    appointments={filteredAppointments}
    onAppointmentClick={(appointment) => handleView(appointment)}
    getStatusColor={getStatusColor}
    getTypeIcon={getTypeIcon}
  />
)}
```

## Dependencies

- `date-fns`: Date formatting utilities
- `lucide-react`: Icons

## Styling

The calendar uses Tailwind CSS classes for styling and matches the application's design system. 