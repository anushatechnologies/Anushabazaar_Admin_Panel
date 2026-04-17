import {
  Dashboard,
  Payment,
  Store,
  Storefront,
  Category,
  Inventory2,
  Policy,
  Settings,
  Notifications,
  People,
  Description,
  AdminPanelSettings,
  Leaderboard,
} from '@mui/icons-material';

import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CampaignIcon from '@mui/icons-material/Campaign';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MapIcon from '@mui/icons-material/Map';
import AssignmentIcon from '@mui/icons-material/Assignment';

export interface RouteLinkItem {
  name: string;
  path: string;
  Icon: any;
  roles?: string[];
}

export interface RouteLinkGroup {
  section: string;
  links: RouteLinkItem[];
}

export const ADMIN_PANEL_ROLES = ['ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'];
export const SUPER_ADMIN_ROLES = ['ROLE_SUPER_ADMIN'];

export const RouteLinks: RouteLinkGroup[] = [
  // ---------------- DASHBOARD ----------------
  {
    section: 'Dashboard',
    links: [
      { name: 'Dashboard', path: '/', Icon: Dashboard, roles: ADMIN_PANEL_ROLES },
      {
        name: 'Product Performance',
        path: '/dashboard/product-performance',
        Icon: Leaderboard,
        roles: ADMIN_PANEL_ROLES,
      },
    ],
  },

  // ---------------- ORDERS ----------------
  {
    section: 'Orders',
    links: [
      {
        name: 'My Orders',
        path: '/my-orders',
        Icon: Inventory2,
        roles: ['CUSTOMER', 'USER', 'ROLE_USER'],
      },
      {
        name: 'Manage Orders',
        path: '/admin/orders',
        Icon: Inventory2,
        roles: ADMIN_PANEL_ROLES,
      },
    ],
  },

  // ---------------- GOODS (Catalog) ----------------
  {
    section: 'Goods',
    links: [
      { name: 'Category', path: '/categories', Icon: Category, roles: ADMIN_PANEL_ROLES },
      { name: 'SubCategory', path: '/subcategories', Icon: Category, roles: ADMIN_PANEL_ROLES },
      { name: 'Product', path: '/products', Icon: Inventory2, roles: ADMIN_PANEL_ROLES },
    ],
  },

  // ---------------- PAYMENTS ----------------
  {
    section: 'Payments',
    links: [
      {
        name: 'Payments & Income',
        path: '/admin/income',
        Icon: AttachMoneyIcon,
        roles: ADMIN_PANEL_ROLES,
      },
      { name: 'COD', path: '/payments/cod', Icon: LocalAtmIcon, roles: ADMIN_PANEL_ROLES },
    ],
  },

  // ---------------- STORE ----------------
  {
    section: 'Store',
    links: [
      { name: 'Store List', path: '/store-type', Icon: Store, roles: ADMIN_PANEL_ROLES },
      {
        name: 'Store Dashboard',
        path: '/store-dashboard',
        Icon: Storefront,
        roles: ADMIN_PANEL_ROLES,
      },
    ],
  },

  // ---------------- DELIVERY ----------------
  {
    section: 'Delivery',
    links: [
      { name: 'Dashboard', path: '/delivery/dashboard', Icon: Dashboard, roles: ADMIN_PANEL_ROLES },
      {
        name: 'Delivery Persons',
        path: '/delivery/personnel',
        Icon: People,
        roles: ADMIN_PANEL_ROLES,
      },
      {
        name: 'Documents',
        path: '/delivery/documents',
        Icon: Description,
        roles: ADMIN_PANEL_ROLES,
      },
      {
        name: 'Fare Settings',
        path: '/delivery/fare-settings',
        Icon: AttachMoneyIcon,
        roles: ADMIN_PANEL_ROLES,
      },
      { name: 'Live Map', path: '/delivery/live-map', Icon: MapIcon, roles: ADMIN_PANEL_ROLES },
      {
        name: 'Assignments',
        path: '/delivery/assignment-dashboard',
        Icon: AssignmentIcon,
        roles: ADMIN_PANEL_ROLES,
      },
    ],
  },

  // ---------------- FINANCIALS ----------------
  {
    section: 'Financials',
    links: [
      { name: 'Payouts', path: '/admin/payouts', Icon: LocalAtmIcon, roles: ADMIN_PANEL_ROLES },
    ],
  },

  // ---------------- MARKETING ----------------
  {
    section: 'Marketing',
    links: [
      { name: 'Banners', path: '/marketing/banners', Icon: CampaignIcon, roles: ADMIN_PANEL_ROLES },
      { name: 'Coupons', path: '/marketing/coupons', Icon: Payment, roles: ADMIN_PANEL_ROLES },
      { name: 'User Logs', path: '/logs/user-logs', Icon: Description, roles: ADMIN_PANEL_ROLES },
    ],
  },

  // ---------------- POLICY ----------------
  {
    section: 'Policy',
    links: [
      { name: 'Privacy Policy', path: '/privacy-policy', Icon: Policy, roles: ADMIN_PANEL_ROLES },
      {
        name: 'Returns & Refunds',
        path: '/returns&refunds',
        Icon: Description,
        roles: ADMIN_PANEL_ROLES,
      },
      {
        name: 'Terms & Conditions',
        path: '/terms&conditions',
        Icon: Description,
        roles: ADMIN_PANEL_ROLES,
      },
    ],
  },

  // ---------------- APP ----------------
  {
    section: 'App',
    links: [
      { name: 'Users', path: '/users', Icon: People, roles: ADMIN_PANEL_ROLES },
      { name: 'Settings', path: '/settings', Icon: Settings, roles: ADMIN_PANEL_ROLES },
      {
        name: 'Notification',
        path: 'notifications',
        Icon: Notifications,
        roles: ADMIN_PANEL_ROLES,
      },
    ],
  },

  // ---------------- SUPER ADMIN ONLY ----------------
  {
    section: 'Super Admin',
    links: [
      {
        name: 'Admin Access',
        path: '/admin-access',
        Icon: AdminPanelSettings,
        roles: SUPER_ADMIN_ROLES,
      },
    ],
  },
];
