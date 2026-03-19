# UI Standard

## Shared conceptual components
- PageContainer
- PageHeader
- FilterPanel
- SummaryCard
- FormSection
- DataTable
- ActionBar
- ConfirmDialog
- EmptyState
- ErrorState
- LoadingState

## Visual rules
- consistent spacing
- consistent typography
- consistent dialog patterns
- consistent table layouts
- responsive-first behavior

## Component responsibilities

### PageContainer
Wraps the entire page. Handles max-width, padding, and layout flow.

### PageHeader
Displays page title, subtitle, and primary action buttons (e.g. "New Record").

### FilterPanel
Contains filter inputs, search fields, and filter action buttons. Collapsible on mobile.

### SummaryCard
Displays a single KPI or summary metric with label, value, and optional trend indicator.

### FormSection
Groups related form fields under a section heading. Handles layout and field spacing.

### DataTable
Renders tabular data with sortable columns, pagination, loading state, and empty state.

### ActionBar
Displays contextual action buttons for a selected record or current context.

### ConfirmDialog
Modal dialog for destructive or irreversible actions. Requires explicit user confirmation.

### EmptyState
Displayed when a list or data set has zero records. Includes an icon, message, and optional CTA.

### ErrorState
Displayed when a data fetch or operation fails. Includes error message and retry action.

### LoadingState
Displayed while data is being fetched. Uses skeleton loaders or spinner, never blank screens.
