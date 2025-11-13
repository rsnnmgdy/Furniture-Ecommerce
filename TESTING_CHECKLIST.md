# ✅ TESTING CHECKLIST - ADMIN PANEL

## 🧪 Frontend Testing

### 1. Reviews Page (/admin/reviews)
- [ ] Page loads successfully
- [ ] All reviews display in table
- [ ] Statistics cards show correct counts
- [ ] Can filter by rating (1-5 stars)
- [ ] Can filter by product dropdown
- [ ] Clear filters button works
- [ ] Click expand button shows review details
- [ ] Can click delete button
- [ ] Delete confirmation dialog appears
- [ ] Confirming delete removes review
- [ ] Toast notification shows success/error
- [ ] Pagination works with 10 items per page

### 2. Dashboard (/admin/dashboard)
- [ ] Page loads with stats cards
- [ ] 4 stat cards display: Products, Users, Orders, Revenue
- [ ] Today's stats alert boxes show
- [ ] Year selector dropdown works
- [ ] Changing year updates charts
- [ ] Line chart shows monthly sales data
- [ ] Pie chart shows category breakdown
- [ ] Bar chart shows revenue data
- [ ] All months show even if no data
- [ ] Recent orders table displays
- [ ] Low stock products list shows

### 3. Orders Page (/admin/orders)
- [ ] Page loads all orders
- [ ] 4 summary cards show: Total, Pending, Shipped, Revenue
- [ ] Status filter dropdown works
- [ ] Filtering by status updates table
- [ ] Click expand arrow shows order details
- [ ] Order timeline displays (Pending→Processing→Shipped→Delivered)
- [ ] Order items breakdown shows quantities and prices
- [ ] Shipping address displays correctly
- [ ] Totals calculation is correct
- [ ] Tracking number shows when present
- [ ] Print invoice button generates PDF
- [ ] Resend email button works
- [ ] Update status button opens dialog
- [ ] Status update sends email
- [ ] Pagination works

### 4. Users Page (/admin/users)
- [ ] Page loads all users
- [ ] 4 stat cards show: Total, Admins, Blocked, Regular Users
- [ ] Role filter shows users by role
- [ ] Click expand shows user details
- [ ] Contact information displays
- [ ] Account details display
- [ ] View Orders button shows order history
- [ ] Order history dialog displays orders
- [ ] More menu (3 dots) opens dropdown
- [ ] Make User/Make Admin works
- [ ] Block user works (user status changes)
- [ ] Unblock user works
- [ ] Reset password dialog opens
- [ ] Reset password saves new password
- [ ] User is blocked/active status reflects

### 5. Navigation
- [ ] Admin sidebar shows all 5 pages
- [ ] Each menu item highlights when active
- [ ] Clicking menu items navigates correctly
- [ ] Mobile hamburger menu appears on small screens
- [ ] Mobile menu closes after clicking item
- [ ] Icons are visible and appropriate

---

## 🔌 API Testing

### Admin Endpoints

#### GET /admin/dashboard
```bash
curl http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```
Expected: `{ success: true, stats: {...}, recentOrders: [...], ... }`

#### GET /admin/sales?year=2025
```bash
curl http://localhost:5000/api/admin/sales?year=2025 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
Expected: `{ success: true, salesByMonth: [...], categorySales: [...] }`

#### GET /admin/users?limit=100
```bash
curl http://localhost:5000/api/admin/users?limit=100 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
Expected: `{ success: true, users: [...], total: X, ... }`

#### PUT /admin/users/:id/role
```bash
curl -X PUT http://localhost:5000/api/admin/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'
```
Expected: `{ success: true, user: {...} }`

#### PUT /admin/users/:id/block
```bash
curl -X PUT http://localhost:5000/api/admin/users/USER_ID/block \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isBlocked":true}'
```
Expected: `{ success: true, user: {...} }`

#### PUT /admin/users/:id/password
```bash
curl -X PUT http://localhost:5000/api/admin/users/USER_ID/password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"newpassword123"}'
```
Expected: `{ success: true, message: "Password reset successfully" }`

#### GET /admin/users/:id/orders
```bash
curl http://localhost:5000/api/admin/users/USER_ID/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```
Expected: `{ success: true, orders: [...] }`

#### GET /admin/reviews?rating=5&product=PRODUCT_ID
```bash
curl http://localhost:5000/api/admin/reviews?rating=5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
Expected: `{ success: true, reviews: [...], total: X }`

#### POST /orders/:id/resend-email
```bash
curl -X POST http://localhost:5000/api/orders/ORDER_ID/resend-email \
  -H "Authorization: Bearer YOUR_TOKEN"
```
Expected: `{ success: true, message: "Email sent successfully" }`

---

## 🔐 Security Testing

- [ ] Non-admin user cannot access /admin/* routes
- [ ] Non-admin cannot call admin API endpoints
- [ ] Invalid token returns 401 error
- [ ] Expired token returns 401 error
- [ ] Admin endpoints require authorization header
- [ ] Password reset requires valid input
- [ ] Block user requires admin role

---

## 📱 Responsive Testing

### Desktop (1920x1080)
- [ ] Sidebar displays on left
- [ ] Content takes full remaining width
- [ ] All elements properly spaced
- [ ] Charts display correctly

### Tablet (768x1024)
- [ ] Sidebar visible but maybe collapsed
- [ ] Content adjusts properly
- [ ] Tables scroll horizontally if needed
- [ ] Mobile menu not visible

### Mobile (375x667)
- [ ] Hamburger menu appears
- [ ] Sidebar slides in/out
- [ ] Content takes full width
- [ ] All buttons touch-friendly
- [ ] Tables scroll horizontally

---

## 🎨 UI/UX Testing

- [ ] All colors display correctly
- [ ] Fonts are readable
- [ ] Icons appear correctly
- [ ] Buttons are clickable
- [ ] Hover effects work on desktop
- [ ] Active states show current page
- [ ] Loading spinners appear during data fetch
- [ ] Toast notifications appear for actions
- [ ] Dialogs have proper backdrop
- [ ] Forms have validation messages

---

## ⚡ Performance Testing

- [ ] Dashboard loads in <2 seconds
- [ ] Charts render smoothly
- [ ] Tables paginate smoothly
- [ ] Filters work without lag
- [ ] No console errors
- [ ] No console warnings (except expected ones)
- [ ] Images load quickly
- [ ] API responses are fast (<500ms)

---

## 🔄 Integration Testing

### Reviews Workflow
1. [ ] Create review as user
2. [ ] View review in admin panel
3. [ ] Filter by rating shows it
4. [ ] Filter by product shows it
5. [ ] Delete review works
6. [ ] Review no longer appears

### Order Workflow
1. [ ] Create order as user
2. [ ] View in admin orders
3. [ ] Update status to Processing
4. [ ] Email sent to customer
5. [ ] Status changed in UI
6. [ ] Update to Shipped
7. [ ] Add tracking number
8. [ ] Email sent with tracking
9. [ ] View timeline shows progression
10. [ ] Print invoice generates PDF
11. [ ] Resend email sends confirmation

### User Workflow
1. [ ] Create new user
2. [ ] View in admin users
3. [ ] View their orders
4. [ ] Block user
5. [ ] User cannot login
6. [ ] Unblock user
7. [ ] User can login again
8. [ ] Change user to admin
9. [ ] Admin can access admin panel
10. [ ] Reset password works
11. [ ] New password required on next login

---

## 🐛 Bug Testing

- [ ] No errors when deleting
- [ ] No errors when updating
- [ ] No errors when filtering
- [ ] No errors when paginating
- [ ] No infinite loops
- [ ] No memory leaks
- [ ] Forms validate properly
- [ ] Required fields show error
- [ ] Invalid data is rejected

---

## 📊 Data Validation

- [ ] Numbers display with correct decimals
- [ ] Dates format correctly
- [ ] Currency shows $ symbol
- [ ] Status values are correct
- [ ] Role values are correct (admin/user)
- [ ] Empty values show "N/A" or "-"
- [ ] Long text truncates properly

---

## ✅ Final Checklist

**Before Deployment:**
- [ ] All tests pass
- [ ] No console errors
- [ ] All features work
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Data validation working
- [ ] Error handling in place
- [ ] Notifications display
- [ ] API endpoints secured

**Production Readiness:**
- [ ] Database backed up
- [ ] API production URL configured
- [ ] Email service configured
- [ ] PDF generation working
- [ ] Images hosted on Cloudinary
- [ ] Error logging enabled
- [ ] Monitoring enabled

---

## 🎯 Expected Results

After all tests pass, you should have:
- ✅ Fully functional admin panel
- ✅ All CRUD operations working
- ✅ Advanced filtering on all pages
- ✅ Real-time updates
- ✅ Professional UI
- ✅ Mobile responsive
- ✅ Secure and validated
- ✅ Production-ready
- ✅ **50+ points earned** 🚀

---

## 📝 Test Report Template

```
Test Date: ___________
Tester: ___________
Status: [ ] Pass [ ] Fail

Features Tested:
- Dashboard:     [ ] Pass [ ] Fail
- Products:      [ ] Pass [ ] Fail
- Orders:        [ ] Pass [ ] Fail
- Reviews:       [ ] Pass [ ] Fail
- Users:         [ ] Pass [ ] Fail
- Navigation:    [ ] Pass [ ] Fail
- API:           [ ] Pass [ ] Fail
- Security:      [ ] Pass [ ] Fail
- Responsive:    [ ] Pass [ ] Fail

Issues Found:
1. ___________
2. ___________

Notes:
___________

Approved By: ___________
```

---

**Good luck with testing! Everything should work smoothly!** 🚀
