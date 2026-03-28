# Quick Demo Guide - Testing All Features

**Estimated Time**: 10-15 minutes  
**Prerequisites**: Backend running on port 5000

## Demo Scenario: New Customer Journey

### ✅ Test 1: Customer Registration & First Booking  
**Time**: ~3 minutes

```
1. Open: file:///C:/Users/hp/SBS%202/frontend/index.html
2. Click "Register" in navbar
3. Fill form:
   - Username: democustomer
   - Email: demo@example.com
   - Password: Demo123
   - Confirm: Demo123
   - Role: customer
4. Click "Register" → Should redirect to customer-dashboard
5. Verify navbar shows "democustomer" + logout button
```

### ✅ Test 2: Book a Route
**Time**: ~2 minutes

```
1. On customer-dashboard, fill booking form:
   - Route: Select "Nairobi to Mombasa"
   - Seats: 3
2. Click "Book Now"
3. Should see: "✅ Booking created successfully!"
4. Form resets, booking appears in "Your Bookings" section
5. Shows: Nairobi → Mombasa | Seats: 3 | Total: KES 4500 | Status: pending
```

### ✅ Test 3: Logout
**Time**: ~1 minute

```
1. Click "Logout" button in any dashboard navbar
2. Redirects to index.html
3. Navbar shows "Login" and "Register" again
4. No user info displayed
```

### ✅ Test 4: Login as Logged-Out User
**Time**: ~2 minutes

```
1. Click "Login" in navbar
2. Enter credentials:
   - Username: democustomer
   - Password: Demo123
3. Click "Login"
4. Should redirect to customer-dashboard
5. Verify booking still appears in history
```

---

## Demo Scenario 2: Admin Overview

**Time**: ~3 minutes

```
1. Go to login.html
2. Login as admin:
   - Username: admin_user
   - Password: AdminPass123
3. Redirects to admin-dashboard
4. Click "Users" tab → See all registered users
5. Click "Routes" tab → See all routes with delete buttons
6. Click "Bookings" tab → See all bookings on platform
```

---

## Demo Scenario 3: Provider Route Management

**Time**: ~3 minutes

```
1. Go to login.html
2. Login as provider:
   - Username: provider_user
   - Password: ProviderPass123
3. Redirects to provider-dashboard
4. Fill route form:
   - Start: Mombasa
   - End: Diani
   - Price: 1200
5. Click "Add Route" → "✅ Route created successfully!"
6. New route appears in "My Routes" section
7. Click "Delete" to remove a route
8. View "Bookings for My Routes" section (empty initially)
```

---

## Demo Scenario 4: Route Search

**Time**: ~2 minutes

```
1. Go to index.html home page
2. In "Available Routes" section, fill search:
   - From: "Nairobi"
   - To: (leave empty)
   - Max Price: (leave empty)
3. Click "Search" → Shows only Nairobi routes
4. Clear "From" field, enter:
   - From: (leave empty)  
   - To: "Mombasa"
   - Max Price: 1500
5. Click "Search" → Shows Mombasa routes under 1500 KES
```

---

## Demo Scenario 5: Role-Based Access Control

**Time**: ~2 minutes

```
1. Logout (or use incognito browser)
2. Try to access directly:
   file:///C:/Users/hp/SBS%202/frontend/admin-dashboard.html
   → Redirects to index (not admin)
3. Try customer-dashboard.html
   → Redirects to index (not logged in)
4. Try provider-dashboard.html
   → Redirects to index (not logged in)
5. Login as customer, try admin-dashboard.html
   → Redirects to index (wrong role)
```

---

## Quick Test Checklist

- [ ] Register new customer
- [ ] Booking form appears after login
- [ ] Book a route successfully
- [ ] Booking appears in history
- [ ] Total price calculated correctly (price × seats)
- [ ] Logout clears auth
- [ ] Login restores booking history
- [ ] Admin sees all users/routes/bookings
- [ ] Provider can create routes
- [ ] Provider can delete routes
- [ ] Route search filters work
- [ ] Unauthorized access redirects to index

---

## What Each Feature Shows

| Feature | Demonstrates | Files |
|---------|--------------|-------|
| Registration | JWT generation + role assignment | login.js, backend auth |
| Redirect by role | Client-side role checks | authUtils.js |
| Bookings | Protected API endpoint + auth | script.js, backend |
| Admin tabs | Dynamic content switching | admin-dashboard.js |
| Provider CRUD | Route management + token auth | provider-dashboard.js |
| Search | Client-side filtering | script.js filterRoutes() |
| Logout | Token cleanup | authUtils.js logout() |

---

## Expected Error Messages

These should appear appropriately:

```
❌ Errors shown:
- "Please select a route" (if no route selected)
- "Please enter a valid number of seats (1-10)" (invalid seats)
- "Please login to book a route" (no token)
- "Are you sure?" (before deleting route)  
- "Route deleted successfully" (after delete)
- "Error loading routes" (if API fails)

✅ Success messages shown:
- "✅ Booking created successfully!"
- "✅ Route created successfully!"
- "✅ Route deleted successfully!"
```

---

## Performance Notes

- Route search: Instant (client-side, no API call)
- Bookings load: <1 second (with token)
- Route creation: <2 seconds
- Dashboard tabs: Instant switch
- Admin view: <2 seconds per tab

---

## Browser DevTools Verification

Open DevTools (F12) Console to verify:

```javascript
// Check token storage
console.log(localStorage.getItem('salama-token')); // Should show JWT

// Check user storage
console.log(JSON.parse(localStorage.getItem('salama-user'))); 
// Should show: {id, username, role}

// Check network requests
// Should see Authorization: Bearer <token> headers
```

---

**Ready to test?** Start with Demo Scenario 1 for the complete happy path! 🚀
