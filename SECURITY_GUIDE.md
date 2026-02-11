# Security Guide

This document outlines the security measures implemented in your application and additional steps you need to take.

## ✅ Completed Security Measures

### 1. Firebase Configuration Security
- **FIXED**: Moved Firebase API keys from source code to environment variables
- **Location**: All Firebase credentials are now in `.env` file
- **Impact**: API keys are no longer exposed in your source code or version control

### 2. Firestore Security Rules
- **Status**: Already implemented
- **Location**: `firestore.rules`
- **Coverage**:
  - Authentication required for all data access
  - Users can only update their own profiles and comments
  - Team collaboration enabled for clients and requests
  - Activity logs are immutable (cannot be modified or deleted)
  - Comments and cost tracker entries can only be modified by their creators

### 3. Input Validation Utilities
- **Status**: Created
- **Location**: `src/utils/security.ts`
- **Features**:
  - Email validation
  - Phone number validation
  - URL validation
  - Password strength validation
  - XSS protection (HTML sanitization)
  - Input sanitization
  - Rate limiting helper

## 🚨 Critical Actions Required

### 1. Enable Firebase App Check (REQUIRED)
Firebase App Check protects your backend from abuse by ensuring requests come from your authentic app.

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `job-tracker-6df94`
3. Navigate to **Build** → **App Check**
4. Click **Get Started**
5. Register your web app with reCAPTCHA v3:
   - Get a reCAPTCHA v3 site key from [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
   - Add the site key to Firebase App Check
6. Enable enforcement for Firestore
7. Add to your code (in `src/lib/firebase.ts`):

```typescript
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// After initializing Firebase app
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true
});
```

### 2. Test Firestore Security Rules (REQUIRED)
Your security rules need to be tested to ensure they work correctly.

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Firestore Database** → **Rules**
3. Click on **Rules Playground**
4. Test these scenarios:
   - ✅ Authenticated user can read their own profile
   - ❌ Authenticated user cannot read another user's private data
   - ❌ Unauthenticated user cannot access any data
   - ✅ Authenticated user can create a request
   - ✅ Authenticated user can update their own comment
   - ❌ Authenticated user cannot update another user's comment

### 3. Add .env to .gitignore (CRITICAL)
Ensure your environment variables are never committed to version control.

**Action**: Verify `.env` is in your `.gitignore` file. It should be there by default, but double-check!

### 4. Set Up Production Environment Variables
When deploying to production, you'll need to set environment variables in your hosting platform.

**Required Variables**:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

## 📋 Recommended Security Enhancements

### 1. Implement Rate Limiting for Authentication
Add rate limiting to prevent brute force attacks on login.

**Example** (in `src/components/Auth/Login.tsx`):
```typescript
import { rateLimiter } from '../../utils/security';

// In your login handler:
if (!rateLimiter.isAllowed(email, 5, 15 * 60 * 1000)) {
  setError('Too many login attempts. Please try again in 15 minutes.');
  return;
}
```

### 2. Add Input Validation
Use the validation utilities before submitting data to Firebase.

**Example**:
```typescript
import { isValidEmail, sanitizeInput } from '../../utils/security';

// Before creating a client:
if (!isValidEmail(email)) {
  setError('Invalid email address');
  return;
}
const sanitizedName = sanitizeInput(name);
```

### 3. Enable Multi-Factor Authentication (MFA)
Consider enabling MFA for admin accounts or all users.

**Steps**:
1. Go to Firebase Console → Authentication → Settings
2. Enable **Multi-factor authentication**
3. Implement MFA enrollment flow in your app

### 4. Set Up Security Monitoring
Monitor your Firebase project for suspicious activity.

**Steps**:
1. Go to Firebase Console → **App Check** → **Metrics**
2. Monitor for unusual patterns
3. Set up alerts for security events

### 5. Regular Security Audits
Schedule regular security reviews:
- Review Firestore security rules quarterly
- Update dependencies monthly (`npm audit`)
- Review user access patterns
- Check for unused accounts or permissions

## 🔒 Best Practices

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Consider requiring special characters

### Data Validation
- Always validate on both client and server (Firestore rules)
- Sanitize user input to prevent XSS
- Validate file uploads (if implemented)
- Use TypeScript for type safety

### Authentication
- Use HTTPS only (enforced by Firebase)
- Implement session timeout
- Clear sensitive data on logout
- Use secure password reset flow

### Error Handling
- Never expose sensitive information in error messages
- Log security events for audit trails
- Implement proper error boundaries

## 📚 Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [OWASP Top 10 Web Application Security Risks](https://owasp.org/www-project-top-ten/)
- [Firebase Security Best Practices](https://firebase.google.com/support/guides/security-checklist)

## 🆘 Need Help?

If you encounter security issues or need assistance:
1. Review the [Firebase Security Documentation](https://firebase.google.com/docs/rules)
2. Test your rules in the Firebase Console Rules Playground
3. Use the security utilities provided in `src/utils/security.ts`
4. Monitor Firebase Console for security alerts

## 📝 Security Checklist

- [x] Move Firebase config to environment variables
- [x] Implement Firestore security rules
- [x] Create input validation utilities
- [ ] Enable Firebase App Check
- [ ] Test security rules in Firebase Console
- [ ] Verify .env is in .gitignore
- [ ] Set up production environment variables
- [ ] Implement rate limiting for authentication
- [ ] Add input validation to forms
- [ ] Enable Multi-Factor Authentication (optional)
- [ ] Set up security monitoring
- [ ] Schedule regular security audits

---

**Last Updated**: February 11, 2026
**Security Status**: ⚠️ Action Required (Firebase App Check not enabled)
