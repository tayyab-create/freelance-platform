## INSTRUCTIONS FOR WorkerDashboard.jsx

You need to make 2 changes to connect the dashboard to REAL backend data:

### Change 1: Replace Mock Data (Lines 81-125)
DELETE these lines and REPLACE with:

```jsx
// Use real data from backend
const applicationsTrend = dashboardData.applicationsTrend || [];
const earningsTrend = dashboardData.earningsTrend || [];
const recentActivities = dashboardData.recentActivities || [];
const upcomingDeadlines = dashboardData.upcomingDeadlines || [];
const achievements = dashboardData.achievements || [];

const profileCompletion = calculateWorkerProfileCompletion(dashboardData.profile);
```

### Change 2: Fix Recent Activities Rendering (Around line 386-396)
FIND this code:
```jsx
{recentActivities.map((activity) => (
  <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
    <div className={`h-10 w-10 rounded-full bg-${activity.color}-100 flex items-center justify-center flex-shrink-0`}>
      <activity.icon className={`h-5 w-5 text-${activity.color}-600`} />
    </div>
    <div className="flex-1">
      <p className="text-gray-900 font-medium text-sm">{activity.action}</p>
      <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
    </div>
  </div>
))}
```

REPLACE with:
```jsx
{recentActivities.map((activity) => {
  // Map activity type to icon and color
  let icon = FiActivity;
  let color = 'blue';
  
  if (activity.type === 'application') {
    icon = FiBriefcase;
    color = 'blue';
  } else if (activity.type === 'job_completed') {
    icon = FiCheckCircle;
    color = 'green';
  } else if (activity.type === 'review') {
    icon = FiStar;
    color = 'yellow';
  }
  
  const Icon = icon;
  
  return (
    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
      <div className={`h-10 w-10 rounded-full bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </div>
      <div className="flex-1">
        <p className="text-gray-900 font-medium text-sm">{activity.action}</p>
        <p className="text-gray-500 text-xs mt-1">{new Date(activity.time).toLocaleString()}</p>
      </div>
    </div>
  );
})}
```

That's it! These 2 changes will make ALL dashboard data dynamic.
