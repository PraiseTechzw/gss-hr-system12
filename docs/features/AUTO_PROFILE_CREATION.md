# Auto Profile Creation Feature

## Overview

The GSS HR & Payroll Management System now includes automatic profile creation functionality. When a user logs in through Supabase Auth but doesn't have a corresponding record in the `user_profiles` table, the system will automatically create one with default values.

## How It Works

### 1. Login Process
1. User attempts to log in with valid Supabase Auth credentials
2. Middleware checks if user exists in `user_profiles` table
3. If user doesn't exist, the system automatically creates a profile
4. User is granted access to the system with default permissions

### 2. Default Profile Values
When a profile is automatically created, the following default values are used:

- **Role**: `hr` (HR Staff)
- **Department**: `General`
- **Position**: `HR Staff`
- **Status**: `active`
- **Name**: Extracted from user metadata or email prefix

### 3. Name Extraction Logic
The system attempts to extract user names in this order:
1. From Supabase Auth user metadata (`first_name`, `last_name`, `full_name`)
2. From email prefix (part before @) for first name
3. Default "User" for last name if not available

## Database Changes

### New Function: `ensure_user_profile_exists`
\`\`\`sql
CREATE OR REPLACE FUNCTION ensure_user_profile_exists(user_id uuid, user_email text)
RETURNS boolean
\`\`\`

This function:
- Checks if a user profile already exists
- Creates a new profile with default values if missing
- Logs the creation activity in `system_activity` table
- Handles errors gracefully without failing the login

### Middleware Updates
The middleware (`lib/supabase/middleware.ts`) now:
- Calls the auto-creation function when a user is missing from `user_profiles`
- Provides appropriate error messages for different failure scenarios
- Maintains security while enabling automatic profile creation

### Login Client Updates
The login client (`components/auth/login-client.tsx`) now:
- Displays appropriate error messages for profile creation failures
- Handles different error scenarios gracefully
- Provides user-friendly feedback

## Installation

### For New Installations
The auto profile creation functionality is included in the main schema file:
\`\`\`sql
\i scripts/000_complete_hr_system.sql
\`\`\`

### For Existing Installations
Run the migration script to add the functionality:
\`\`\`sql
\i scripts/007_add_auto_profile_creation.sql
\`\`\`

### Testing
Verify the functionality works correctly:
\`\`\`sql
\i scripts/008_test_auto_profile_creation.sql
\`\`\`

## Security Considerations

### 1. Default Permissions
- Auto-created users get `hr` role by default
- This provides basic access but not admin privileges
- Admins can later promote users to higher roles as needed

### 2. Audit Trail
- All auto-created profiles are logged in `system_activity`
- Failed creation attempts are also logged
- Provides complete audit trail for security

### 3. Error Handling
- Profile creation failures don't block login
- Users get appropriate error messages
- System maintains security even if auto-creation fails

## User Experience

### Successful Auto-Creation
1. User logs in with valid credentials
2. System automatically creates profile
3. User is redirected to dashboard
4. No additional steps required

### Failed Auto-Creation
1. User logs in with valid credentials
2. Profile creation fails
3. User sees helpful error message
4. User can try again or contact support

## Configuration

### Default Values
You can modify the default values in the `ensure_user_profile_exists` function:

\`\`\`sql
-- Change default role
'hr', -- Default role

-- Change default department
'General', -- Default department

-- Change default position
'HR Staff', -- Default position
\`\`\`

### Customization
The function can be customized to:
- Use different default roles based on email domain
- Set different departments based on user metadata
- Apply custom business logic for profile creation

## Monitoring

### System Activity Logs
Monitor auto-creation activity:
\`\`\`sql
SELECT * FROM system_activity 
WHERE action IN ('profile_auto_created', 'profile_creation_failed')
ORDER BY created_at DESC;
\`\`\`

### Profile Statistics
Track profile creation:
\`\`\`sql
SELECT 
    role,
    COUNT(*) as count,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM user_profiles 
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY role;
\`\`\`

## Troubleshooting

### Common Issues

1. **Function Not Found**
   - Ensure the migration script was run
   - Check function exists: `SELECT * FROM pg_proc WHERE proname = 'ensure_user_profile_exists'`

2. **Permission Denied**
   - Verify authenticated users have execute permission
   - Check RLS policies allow profile creation

3. **Profile Creation Fails**
   - Check system_activity logs for error details
   - Verify user_profiles table structure
   - Ensure all required fields have defaults

### Debug Steps

1. Check function exists and is callable
2. Verify RLS policies allow profile creation
3. Test with a known user ID and email
4. Check system_activity logs for detailed error messages

## Benefits

1. **Seamless User Experience**: Users can log in immediately without manual profile creation
2. **Reduced Admin Overhead**: No need to manually create profiles for every user
3. **Security Maintained**: Default permissions are conservative
4. **Audit Trail**: Complete logging of all profile creation activities
5. **Error Resilience**: System continues to work even if auto-creation fails

## Future Enhancements

Potential improvements:
1. **Role-based Defaults**: Different default roles based on email domain
2. **Department Assignment**: Auto-assign departments based on user metadata
3. **Notification System**: Notify admins when profiles are auto-created
4. **Bulk Operations**: Tools for managing auto-created profiles
5. **Custom Rules**: Business logic for profile creation based on company policies
