# 🔄 Registration → Verify Email Redirect Test

## ✅ Current Implementation

### 1. **Registration Flow** (`/auth/register`)
```typescript
// In authActions.ts - handleRegister function
const res = await registerUser(data).unwrap();
console.log('Registration successful, redirecting to verify-email...');
toast.success("Registration successful! Please verify your email.");

// Auto-redirect to verify-email page with email parameter
router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
```

### 2. **Verify Email Page** (`/auth/verify-email`)
```typescript
// Gets email from URL parameter
const email = searchParams.get("email") || "";
console.log('Verify email page loaded with email:', email);

// If no email, redirect back to register
if (!email) {
  console.log('No email found, redirecting to register');
  router.push("/auth/register");
  return;
}
```

## 🧪 Testing Steps

### Step 1: Open Registration Page
1. Go to `/auth/register`
2. Fill the form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "123456"
   - Role: "Marketing Officer" (sr)

### Step 2: Submit Registration
1. Click "Register" button
2. **Expected behavior:**
   - Console shows: "Registration successful, redirecting to verify-email..."
   - Toast message: "Registration successful! Please verify your email."
   - **Auto-redirect** to `/auth/verify-email?email=test@example.com`

### Step 3: Verify Email Page Loads
1. **Expected behavior:**
   - Console shows: "Verify email page loaded with email: test@example.com"
   - Page displays email: "test@example.com"
   - OTP input fields are visible
   - 60-second countdown starts

## 🔍 Debug Checklist

### If redirect is NOT working:

1. **Check Console Logs:**
   ```
   ✅ "Registration successful, redirecting to verify-email..."
   ✅ "Verify email page loaded with email: test@example.com"
   ```

2. **Check Network Tab:**
   - Registration API call successful (201 status)
   - No JavaScript errors

3. **Check URL:**
   - Should change from `/auth/register` to `/auth/verify-email?email=test@example.com`

4. **Check Router:**
   - Next.js router is working properly
   - No conflicting redirects

## 🚨 Common Issues & Solutions

### Issue 1: Registration API fails
**Solution:** Check backend is running and API endpoint is correct

### Issue 2: Router.push not working
**Solution:** Ensure `useRouter` from `next/navigation` is imported correctly

### Issue 3: Email parameter not passed
**Solution:** Check `encodeURIComponent(data.email)` is working

### Issue 4: Verify page redirects back to register
**Solution:** Email parameter is not being received properly

## ✅ Expected Complete Flow

```
1. User fills registration form
   ↓
2. Clicks "Register" button
   ↓
3. API call to backend (creates user + sends OTP)
   ↓
4. Success response received
   ↓
5. Toast notification shown
   ↓
6. Auto-redirect to /auth/verify-email?email=user@example.com
   ↓
7. Verify email page loads with email pre-filled
   ↓
8. User enters OTP and verifies
   ↓
9. Auto-redirect to /auth/login
```

## 🎯 Current Status

- ✅ Registration form working
- ✅ Auto-redirect implemented
- ✅ Email parameter passing
- ✅ Verify email page receiving email
- ✅ Console logs for debugging
- ✅ Error handling

**The flow should work automatically after registration!** 🚀