import React from 'react';
import { Typography } from '@mui/material';
import { Breadcrumb } from '@components/Breadcrumb';
import AppLoader from '@components/AppLoader';
import ThemeSwitcher from '@components/ThemeSwitcher';
import { Bell } from 'lucide-react';

const TopNav: React.FC = () => {
  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '16px 24px',
          background: 'var(--color-header)',
          borderBottom: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ minWidth: 180, display: 'grid', gap: 4 }}>
          <Breadcrumb />
          <Typography
            component="div"
            sx={{
              fontSize: 12,
              color: 'text.secondary',
              display: { xs: 'none', md: 'block' },
            }}
          >
            Manage operations, catalogs, and admin workflows.
          </Typography>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              border: '1px solid var(--color-border)',
              background: 'var(--color-card)',
              color: 'var(--color-text-muted)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Bell size={16} />
            <span
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: 999,
                background: 'var(--color-error)',
              }}
            />
          </button>
          <ThemeSwitcher />
        </div>
      </header>
      <AppLoader />
    </>
  );
};

export default TopNav;
