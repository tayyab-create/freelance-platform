# Shared Components Library - Phase 1

A comprehensive collection of reusable, modern UI components for the Freelance Platform.

## 📦 Components

### 1. **SkeletonLoader**
Loading placeholders for better perceived performance.

**Types:** `card`, `list`, `table`, `profile`, `stat`, `text`

```jsx
<SkeletonLoader type="card" count={3} />
```

---

### 2. **EmptyState**
Elegant empty state displays for lists and tables.

```jsx
<EmptyState
  icon={FiBriefcase}
  title="No jobs available"
  description="Check back later for new opportunities"
  actionLabel="Browse All"
  onAction={() => navigate('/jobs')}
/>
```

---

### 3. **StatCard**
Dashboard statistics cards with trends and animations.

```jsx
<StatCard
  title="Total Applications"
  value="24"
  change={12}
  trend="up"
  icon={FiBriefcase}
  gradient="from-blue-500 to-cyan-500"
/>
```

---

### 4. **PageHeader**
Consistent page headers with breadcrumbs and actions.

```jsx
<PageHeader
  title="Browse Jobs"
  subtitle="Find your next opportunity"
  breadcrumbs={[...]}
  actions={<button>...</button>}
/>
```

---

### 5. **Avatar**
User avatars with status indicators and fallback to initials.

```jsx
<Avatar
  src={user.profilePhoto}
  name={user.name}
  size="lg"
  status="online"
/>
```

**Sizes:** `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
**Status:** `online`, `offline`, `busy`, `away`

---

### 6. **StatusBadge**
Pre-configured status badges for applications, jobs, payments.

```jsx
<StatusBadge status="pending" size="md" showIcon={true} />
```

**Available statuses:**
- Application: `pending`, `approved`, `rejected`
- Work: `active`, `completed`, `in-progress`, `reviewing`, `on-hold`
- Payment: `paid`, `unpaid`, `processing`
- User: `online`, `offline`

---

### 7. **ProgressBar**
Visual progress indicators with multiple variants.

```jsx
<ProgressBar
  percentage={75}
  label="Profile Completion"
  color="primary"
  showPercentage={true}
/>

<SegmentedProgressBar
  steps={[...]}
  currentStep={2}
/>
```

**Colors:** `primary`, `success`, `warning`, `danger`, `info`

---

### 8. **Modal**
Feature-rich modal dialogs with keyboard support.

```jsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Profile"
  size="lg"
  footer={<>...</>}
>
  {/* Content */}
</Modal>

<ConfirmModal
  isOpen={showConfirm}
  onConfirm={handleDelete}
  title="Delete Item"
  message="Are you sure?"
  variant="danger"
/>
```

**Sizes:** `sm`, `md`, `lg`, `xl`, `full`

---

### 9. **DataTable**
Responsive tables with search, sort, and pagination.

```jsx
<DataTable
  columns={columns}
  data={data}
  searchable={true}
  sortable={true}
  pagination={true}
  pageSize={10}
  onRowClick={(row) => handleClick(row)}
/>
```

**Features:**
- Automatic mobile-friendly cards
- Built-in search
- Column sorting
- Pagination
- Custom cell rendering

---

### 10. **FilterBar**
Advanced filtering interface with multiple filter types.

```jsx
<FilterBar
  onSearch={handleSearch}
  onFilterChange={handleFilterChange}
  filters={filterConfig}
  searchPlaceholder="Search..."
/>
```

**Filter types:** `select`, `multiselect`, `range`, `date`

---

### 11. **ActionDropdown**
Consistent action menus with keyboard navigation.

```jsx
<ActionDropdown
  actions={[
    { label: 'Edit', icon: FiEdit, onClick: handleEdit },
    { label: 'Delete', icon: FiTrash, onClick: handleDelete, variant: 'danger' }
  ]}
  position="bottom-right"
/>
```

---

## 🎨 New CSS Utilities

Added to `index.css`:

- `.scrollbar-custom` - Custom scrollbar styling
- `.transition-smooth` - Smooth transitions
- `.card-interactive` - Interactive card hover effects
- `.icon-container` - Gradient icon containers
- `.grid-auto-fit` - Responsive grid layout
- `.grid-auto-fill` - Alternative responsive grid
- `.animate-shimmer` - Shimmer animation for loading states

---

## 📚 Usage

### Single Import
```jsx
import { StatCard } from '../components/shared';
```

### Multiple Imports
```jsx
import {
  PageHeader,
  DataTable,
  EmptyState,
  StatusBadge
} from '../components/shared';
```

---

## 🎯 Best Practices

1. **Always use SkeletonLoader** instead of generic spinners for list/grid loading states
2. **Use EmptyState** for all empty lists, tables, and search results
3. **Consistent StatusBadge** usage across all status indicators
4. **PageHeader** on every major page for consistency
5. **DataTable** for all tabular data (automatically handles mobile)
6. **Modal** for all dialogs and confirmations
7. **FilterBar** for any page with filtering needs

---

## 🔄 Migration Guide

### Before:
```jsx
{loading && <Spinner />}
{!loading && jobs.length === 0 && <p>No jobs found</p>}
```

### After:
```jsx
{loading ? (
  <SkeletonLoader type="card" count={6} />
) : jobs.length === 0 ? (
  <EmptyState
    icon={FiBriefcase}
    title="No jobs available"
    actionLabel="Browse All"
    onAction={() => navigate('/jobs')}
  />
) : (
  <div className="grid-auto-fit">{/* jobs */}</div>
)}
```

---

## 📖 Complete Examples

See `USAGE_EXAMPLES.jsx` for comprehensive examples of all components.

---

## 🚀 Next Steps

These components are ready to be used throughout the application. Start replacing existing implementations with these standardized components for:

1. Better user experience
2. Consistent design language
3. Reduced code duplication
4. Improved accessibility
5. Better mobile responsiveness

---

**Created:** Phase 1 - Design System Enhancement  
**Version:** 1.0  
**Last Updated:** November 2024