# Company Review Button Fix

## Issue Summary
Company couldn't see the review button for approved submissions even though they had submitted a review. The review button was not appearing because the `hasReview` field was not being calculated correctly.

## Root Cause
The backend was checking if a review exists BUT was not filtering by `reviewedBy: 'company'`. This means if the worker reviewed the company first, the system would mark `hasReview = true` for the submission, hiding the company's review button even though the company hadn't reviewed the worker yet.

## The Flow

### Expected Behavior
1. Company approves and completes a submission → Job Status: `'completed'`, Submission Status: `'approved'`
2. Backend checks if company has reviewed the worker → `hasReview = false` (if no review)
3. Frontend shows review button (⭐ icon) on approved submissions where `hasReview === false`
4. Company clicks review button → Opens ReviewModal
5. Company submits review → `hasReview = true`
6. Review button disappears (company has already reviewed)

### Actual Behavior (Before Fix)
1. Company approves submission → Status: `'approved'`
2. Worker reviews company first → Creates a review with `reviewedBy: 'worker'`
3. Backend checks if ANY review exists for this job/worker combination → Finds worker's review
4. Backend sets `hasReview = true` (WRONG!)
5. Frontend hides review button (thinks company already reviewed)
6. Company can't find the review button ❌

## Files Modified

### 1. `server/controllers/company/submissionController.js`

**Location**: Line 37-42

**Issue**: `hasReview` flag was incorrectly set to `true` when worker reviewed company

**Before**:
```javascript
reviewExists = await Review.findOne({
    job: submission.job._id,
    worker: submission.worker._id,
    company: req.user._id,
});
```

**After**:
```javascript
reviewExists = await Review.findOne({
    job: submission.job._id,
    worker: submission.worker._id,
    company: req.user._id,
    reviewedBy: 'company'  // ✅ Only check for company's review
});
```

**Why This Matters**:
- `reviewedBy: 'company'` ensures we only check if the **company** has reviewed the **worker**
- Worker's reviews of the company have `reviewedBy: 'worker'` and should NOT affect this check
- This prevents false positives where worker reviews incorrectly hide the company's review button

### 2. `server/controllers/company/reviewController.js`

**Location**: Line 95-99

**Issue**: Duplicate review check was blocking companies from reviewing when worker had already reviewed

**Before**:
```javascript
// Check if review already exists
const existingReview = await Review.findOne({
    job: jobId,
    worker: req.params.workerId,
});
```

**After**:
```javascript
// Check if review already exists (only check for company's review of worker)
const existingReview = await Review.findOne({
    job: jobId,
    worker: req.params.workerId,
    reviewedBy: 'company'  // ✅ Only check for company's review
});
```

**Why This Matters**:
- Prevents the error "Review already submitted for this job" when it was actually the worker who submitted a review
- Allows both company and worker to submit their independent reviews
- Each party can only submit one review of their type (company reviewing worker, worker reviewing company)

## UI Components Involved

### `client/src/pages/company/Submissions.jsx`

The review button is shown on line 303:
```javascript
{submission.status === 'approved' && !submission.hasReview && (
    <button
        onClick={(e) => {
            e.stopPropagation();
            handleOpenReviewModal(submission);
        }}
        className="p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
        title="Leave a Review"
    >
        <FiStar className="w-5 h-5" />
    </button>
)}
```

**Conditions for showing review button**:
1. ✅ `submission.status === 'approved'` (job is completed and approved)
2. ✅ `!submission.hasReview` (company hasn't reviewed the worker yet)

## Review System Architecture

### Review Model Structure
```javascript
{
    job: ObjectId,          // The job being reviewed
    worker: ObjectId,       // The worker (always the worker)
    company: ObjectId,      // The company (always the company)
    rating: Number,         // 1-5 stars
    reviewText: String,
    reviewedBy: String,     // 'company' or 'worker' ⭐
    // ... other fields
}
```

### Two Types of Reviews
1. **Company Reviews Worker** → `reviewedBy: 'company'`
   - Company rates worker's performance
   - Affects worker's average rating
   - Shown on worker's profile

2. **Worker Reviews Company** → `reviewedBy: 'worker'`
   - Worker rates company experience
   - Affects company's average rating
   - Shown on company's profile

### Important: Reviews are SEPARATE
- A company reviewing a worker does NOT prevent the worker from reviewing the company
- Each review is independent and tracked by the `reviewedBy` field
- The `hasReview` check must filter by `reviewedBy` to avoid conflicts

## Testing Steps

### Test Case 1: Normal Flow (Company Reviews First)
1. ✅ Company completes/approves a submission
2. ✅ Review button (⭐) appears on submission card
3. ✅ Company clicks review button → Modal opens
4. ✅ Company submits review
5. ✅ Review button disappears (`hasReview = true`)

### Test Case 2: Worker Reviews First (Previously Broken)
1. ✅ Company completes/approves a submission
2. ✅ Worker reviews company first (creates review with `reviewedBy: 'worker'`)
3. ✅ Company's review button STILL appears (now fixed!)
4. ✅ Company can submit their review
5. ✅ Both reviews exist independently

### Test Case 3: View Existing Review
1. ✅ Company has already reviewed worker
2. ✅ Review button does NOT appear
3. ✅ Company can view their submitted review in the Reviews page

## Related Fixes
This fix is related to the earlier review system fixes where we added `reviewedBy` filters to:
- `company/reviewController.js` - Rating calculation
- `worker/reviewController.js` - Rating calculation  
- `worker/profileController.js` - Review fetching
- `worker/dashboardController.js` - Recent reviews

All these fixes ensure that company and worker reviews are kept separate and don't interfere with each other.

## Status
✅ **Fixed** - Companies can now see and use the review button for approved submissions, regardless of whether the worker has reviewed the company.
