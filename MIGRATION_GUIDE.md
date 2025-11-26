# Migration Guide - UI/UX Improvements

## 🔄 Quick Migration Steps

This guide helps you migrate existing components to use the new UI/UX improvements.

---

## 1. Migrating Tables to ResponsiveTable

### Step 1: Update Import
```jsx
// Before
import { DataTable } from '../components/shared';

// After
import { ResponsiveTable } from '../components/shared';
```

### Step 2: Update Column Configuration
```jsx
// Before
const columns = [
  { header: 'Job Title', accessor: 'title' },
  { header: 'Company', accessor: 'company' },
  { header: 'Salary', accessor: 'salary' }
];

// After
const columns = [
  {
    key: 'title',
    label: 'Job Title',
    primary: true, // Shows as card header on mobile
    render: (value, row) => (
      <span className="font-semibold">{value}</span>
    )
  },
  {
    key: 'company',
    label: 'Company'
  },
  {
    key: 'salary',
    label: 'Salary',
    render: (value) => `$${value.toLocaleString()}`
  }
];
```

### Step 3: Update Component
```jsx
// Before
<DataTable
  columns={columns}
  data={jobs}
  onRowClick={handleRowClick}
/>

// After
<ResponsiveTable
  columns={columns}
  data={jobs}
  onRowClick={handleRowClick}
  actions={(row) => [
    {
      label: 'Edit',
      icon: FiEdit,
      onClick: () => handleEdit(row.id)
    },
    {
      label: 'Delete',
      icon: FiTrash2,
      variant: 'danger',
      onClick: () => handleDelete(row.id)
    }
  ]}
  keyField="id"
  loading={isLoading}
  emptyMessage="No jobs found"
/>
```

---

## 2. Migrating Delete Confirmations

### Before (window.confirm)
```jsx
const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this item?')) {
    try {
      await api.deleteItem(id);
      toast.success('Item deleted');
      refreshList();
    } catch (error) {
      toast.error('Failed to delete');
    }
  }
};
```

### After (ConfirmationModal with Undo)
```jsx
import { DeleteConfirmationModal } from '../components/shared';
import useUndo from '../hooks/useUndo';

const MyComponent = () => {
  const [itemToDelete, setItemToDelete] = useState(null);
  const { executeWithUndo } = useUndo();

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
  };

  const handleDeleteConfirm = async () => {
    const item = itemToDelete;
    setItemToDelete(null);

    executeWithUndo({
      action: async () => {
        await api.deleteItem(item.id);
        refreshList();
      },
      message: `${item.name} deleted`,
      onUndo: async () => {
        await api.restoreItem(item.id);
        refreshList();
      },
      undoMessage: `${item.name} restored`
    });
  };

  return (
    <>
      <button onClick={() => handleDeleteClick(item)}>
        Delete
      </button>

      <DeleteConfirmationModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        itemName={itemToDelete?.name}
        itemType="job posting"
      />
    </>
  );
};
```

---

## 3. Migrating Toast Notifications

### Before
```jsx
import { toast } from 'react-toastify';

// All toasts auto-close
toast.error('Something went wrong');
toast.success('Saved successfully');
```

### After
```jsx
import { toast } from '../utils/toast';

// Errors persist until dismissed
toast.error('Payment failed. Please check your card details.');

// Non-critical errors auto-close
toast.errorAutoClose('Network connection is slow');

// Success auto-closes (same as before)
toast.success('Saved successfully');

// With undo action
toast.undo('Application deleted', () => restoreApplication());

// With retry action
toast.withAction('Failed to save', () => retrySave(), 'Retry');

// Promise-based
toast.promise(
  saveData(),
  {
    pending: 'Saving...',
    success: 'Saved!',
    error: 'Failed to save'
  }
);
```

---

## 4. Migrating Filters to Mobile-Friendly Pattern

### Before (Desktop Only)
```jsx
const BrowseJobs = () => {
  return (
    <div>
      <EnhancedFilterBar
        filters={filters}
        onFilterChange={setFilters}
      />
      <JobList jobs={filteredJobs} />
    </div>
  );
};
```

### After (Responsive)
```jsx
import { EnhancedFilterBar, FilterBottomSheet } from '../components/shared';
import { FiFilter } from 'react-icons/fi';

const BrowseJobs = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const activeFilterCount = Object.keys(filters).filter(k => filters[k]).length;

  return (
    <div>
      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="w-full min-h-[48px] px-4 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold flex items-center justify-center gap-2 touch-manipulation"
        >
          <FiFilter className="w-5 h-5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block mb-6">
        <EnhancedFilterBar
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={() => {
          applyFilters(filters);
        }}
        onReset={() => {
          setFilters({});
        }}
        activeFilters={activeFilterCount}
      >
        {/* Same filter inputs as desktop */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full min-h-[48px] px-4 py-3 border border-gray-300 rounded-xl touch-manipulation"
            >
              <option value="">All Categories</option>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile Development</option>
            </select>
          </div>

          {/* More filter inputs... */}
        </div>
      </FilterBottomSheet>

      {/* Job List */}
      <ResponsiveTable
        columns={columns}
        data={filteredJobs}
      />
    </div>
  );
};
```

---

## 5. Adding Success Animations

### Before (Just Toast)
```jsx
const handleSubmit = async () => {
  try {
    await api.submitApplication(data);
    toast.success('Application submitted!');
    navigate('/applications');
  } catch (error) {
    toast.error('Failed to submit');
  }
};
```

### After (With Animation)
```jsx
import { SuccessAnimation } from '../components/shared';

const MyComponent = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    try {
      await api.submitApplication(data);
      setShowSuccess(true);
      // Navigation happens in onComplete
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>

      <SuccessAnimation
        show={showSuccess}
        message="Application Submitted!"
        description="The employer will review your application soon."
        showConfetti={true}
        size="lg"
        variant="success"
        onComplete={() => {
          setShowSuccess(false);
          navigate('/applications');
        }}
      />
    </>
  );
};
```

---

## 6. Fixing Touch Target Sizes

### Before (Too Small)
```jsx
<button className="px-2 py-1 text-sm">
  Delete
</button>

<a href="/profile" className="text-primary-600">
  View Profile
</a>

<div className="flex gap-1">
  <button className="p-1">
    <FiEdit className="w-4 h-4" />
  </button>
  <button className="p-1">
    <FiTrash className="w-4 h-4" />
  </button>
</div>
```

### After (44x44px Minimum)
```jsx
<button className="min-h-[44px] px-4 py-2 text-sm touch-manipulation">
  Delete
</button>

<a
  href="/profile"
  className="inline-flex items-center min-h-[44px] text-primary-600 touch-manipulation"
>
  View Profile
</a>

<div className="flex gap-2">
  <button className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors touch-manipulation">
    <FiEdit className="w-5 h-5" />
  </button>
  <button className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-red-50 text-red-600 transition-colors touch-manipulation">
    <FiTrash className="w-5 h-5" />
  </button>
</div>
```

---

## 7. Adding Swipe Gestures to Lists

### Before (No Swipe)
```jsx
<div className="divide-y divide-gray-200">
  {items.map((item) => (
    <div key={item.id} className="p-4 flex items-center justify-between">
      <div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => handleArchive(item.id)}>Archive</button>
        <button onClick={() => handleDelete(item.id)}>Delete</button>
      </div>
    </div>
  ))}
</div>
```

### After (With Swipe)
```jsx
import { SwipeableItem, SwipeableList } from '../components/shared';
import { FiArchive, FiTrash2 } from 'react-icons/fi';

<SwipeableList>
  {items.map((item) => (
    <SwipeableItem
      key={item.id}
      leftActions={[
        {
          label: 'Archive',
          icon: FiArchive,
          color: 'bg-blue-500',
          onClick: () => handleArchive(item.id)
        }
      ]}
      rightActions={[
        {
          label: 'Delete',
          icon: FiTrash2,
          color: 'bg-red-500',
          onClick: () => handleDelete(item.id)
        }
      ]}
    >
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-gray-900">{item.title}</h3>
        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
      </div>
    </SwipeableItem>
  ))}
</SwipeableList>
```

---

## 8. Common Migration Patterns

### Pattern 1: List with Delete
```jsx
// Before
{items.map(item => (
  <div key={item.id}>
    <span>{item.name}</span>
    <button onClick={() => { if(confirm('Delete?')) deleteItem(item.id) }}>
      Delete
    </button>
  </div>
))}

// After
import { DeleteConfirmationModal } from '../components/shared';
import useUndo from '../hooks/useUndo';

const [itemToDelete, setItemToDelete] = useState(null);
const { executeWithUndo } = useUndo();

{items.map(item => (
  <div key={item.id}>
    <span>{item.name}</span>
    <button onClick={() => setItemToDelete(item)}>Delete</button>
  </div>
))}

<DeleteConfirmationModal
  isOpen={itemToDelete !== null}
  onClose={() => setItemToDelete(null)}
  onConfirm={() => {
    executeWithUndo({
      action: () => api.delete(itemToDelete.id),
      onUndo: () => api.restore(itemToDelete.id),
      message: 'Item deleted'
    });
    setItemToDelete(null);
  }}
  itemName={itemToDelete?.name}
/>
```

### Pattern 2: Form with Success
```jsx
// Before
const handleSubmit = async (data) => {
  await api.save(data);
  toast.success('Saved!');
  onClose();
};

// After
const [showSuccess, setShowSuccess] = useState(false);

const handleSubmit = async (data) => {
  await api.save(data);
  setShowSuccess(true);
};

<SuccessAnimation
  show={showSuccess}
  message="Saved Successfully!"
  onComplete={onClose}
/>
```

### Pattern 3: Table with Actions
```jsx
// Before
<table>
  {/* Complex table markup */}
</table>

// After
<ResponsiveTable
  columns={columns}
  data={data}
  actions={(row) => [
    { label: 'Edit', icon: FiEdit, onClick: () => edit(row) },
    { label: 'Delete', icon: FiTrash2, variant: 'danger', onClick: () => del(row) }
  ]}
/>
```

---

## 🎯 Migration Checklist

Use this checklist for each page/component:

### Data Display
- [ ] Replace `<table>` with `<ResponsiveTable>`
- [ ] Replace `<DataTable>` with `<ResponsiveTable>`
- [ ] Add `primary: true` to main column
- [ ] Configure mobile card layout

### Confirmations
- [ ] Replace `window.confirm()` with `<ConfirmationModal>`
- [ ] Add consequences array
- [ ] Show undo option when appropriate
- [ ] Add loading states

### Undo
- [ ] Import `useUndo` hook
- [ ] Wrap delete actions with `executeWithUndo`
- [ ] Implement restore/undo logic
- [ ] Test undo within 5-second window

### Toasts
- [ ] Replace `toast.error()` with persistent version for critical errors
- [ ] Use `toast.undo()` for undoable actions
- [ ] Use `toast.withAction()` for retry scenarios
- [ ] Keep success toasts as auto-close

### Success Animations
- [ ] Add `<SuccessAnimation>` for critical success flows
- [ ] Add confetti for major achievements
- [ ] Use inline checks for minor successes

### Mobile
- [ ] Add mobile filter button with bottom sheet
- [ ] Keep desktop filters inline
- [ ] Test filter bottom sheet on mobile
- [ ] Verify table converts to cards on mobile

### Touch Targets
- [ ] Audit all buttons for 44x44px minimum
- [ ] Fix icon-only buttons
- [ ] Add adequate spacing between touch targets
- [ ] Add `touch-manipulation` class

### Swipe Gestures
- [ ] Add swipe to lists where appropriate
- [ ] Configure left/right actions
- [ ] Test swipe gestures on mobile device

---

## 🐛 Common Issues & Solutions

### Issue: Bottom Sheet Not Showing
**Solution:** Ensure parent doesn't have `overflow: hidden` and z-index is clear

### Issue: Swipe Not Working
**Solution:** Check parent's `touch-action` CSS property

### Issue: Undo Not Triggering
**Solution:** Verify `onUndo` callback is async and returns a promise

### Issue: Touch Targets Still Small
**Solution:** Use dev tools to measure, add `min-w-[44px] min-h-[44px]`

### Issue: Table Not Converting on Mobile
**Solution:** Check responsive breakpoint `md:` (768px)

---

## 📊 Before & After Metrics

### Code Quality
- **Before:** Inconsistent patterns across pages
- **After:** Unified component system

### Mobile UX
- **Before:** Poor mobile experience, horizontal scrolling
- **After:** Native-feeling mobile UI with gestures

### Accessibility
- **Before:** Many touch targets < 44px
- **After:** All targets ≥ 44x44px (WCAG AA compliant)

### User Feedback
- **Before:** Basic confirm dialogs, no undo
- **After:** Rich modals, 5-second undo, persistent errors

---

## 🎓 Best Practices

1. **Always show consequences** for destructive actions
2. **Provide undo** for recoverable actions
3. **Use persistent errors** for critical issues
4. **Test on real devices** not just emulators
5. **Measure touch targets** with browser dev tools
6. **Keep mobile in mind** from the start

---

## ✅ Migration Complete Checklist

- [ ] All tables migrated to ResponsiveTable
- [ ] All window.confirm() replaced with ConfirmationModal
- [ ] Delete actions have undo functionality
- [ ] Critical errors use persistent toasts
- [ ] Success flows have animations
- [ ] Filters work on mobile with bottom sheet
- [ ] All touch targets are ≥ 44x44px
- [ ] Swipe gestures added where appropriate
- [ ] Tested on mobile devices
- [ ] Accessibility verified

---

**Need help? Check the [Implementation Guide](UI_UX_IMPLEMENTATION_GUIDE.md) for detailed examples!**
