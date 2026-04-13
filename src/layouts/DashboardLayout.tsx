import React from 'react';
import SideNav from '@components/layout/SideNav/SideNav';
import AppBar from '@components/layout/AppBar/AppBar';
import { useAppTheme } from '@contexts/ThemeContext';
import ToastContainer from '@components/toast/ToastContainer';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark } = useAppTheme();

  return (
    <div
      className="admin-panel-shell"
      style={{
        display: 'flex',
        minHeight: '100vh',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--color-bg)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(circle at top left, rgba(99,102,241,0.18) 0%, transparent 30%), radial-gradient(circle at bottom right, rgba(124,58,237,0.16) 0%, transparent 32%)'
            : 'radial-gradient(circle at top left, rgba(79,70,229,0.1) 0%, transparent 26%), radial-gradient(circle at top right, rgba(124,58,237,0.1) 0%, transparent 30%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <SideNav />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          position: 'relative',
          zIndex: 1,
          background: 'var(--content-panel-bg)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <AppBar />
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <div style={{ padding: '24px', maxWidth: 1600, width: '100%', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
