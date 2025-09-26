# Profile Pictures Feature

## Overview
Profile pictures are now stored in MySQL database and persist after logout/login.

## Database Changes
- Added `profile_picture` TEXT column to `users` table
- Stores the file path (e.g., `/uploads/profile_1234567890_abc123.jpg`)

## Backend Changes
- Added multer for file upload handling
- New endpoint: `POST /api/users/:id/profile-picture` for uploading
- Updated login endpoint to return `profile_picture`
- Updated user endpoints to include `profile_picture`
- Files stored in `Backend/uploads/` directory
- Automatic cleanup of old profile pictures when new ones are uploaded

## Frontend Changes
- Updated `UserSettings.jsx` to use new upload endpoint
- Updated `loggedInUserHeader.jsx` to prioritize database-stored pictures
- Profile pictures now persist in localStorage and across sessions

## File Upload Limits
- Maximum file size: 2MB
- Supported formats: JPEG, PNG
- Files are renamed with timestamp and random string for uniqueness

## API Endpoints

### Upload Profile Picture
```
POST /api/users/:id/profile-picture
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: FormData with 'profilePicture' file field
```

### Get User (includes profile picture)
```
GET /api/users/:id
Authorization: Bearer <token>

Response includes: profile_picture field
```

## Testing
Run `node test_complete_setup.js` to verify the setup is working correctly.

## Usage
1. Login to your account
2. Go to Settings page
3. Upload a profile picture (JPEG/PNG, max 2MB)
4. Save changes
5. Logout and login again - your picture will still be there!