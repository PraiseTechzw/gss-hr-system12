# Quick Admin Account Reset

## Option 1: Use the API Endpoint (Recommended)

Open your browser and visit this URL while your dev server is running:

```
http://localhost:3000/api/admin/init-admin
```

Or use this debug endpoint:
```
http://localhost:3000/api/debug/simple-create-admin
```

Both will create/reset an admin account with:
- **Email:** `admin@geniussecurity.co.zw`
- **Password:** `admin123`

## Option 2: Check Your Database

Go to your Supabase dashboard → SQL Editor and run:

```sql
SELECT email, role, status, created_at 
FROM user_profiles 
ORDER BY created_at DESC;
```

This will show you all users and their emails.

## Option 3: Try All Possible Passwords

Based on the scripts, try these combinations:

1. **Email:** `admin@gss.com` **Password:** `password`
2. **Email:** `admin@gss.com` **Password:** `admin123`
3. **Email:** `admin@geniussecurity.co.zw` **Password:** `admin123`
4. **Email:** `admin@geniussecurity.co.zw` **Password:** `password`

## Option 4: Reset Password via SQL

If you know the email, you can reset the password in Supabase SQL Editor:

```sql
-- Update password for admin@geniussecurity.co.zw to 'admin123'
UPDATE user_profiles 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@geniussecurity.co.zw';

-- Or for admin@gss.com
UPDATE user_profiles 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@gss.com';
```

This sets the password to `admin123` for either email.

