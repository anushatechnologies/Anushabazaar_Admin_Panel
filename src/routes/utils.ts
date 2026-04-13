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

export const RouteLinks: RouteLinkGroup[] = [
  // ---------------- DASHBOARD ----------------
  {
    section: 'Dashboard',
    links: [{ name: 'Dashboard', path: '/', Icon: Dashboard }],
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
        roles: ['ADMIN', 'ROLE_ADMIN'],
      },
    ],
  },

  // ---------------- GOODS (Catalog) ----------------
  {
    section: 'Goods',
    links: [
      { name: 'Category', path: '/categories', Icon: Category },
      { name: 'SubCategory', path: '/subcategories', Icon: Category },
      { name: 'Product', path: '/products', Icon: Inventory2 },
    ],
  },

  // ---------------- PAYMENTS ----------------
  {
    section: 'Payments',
    links: [
      { name: 'Payments & Income', path: '/admin/income', Icon: AttachMoneyIcon },
      { name: 'COD', path: '/payments/cod', Icon: LocalAtmIcon },
    ],
  },

  // ---------------- STORE ----------------
  {
    section: 'Store',
    links: [
      { name: 'Store List', path: '/store-type', Icon: Store },
      { name: 'Store Dashboard', path: '/store-dashboard', Icon: Storefront },
    ],
  },

  // ---------------- DELIVERY ----------------
  {
    section: 'Delivery',
    links: [
      { name: 'Dashboard', path: '/delivery/dashboard', Icon: Dashboard },
      { name: 'Delivery Persons', path: '/delivery/personnel', Icon: People },
      { name: 'Documents', path: '/delivery/documents', Icon: Description },
      { name: 'Fare Settings', path: '/delivery/fare-settings', Icon: AttachMoneyIcon },
      { name: 'Live Map', path: '/delivery/live-map', Icon: MapIcon },
      { name: 'Assignments', path: '/delivery/assignment-dashboard', Icon: AssignmentIcon },
    ],
  },

  // ---------------- FINANCIALS ----------------
  {
    section: 'Financials',
    links: [{ name: 'Payouts', path: '/admin/payouts', Icon: LocalAtmIcon }],
  },

  // ---------------- MARKETING ----------------
  {
    section: 'Marketing',
    links: [
      { name: 'Banners', path: '/marketing/banners', Icon: CampaignIcon },
      { name: 'Coupons', path: '/marketing/coupons', Icon: Payment },
      { name: 'User Logs', path: '/logs/user-logs', Icon: Description },
    ],
  },

  // ---------------- POLICY ----------------
  {
    section: 'Policy',
    links: [
      { name: 'Privacy Policy', path: '/privacy-policy', Icon: Policy },
      { name: 'Returns & Refunds', path: '/returns&refunds', Icon: Description },
      { name: 'Terms & Conditions', path: '/terms&conditions', Icon: Description },
    ],
  },

  // ---------------- APP ----------------
  {
    section: 'App',
    links: [
      { name: 'Users', path: '/users', Icon: People },
      { name: 'Settings', path: '/settings', Icon: Settings },
      { name: 'Notification', path: 'notifications', Icon: Notifications },
    ],
  },
];
