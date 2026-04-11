import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
import { Tooltip, Avatar, Divider, Menu, MenuItem } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { getStoredRefreshToken } from '@features/auth/authCookies';
import { logoutUser } from '@features/auth/authSlice';
import { Logo } from '@assets/index';
import { RouteLinks } from '@routes/utils';
import { motion } from 'framer-motion';

const SIDEBAR_W = 284;
const COLLAPSED_W = 84;

const SideNav = () => {
  const location = useLocation();
  const navRef = useRef<HTMLElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const isLoggedIn = useAppSelector((s) => s.auth.isLoggedIn);

  if (!isLoggedIn) return null;

  const handleLogout = async () => {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/adminpanel/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Best effort logout — local cleanup still proceeds.
      }
    }

    dispatch(logoutUser());
    setAnchorEl(null);
    navigate('/login', { replace: true });
  };

  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? 'A';
  const displayName = user?.email?.split('@')[0] ?? 'Admin';

  return (
    <motion.aside
      animate={{ width: collapsed ? COLLAPSED_W : SIDEBAR_W }}
      transition={{ duration: 0.22 }}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-sidebar)',
        borderRight: '1px solid var(--color-sidebar-edge)',
        boxShadow: 'var(--shadow-lg)',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: collapsed ? '24px 18px 20px' : '24px 22px 20px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: 'var(--color-accent-grad)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <img src={Logo} alt="Logo" style={{ width: 22, height: 22 }} />
          </div>
          {!collapsed && (
            <div>
              <div
                style={{ color: 'var(--sidebar-title)', fontWeight: 800, fontSize: 18 }}
                className="panel-title"
              >
                Anusha Admin
              </div>
              <div style={{ color: 'var(--sidebar-subtitle)', fontSize: 12 }}>
                Operations Console
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setCollapsed((value) => !value)}
        style={{
          position: 'absolute',
          top: 24,
          right: 12,
          width: 30,
          height: 30,
          borderRadius: 999,
          border: '1px solid var(--color-border)',
          background: 'var(--color-card)',
          color: 'var(--color-text-muted)',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
        }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <nav ref={navRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 10px 10px' }}>
        {RouteLinks.map((group) => {
          const visibleLinks = group.links.filter(
            (link) => !link.roles || (user?.role && link.roles.includes(user.role)),
          );
          if (!visibleLinks.length) return null;

          return (
            <div key={group.section} style={{ marginBottom: 14 }}>
              {!collapsed && (
                <div
                  style={{
                    padding: '10px 12px',
                    color: 'var(--nav-section)',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  {group.section}
                </div>
              )}

              {visibleLinks.map(({ path, name, Icon }) => {
                const isActive =
                  location.pathname === path || location.pathname.startsWith(path + '/');
                return (
                  <Tooltip key={name} title={collapsed ? name : ''} placement="right">
                    <Link to={path} style={{ textDecoration: 'none', display: 'block' }}>
                      <div
                        style={{
                          margin: '4px 0',
                          padding: collapsed ? '14px 0' : '14px 14px',
                          borderRadius: 18,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          gap: 12,
                          color: isActive ? 'var(--nav-active-text)' : 'var(--nav-text)',
                          background: isActive ? 'var(--nav-active-bg)' : 'transparent',
                          border: isActive
                            ? '1px solid var(--color-border)'
                            : '1px solid transparent',
                          boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                          transition: 'all 0.18s ease',
                        }}
                        onMouseEnter={(event) => {
                          if (!isActive) {
                            event.currentTarget.style.background = 'var(--nav-hover-bg)';
                          }
                        }}
                        onMouseLeave={(event) => {
                          if (!isActive) {
                            event.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <Icon fontSize="small" sx={{ fontSize: 18 }} />
                        {!collapsed && (
                          <span style={{ fontSize: 14, fontWeight: isActive ? 700 : 600 }}>
                            {name}
                          </span>
                        )}
                      </div>
                    </Link>
                  </Tooltip>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div
        style={{
          margin: 12,
          padding: 12,
          borderRadius: 22,
          border: '1px solid var(--sidebar-user-border)',
          background: 'var(--sidebar-user-bg)',
        }}
      >
        <div
          onClick={(event) => setAnchorEl(event.currentTarget)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <Avatar
            sx={{ width: 40, height: 40, background: 'var(--color-accent-grad)', fontWeight: 800 }}
          >
            {avatarLetter}
          </Avatar>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: 'var(--sidebar-title)',
                  fontWeight: 700,
                  fontSize: 14,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {displayName}
              </div>
              <div style={{ color: 'var(--sidebar-subtitle)', fontSize: 12 }}>
                {user?.role ?? 'ADMIN'}
              </div>
            </div>
          )}
        </div>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { minWidth: 220, borderRadius: 3 } }}
      >
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ gap: 1.5 }}>
          <User size={15} /> Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ gap: 1.5, color: 'error.main' }}>
          <LogOut size={15} /> Sign out
        </MenuItem>
      </Menu>
    </motion.aside>
  );
};

export default SideNav;
