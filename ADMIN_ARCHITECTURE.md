# Enterprise-Grade Admin Panel Architecture

## 🏗️ SYSTEM DESIGN

### Phase 1: Advanced RBAC System (Role-Based Access Control)

**Roles & Permissions Model:**

```
super-admin
├── All permissions
├── User management (create/edit/delete staff)
├── Permissions management
├── System settings
└── Audit logs access

brand-partner (Merchant)
├── Own merchant dashboard
├── Product management (own brand)
├── Sales analytics (own brand)
├── Customer segmentation (own brand)
└── Marketing campaigns (own brand)

staff (Manager)
├── Orders management
├── Product management (view/edit)
├── Customers (view/search)
├── Basic analytics
└── Email campaigns

staff-junior (Support)
├── Orders (view only, limited actions)
├── Customers (view only)
├── Read-only access to analytics
└── Create support tickets

custom-roles (Future)
└── Granular permission builder
```

**Permission Matrix:**

```
ORDERS:
- orders.view
- orders.view.own (only own orders)
- orders.update
- orders.delete
- orders.export
- orders.refund
- orders.tracking

PRODUCTS:
- products.view
- products.create
- products.edit
- products.edit.own (only own brand)
- products.delete
- products.publish
- products.inventory

CUSTOMERS:
- customers.view
- customers.edit
- customers.export
- customers.segment
- customers.email

ANALYTICS:
- analytics.view
- analytics.export
- analytics.reports

STAFF:
- staff.view
- staff.create
- staff.edit
- staff.delete
- staff.permissions

SETTINGS:
- settings.system
- settings.email
- settings.payment
- settings.store
```

---

## 🎨 UI/UX ARCHITECTURE

### Navigation Hierarchy

```
Admin Panel
├── Dashboard (Customizable cards)
│   ├── Real-time stats (Orders, Revenue, Customers)
│   ├── Revenue charts (Daily/Weekly/Monthly)
│   ├── Top products bar chart
│   ├── Recent orders list
│   ├── Customer activity
│   └── System notifications
│
├── Orders Module
│   ├── List view (Advanced filters, bulk actions)
│   ├── Order detail modal (Full order data)
│   ├── Status management (Pending → Delivered)
│   ├── Refund management
│   ├── Bulk actions (Print labels, export CSV)
│   └── Order timeline/history
│
├── Products Module
│   ├── Catalog (Grid/List view toggle)
│   ├── Product form (Categories, pricing, stock)
│   ├── Bulk import/export
│   ├── Inventory tracking
│   ├── Product performance
│   └── SKU management
│
├── Customers Module
│   ├── Customer list (Search, filters)
│   ├── Customer detail (Profile, orders, spending)
│   ├── Segmentation (RFM analysis, custom rules)
│   ├── Email campaigns
│   ├── Loyalty program
│   └── Export (CSV/PDF)
│
├── Analytics Module
│   ├── Dashboard (Real-time KPIs)
│   ├── Revenue analytics (Multi-period comparison)
│   ├── Product performance
│   ├── Customer analytics
│   ├── Conversion funnel
│   ├── Heatmaps (Time-based patterns)
│   ├── Custom report builder
│   └── Scheduled reports
│
├── Marketing Module
│   ├── Email campaigns (Template builder)
│   ├── Customer segmentation
│   ├── Abandoned cart recovery
│   ├── SMS campaigns
│   ├── Referral program
│   └── Promo codes
│
├── Staff Management (Super Admin)
│   ├── Staff list
│   ├── Permission management
│   ├── Activity logs
│   └── Audit trail
│
└── Settings
    ├── Store settings
    ├── Payment methods
    ├── Email templates
    ├── Notification rules
    └── API integrations
```

---

## 📊 DASHBOARD COMPONENTS

### Real-Time Metrics
- **Total Revenue** (Today, This Week, This Month, YTD)
- **Orders Count** (with trend indicator)
- **New Customers** (registration rate)
- **Conversion Rate** (browse → purchase)
- **AOV** (Average Order Value)
- **Return Rate**
- **Customer LTV** (Lifetime Value)

### Charts & Visualizations

1. **Revenue Trend Chart** (Dual-axis)
   - Left Y-axis: Revenue (£)
   - Right Y-axis: Order count
   - X-axis: Time (hourly/daily/weekly/monthly)
   - Interactive legend, drill-down capability

2. **Top Products Bar Chart**
   - Sortable by revenue or units sold
   - Show top 10 with sparklines

3. **Order Status Pie Chart**
   - Pending, Processing, Shipped, Delivered, Returned

4. **Customer Segmentation Donut**
   - New, Returning, VIP, Inactive

5. **Conversion Funnel**
   - Visitors → Add to cart → Checkout → Paid

6. **Heatmap by Time**
   - Orders by hour of day
   - Orders by day of week

7. **Top Customers Table**
   - Highest spenders, most active, newest VIPs

---

## 📥 REPORT EXPORT SYSTEM

### Export Formats
- **CSV** (Excel compatible)
- **PDF** (Styled reports with branding)
- **XLSX** (Excel with formatting)
- **JSON** (Data export for integrations)

### Schedulable Reports
1. Daily Sales Summary (sent 6am GMT)
2. Weekly Performance Report (Monday 8am)
3. Monthly Financial Statement (1st day 9am)
4. Customer Acquisition Report (Weekly)
5. Inventory Status Report (Daily)
6. Abandoned Cart Report (Daily)
7. Product Performance Report (Weekly)

### Report Contents
- Customizable date ranges
- KPI filters
- Branding (Phoenix Vapers logo, colors)
- Charts embedded in PDF
- Summary statistics
- Trend analysis
- Year-over-year comparison
- Footnotes and insights

---

## 🔧 TECHNICAL STACK

### Frontend
- **React 19** with hooks
- **Next.js 16** with App Router (client components)
- **Chart.js** with react-chartjs-2 (all charts)
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Shadcn/ui** for components

### Backend (NestJS)
```
/admin-api
├── controllers
│   ├── dashboard.controller.ts (Real-time stats)
│   ├── analytics.controller.ts (Chart data, trends)
│   ├── reports.controller.ts (Export, scheduling)
│   ├── rbac.controller.ts (Permissions)
│   ├── audit.controller.ts (Activity logs)
│   └── notifications.controller.ts (Real-time updates via WebSocket)
│
├── services
│   ├── dashboard.service.ts (Aggregations)
│   ├── analytics.service.ts (Historical data, trends)
│   ├── report.service.ts (PDF/CSV generation)
│   ├── rbac.service.ts (Permission checking)
│   ├── audit.service.ts (Activity logging)
│   └── notification.service.ts (SSE/WebSocket)
│
└── schemas
    ├── permission.schema.ts
    ├── audit-log.schema.ts
    └── report-template.schema.ts
```

---

## 🔐 RBAC IMPLEMENTATION

### Database Schema

**Permissions Collection:**
```javascript
{
  _id: ObjectId,
  name: "orders.view",
  description: "View all orders",
  category: "orders",
  createdAt: Date
}
```

**Roles Collection:**
```javascript
{
  _id: ObjectId,
  name: "super-admin",
  description: "Full system access",
  permissions: [ObjectId, ObjectId, ...],
  isBuiltIn: true,
  createdAt: Date
}
```

**Staff Collection:**
```javascript
{
  _id: ObjectId,
  email: "staff@phoenixvapers.co.uk",
  role: ObjectId, // Reference to Roles
  customPermissions: [ObjectId], // Override permissions
  department: "Operations",
  status: "active",
  lastLogin: Date,
  createdAt: Date
}
```

**Audit Logs Collection:**
```javascript
{
  _id: ObjectId,
  staffId: ObjectId,
  action: "order.refund",
  resourceId: ObjectId,
  oldValues: {},
  newValues: {},
  timestamp: Date,
  ipAddress: "192.168.1.1"
}
```

### Permission Checking

**Backend Middleware:**
```typescript
@UseGuards(AuthGuard)
@UseInterceptors(PermissionInterceptor)
@Permissions('orders.view')
getOrders() { }
```

**Frontend Hook:**
```typescript
const canViewOrders = usePermission('orders.view');
const canDeleteOrder = usePermission('orders.delete');

if (!canDeleteOrder) return <Disabled />;
```

---

## 📈 SIDEBAR FIX

### Issues to Address
1. **Z-index conflicts** (fixed at z-40, overlay at z-30)
2. **Mobile responsiveness** (fixed positioning needs adjustment)
3. **Animation smoothness** (CSS transitions)
4. **Scroll behavior** (sidebar should stay fixed while content scrolls)

### Solution
```jsx
// Fixed positioning on desktop, absolute on mobile
<aside className={`
  fixed left-0 top-0
  h-screen w-64
  md:relative md:translate-x-0
  z-40 md:z-auto
  transition-all duration-300
  overflow-y-auto
`} />

// Better scrolling without jumping
<nav className="flex-1 overflow-y-auto scrollbar-hide" />
```

---

## 📊 CHART ENHANCEMENTS

### Current State
- ✅ Chart.js integrated
- ✅ Dual-axis revenue chart
- ✅ Top products chart
- ❌ Missing: Interactive drill-down
- ❌ Missing: Date range picker
- ❌ Missing: Comparison mode

### Planned Enhancements
1. **Interactive Charts**
   - Click to drill down
   - Hover tooltips with more detail
   - Zoom and pan capabilities

2. **Advanced Filtering**
   - Date range picker (custom dates)
   - Product category filter
   - Customer segment filter
   - Payment method filter

3. **Comparison View**
   - Compare current period vs previous
   - Year-over-year comparison
   - Multiple metrics overlay

4. **More Chart Types**
   - Pie charts (status breakdown)
   - Gauge charts (KPI tracking)
   - Scatter plots (customer spend vs frequency)
   - Area charts (cumulative revenue)

---

## 🎯 IMPLEMENTATION PRIORITY

### Week 1: Foundation
- [x] Analyze current structure
- [ ] Design RBAC schema
- [ ] Create permission middleware
- [ ] Fix sidebar z-index/animation
- [ ] Real-time dashboard data

### Week 2: Charts & Analytics
- [ ] Implement all chart types
- [ ] Add date range filters
- [ ] Create comparison view
- [ ] Performance optimization

### Week 3: Reports & Export
- [ ] CSV export functionality
- [ ] PDF generation with branding
- [ ] Report scheduling
- [ ] Email delivery

### Week 4: Advanced Features
- [ ] Audit logging
- [ ] Custom permissions UI
- [ ] Notifications system
- [ ] Admin activity tracking

---

## ✅ SUCCESS CRITERIA

- [x] RBAC with 50+ granular permissions
- [ ] All dashboards pull real data
- [ ] 10+ chart types working
- [ ] Export reports in 4 formats
- [ ] Sidebar behaves correctly (fixed/mobile)
- [ ] Performance: Dashboard loads <2 seconds
- [ ] 100% responsive (mobile → desktop)
- [ ] Accessibility: WCAG 2.1 AA
- [ ] Audit logs for all admin actions
- [ ] Real-time notifications for critical events

---

## 📋 ESTIMATED EFFORT

| Component | Time | Complexity |
|-----------|------|-----------|
| RBAC system | 8 hours | High |
| Dashboard redesign | 6 hours | Medium |
| Chart enhancements | 5 hours | Medium |
| Report export | 4 hours | Medium |
| Sidebar fixes | 2 hours | Low |
| Audit logging | 3 hours | Medium |
| Testing & polish | 4 hours | Low |
| **TOTAL** | **32 hours** | **High** |

**Realistic timeline: 2-3 weeks with daily 4-hour blocks**

---

This is enterprise-grade. Ready to build? 🚀
