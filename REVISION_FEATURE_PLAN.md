# Revision Functionality Implementation Plan

This document outlines the changes required to implement a revision workflow where companies can request changes to a worker's submission, including setting a new deadline and attaching reference documents.

## 1. Backend: Database Models

### Update `Job` Model
*   **Status Enum**: Add `'revision-requested'` to the `status` enum.

### Update `Submission` Model
*   **`revisionHistory`**: Add an array field to store previous versions. Each entry should contain:
    *   `files` (Array of objects: `{ fileName, fileUrl, fileType }`)
    *   `description` (String)
    *   `submittedAt` (Date)
    *   `feedback` (String - the feedback that triggered this revision)
    *   `revisionDeadline` (Date - the deadline set for this specific revision)
    *   `attachments` (Array - documents attached by the company for this revision request)
*   **`revisionDeadline`**: Add a `Date` field to track the specific due date for the current revision.
*   **`revisionFeedback`**: Add a `String` field for the current feedback.
*   **`revisionAttachments`**: Add an array field to store documents attached by the company when requesting the revision (e.g., annotated screenshots, requirement docs).
    *   Structure: `[{ fileName: String, fileUrl: String, fileType: String }]`
*   **`status`**: Ensure the enum includes `'revision-requested'`.

## 2. Backend: API Endpoints & Logic

### New Company Endpoint: `requestRevision`
*   **Route**: `PUT /api/companies/jobs/:jobId/revision`
*   **Inputs**:
    *   `feedback` (String)
    *   `newDeadline` (Date)
    *   `attachments` (Array of files) - *New requirement*
*   **Logic**:
    1.  Validate the job status (must be `'submitted'`).
    2.  Upload any provided attachments to storage (e.g., Cloudinary/S3).
    3.  Update the `Submission` document:
        *   Set `status` to `'revision-requested'`.
        *   Save `feedback`, `newDeadline`, and `revisionAttachments`.
    4.  Update the `Job` document:
        *   Set `status` to `'revision-requested'`.
    5.  (Optional) Create a notification for the worker.

### Update Worker Endpoint: `submitWork`
*   **Route**: `POST /api/workers/submit/:jobId` (Existing)
*   **Logic**: Modify to handle re-submissions.
    1.  Check if a submission already exists.
    2.  If it exists:
        *   Move the current submission data (`files`, `description`, `submittedAt`) plus the *previous* revision request data (`feedback`, `revisionDeadline`, `revisionAttachments`) into the `revisionHistory` array.
        *   Increment `revisionCount`.
    3.  Update the main fields with the new work (`description`, `files`).
    4.  Set `status` back to `'submitted'`.
    5.  Clear `revisionFeedback`, `revisionDeadline`, and `revisionAttachments` from the top level (since they are now history).
    6.  Update Job status to `'submitted'`.

## 3. Frontend: User Interface

### For Companies (Client)
*   **Submission Review Page**:
    *   Add a **"Request Revision"** button next to "Approve/Complete".
*   **Request Revision Modal**:
    *   **Feedback Text Area**: For explaining changes.
    *   **Date Picker**: For setting the `newDeadline`.
    *   **File Upload**: Allow the company to attach documents (images, PDFs, docs) to clarify their feedback.

### For Workers
*   **Job Details Page**:
    *   **Revision Alert**: If status is `'revision-requested'`, show a prominent alert containing:
        *   **Client's Feedback**.
        *   **New Deadline**.
        *   **Attached Documents**: List of files uploaded by the company with download/view links.
    *   **Resubmission Form**:
        *   Allow re-uploading work files.
        *   Update description.
        *   Change submit button text to **"Submit Revision"**.

### Revision History (Shared)
*   Add a **"Revision History"** section/tab in the Job Details view for both parties.
*   Display a timeline of:
    *   Original Submission (Date, Files).
    *   Revision Request 1 (Feedback, Attachments, Deadline).
    *   Revision Submission 1 (Date, Files).
    *   etc.
