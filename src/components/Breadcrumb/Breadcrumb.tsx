import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const { appId, orgId } = useParams();

  return (
    <nav
      aria-label="breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        fontSize: '14px',
        marginBottom: '1rem',
      }}
    >
      {/* Dashboard */}
      <Link
        to="/"
        style={{
          textDecoration: 'none',
          color: 'var(--highlight-color)',
          fontWeight: 500,
          fontSize: '16px',
        }}
      >
        Dashboard
      </Link>

      {/* LOOP first 1 segment: "all-loans" */}
      {pathnames.slice(0, 1).map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const displayName = name === 'all-loans' ? 'All Loans' : name.split('-').join(' ');

        return (
          <span key={name} style={{ display: 'flex', alignItems: 'center' }}>
            <NavigateNextIcon
              style={{ fontSize: '18px', color: 'var(--text-color)', opacity: 0.5, margin: '0 4px' }}
            />
            <Link
              to={routeTo}
              style={{
                textDecoration: 'none',
                color: 'var(--highlight-color)',
                textTransform: 'capitalize',
              }}
            >
              {displayName}
            </Link>
          </span>
        );
      })}

      {appId && orgId && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <NavigateNextIcon
            style={{ fontSize: '18px', color: 'var(--text-color)', opacity: 0.5, margin: '0 4px' }}
          />

          <span style={{ color: 'var(--text-color)', fontWeight: 500 }}>
            Loan Summary (App ID: {appId})
          </span>
        </span>
      )}
    </nav>
  );
};

export default Breadcrumb;
