import React from 'react';
import { motion } from 'framer-motion';
import { useAppTheme } from '@contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const OPTIONS = [
  {
    key: 'light' as const,
    label: 'Light',
    icon: Sun,
    iconColor: '#f59e0b',
    activeBackground:
      'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(254,243,199,0.92) 100%)',
    iconBackground: 'linear-gradient(135deg, #fff7ed 0%, #fde68a 100%)',
    activeText: '#b45309',
  },
  {
    key: 'dark' as const,
    label: 'Dark',
    icon: Moon,
    iconColor: '#c4b5fd',
    activeBackground: 'linear-gradient(135deg, rgba(30,41,59,0.98) 0%, rgba(49,46,129,0.92) 100%)',
    iconBackground: 'linear-gradient(135deg, #312e81 0%, #0f172a 100%)',
    activeText: '#eef2ff',
  },
];

const ThemeSwitcher: React.FC = () => {
  const { setTheme, effectiveMode, isDark } = useAppTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 6,
          padding: 4,
          minWidth: 192,
          borderRadius: 18,
          border: isDark ? '1px solid rgba(129,140,248,0.22)' : '1px solid rgba(148,163,184,0.18)',
          background: isDark
            ? 'linear-gradient(180deg, rgba(15,23,42,0.94) 0%, rgba(15,23,42,0.86) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(248,250,252,0.92) 100%)',
          boxShadow: isDark ? '0 18px 36px rgba(2,6,23,0.34)' : '0 14px 28px rgba(15,23,42,0.08)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = effectiveMode === option.key;

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setTheme(option.key)}
              aria-pressed={active}
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minWidth: 0,
                height: 40,
                padding: '0 14px',
                border: 'none',
                borderRadius: 14,
                background: 'transparent',
                color: active
                  ? option.activeText
                  : isDark
                    ? 'rgba(226,232,240,0.8)'
                    : 'rgba(71,85,105,0.92)',
                fontSize: 13,
                fontWeight: active ? 700 : 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
                transition: 'transform 0.18s ease, color 0.18s ease',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {active && (
                <motion.span
                  layoutId="theme-switch-highlight"
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 14,
                    background: option.activeBackground,
                    boxShadow:
                      option.key === 'dark'
                        ? '0 10px 22px rgba(15,23,42,0.32)'
                        : '0 10px 22px rgba(245,158,11,0.18)',
                  }}
                />
              )}

              <span
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: active
                    ? option.iconBackground
                    : isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(148,163,184,0.14)',
                  color: active ? option.iconColor : isDark ? '#cbd5e1' : '#475569',
                  boxShadow: active
                    ? option.key === 'dark'
                      ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 14px rgba(15,23,42,0.24)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.75), 0 6px 14px rgba(245,158,11,0.18)'
                    : 'none',
                  flexShrink: 0,
                }}
              >
                <Icon size={14} strokeWidth={2.2} />
              </span>

              <span style={{ position: 'relative', zIndex: 1 }}>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
