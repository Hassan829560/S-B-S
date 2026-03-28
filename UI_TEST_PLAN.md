# Complete User Journey Testing Guide

**Date**: March 27, 2026  
**System**: Salama Booking System  
**Status**: UI Testing in Progress  

## Test Execution Steps

### Phase 1: Initial State (No Login)

**Expected**:
- [x] index.html loaded
- [x] Navigation shows "Login" and "Register" links
- [x] Admin/Customer/Provider dashboard links hidden
- [x] "Your Bookings" section shows login prompt
- [x] Available routes displayed
- [x] Booking form visible but requires auth

**Verify in Browser**:
1. Reload `file:///C:/Users/hp/SBS%202/frontend/index.html`
2. Check navbar - should show: "Login", "Register"
3. Should NOT see: Admin, Customer Dashboard, Provider Dashboard
4. Booking form at bottom should be visible

---

### Phase 2: User Registration

**Test Case**: TC-1 Register New User

**Precondition**: On index.html, user not logged in

**Steps**:
1. Click "Register" link in navbar
2. Fill form:
   - Username: `testuser001`
   - Email: `testuser001@example.com`
   - Password: `TestPass123`
   - Confirm Password: `TestPass123`
   - Role: Select "customer"
3. Click "Register" button

**Expected**:
- ✅ Backend accepts registration (we tested this - user created successfully)
- ✅ JWT token returned and stored in localStorage
- ✅ Redirect to customer-dashboard.html

**Verify**:
```javascript
// Open browser developer console (F12) and run:
console.log(localStorage.getItem('salama-token')); // Should show JWT
console.log(localStorage.getItem('salama-user'));  // Should show user object
```

---

### Phase 3: Role-Based Dashboard Access

**Test Case**: TC-2 Customer Dashboard Access

**Precondition**: Registered as customer in Phase 2

**Steps**:
1. Should automatically redirect to [customer-dashboard.html](customer-dashboard.html)
2. Verify navbar shows:
   - Username (e.g., "testuser001")
   - "Home" link
   - "My Bookings" link
   - "Logout" button

**Expected**:
- ✅ Customer-specific dashboard loads
- ✅ Logout button present
- ✅ User info displayed in navbar

**Verify Protection**:
3. Open another tab and try: `file:///C:/Users/hp/SBS%202/frontend/admin-dashboard.html`
4. Should redirect to index.html (no access)
5. Try: `file:///C:/Users/hp/SBS%202/frontend/provider-dashboard.html`
6. Should redirect to index.html (no access)

---

### Phase 4: Create Booking from Index

**Test Case**: TC-3 Booking Creation Flow

**Precondition**: Customer logged in

**Steps**:
1. Go back to index.html
2. Find "Book a Route" section
3. Select "Nairobi to Mombasa" from dropdown
4. Enter "2" in "Number of Seats"
5. Click "Book Now" button

**Expected**:
- ✅ Success alert appears
- ✅ Booking created in database (we tested this - works perfectly)
- ✅ Booking appears in "Your Bookings" section
- ✅ Shows:
  - Route: "Nairobi to Mombasa"
  - Seats: 2
  - Status: "pending"

**Verify in Console**:
```javascript
const bookings = JSON.parse(localStorage.getItem('salama-bookings') || '[]');
console.log(bookings.length); // Should show at least 1
```

---

### Phase 5: View Bookings on Customer Dashboard

**Test Case**: TC-4 Booking History

**Precondition**: At least 1 booking created in Phase 4

**Steps**:
1. Navigate to customer-dashboard.html (click "Customer Dashboard" in navbar or direct link)
2. View "Your Bookings" section

**Expected**:
- ✅ Booking from Phase 4 displayed
- ✅ Shows route, seats, status
- ✅ Format: "Nairobi to Mombasa - 2 seats - Pending"

---

### Phase 6: Logout Flow

**Test Case**: TC-5 Logout Clears Auth State

**Precondition**: Customer logged in from Phase 2

**Steps**:
1. Click "Logout" button in navbar
2. Confirm action (if prompted)

**Expected**:
- ✅ localStorage cleared (token & user removed)
- ✅ Page redirects to index.html
- ✅ Navbar reverts to show "Login" and "Register"
- ✅ "Your Bookings" shows login prompt again

**Verify in Console** (After logout):
```javascript
console.log(localStorage.getItem('salama-token'));  // Should be null
console.log(localStorage.getItem('salama-user'));   // Should be null
```

---

### Phase 7: Test Role-Based Access Control

**Test Case**: TC-6 RBAC Protection

**Current State**: Logged out

**Steps**:
1. Try to access admin-dashboard.html directly: `file:///C:/Users/hp/SBS%202/frontend/admin-dashboard.html`
2. Should redirect to index.html
3. Try customer-dashboard.html: `file:///C:/Users/hp/SBS%202/frontend/customer-dashboard.html`
4. Should redirect to index.html

**Expected**:
- ✅ All protected dashboards redirect to index.html when no token
- ✅ Prevents unauthorized access

---

### Phase 8: Test Login (Try Failed First)

**Test Case**: TC-7 Login Validation

**Precondition**: On login.html

**Steps**:
1. Enter invalid username/password
2. Attempt login

**Expected**:
- ✅ Error message shown
- ✅ Remain on login.html

**Steps**:
3. Enter correct credentials from Phase 2:
   - Username: `testuser001`
   - Password: `TestPass123`
4. Click "Login"

**Expected**:
- ✅ Token stored in localStorage
- ✅ Redirect to customer-dashboard.html
- ✅ Navbar shows username

---

### Phase 9: Test Admin User

**Test Case**: TC-8 Admin Role Access

**Precondition**: No setup required yet

**Steps**:
1. Register as admin:
   - Username: `adminuser`
   - Email: `admin@example.com`
   - Password: `AdminPass123`
   - Role: `admin`
2. Should redirect to admin-dashboard.html (if implemented)
3. Try to access customer-dashboard.html
4. Should redirect (no permission)

**Expected**:
- ✅ Admin users blocked from customer resources
- ✅ Permission-based navigation working

---

### Phase 10: Test Provider User

**Test Case**: TC-9 Provider Role Access

**Precondition**: Register provider user

**Steps**:
1. Register as provider:
   - Username: `provideruser`
   - Email: `provider@example.com`
   - Password: `ProviderPass123`
   - Role: `provider`
2. Should redirect to provider-dashboard.html
3. View "My Routes" section (test API integration next)

**Expected**:
- ✅ Provider dashboard loads
- ✅ Route management forms visible
- ✅ Cannot access customer/admin dashboards

---

## Summary of Files Tested

| File | Status | Notes |
|------|--------|-------|
| frontend/index.html | ✅ Working | Tailwind UI, role-aware navbar, booking form |
| frontend/login.html | ✅ Ready | Link visible, will test in Phase 8 |
| frontend/register.html | ✅ Ready | Will test in Phase 2 |
| frontend/admin-dashboard.html | ✅ Protected | Requires requireRole('admin') |
| frontend/customer-dashboard.html | ✅ Protected | Requires requireRole('customer') |
| frontend/provider-dashboard.html | ✅ Protected | Requires requireRole('provider') |
| frontend/authUtils.js | ✅ Active | Role checks, token management |
| backend/server.js | ✅ Running | Port 5000, all routes active |
| backend/routes/authRoutes.js | ✅ Tested | Register/login working |
| backend/routes/bookingRoutes.js | ✅ Tested | Booking creation successful |

---

## Expected Results Summary

After completing all phases:

✅ **Authentication Flow**
- Register creates user with role
- Login returns valid JWT
- Token stored securely in localStorage
- Token included in API requests

✅ **Authorization Flow**
- Users can only access their role's dashboard
- Attempting unauthorized access redirects to index
- Logout clears all auth data

✅ **Booking Flow**
- Customers can book routes
- Bookings stored with seat info
- Booking list displays correctly
- Payment status shows "pending"

✅ **UI/UX**
- Navbar updates dynamically based on auth state
- Role-based menu visibility working
- Logout button functional
- Forms validate input

✅ **Security**
- Passwords hashed (bcrypt)
- JWTs verified server-side
- Protected routes enforce authentication
- Bearer token pattern implemented

---

## Notes for Next Phase

If all tests pass, next priorities:
1. Dashboard functionality (admin view users/routes, provider manage routes)
2. Route search and filtering
3. Payment integration
4. Email notifications
