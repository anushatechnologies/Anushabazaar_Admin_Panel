import React, { useState } from 'react';
import { useAppTheme, ThemeMode } from '@contexts/ThemeContext';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OPTIONS: {
  key: ThemeMode;
  label: string;
  desc: string;
  icon: React.ReactNode;
  preview: string;
}[] = [
  {
    key: 'light',
    label: 'Light',
    desc: 'Airy + Indigo',
    icon: <Sun size={14} />,
    preview: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
  },
  {
    key: 'dark',
    label: 'Dark',
    desc: 'Slate + Indigo',
    icon: <Moon size={14} />,
    preview: 'linear-gradient(135deg, #0b1120 0%, #4f46e5 100%)',
  },
  {
    key: 'system',
    label: 'System',
    desc: 'Follow device',
    icon: <Monitor size={14} />,
    preview: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #0b1120 100%)',
  },
];

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, effectiveMode } = useAppTheme();
  const [open, setOpen] = useState(false);

  const current = OPTIONS.find((o) => o.key === theme) ?? OPTIONS[0];
  const triggerLabel =
    theme === 'system' ? `System (${effectiveMode === 'dark' ? 'Dark' : 'Light'})` : current.label;

  const IconMap: Record<ThemeMode, React.ReactNode> = {
    light: <Sun size={14} />,
    dark: <Moon size={14} />,
    system: <Monitor size={14} />,
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          borderRadius: 14,
          border: '1px solid var(--color-border)',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(12px)',
          cursor: 'pointer',
          color: 'var(--color-text)',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'inherit',
          transition: 'all 0.2s ease',
          height: 40,
          boxShadow: 'var(--shadow-sm)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = 'var(--color-accent)';
          el.style.color = 'var(--color-accent)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = 'var(--color-border)';
          el.style.color = 'var(--color-text)';
        }}
      >
        {/* Color swatch preview  */}
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 4,
            background: current.preview,
            border: '1px solid var(--color-border-strong)',
            flexShrink: 0,
          }}
        />
        <span style={{ display: 'flex', alignItems: 'center' }}>{IconMap[theme]}</span>
        <span>{triggerLabel}</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              zIndex: 999,
              width: 228,
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              padding: 6,
            }}
          >
            <div
              style={{
                padding: '4px 10px 8px',
                fontSize: 10.5,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-text-muted)',
              }}
            >
              Appearance
            </div>

            {OPTIONS.map((opt) => {
              const selected = theme === opt.key;
              return (
                <div
                  key={opt.key}
                  onClick={() => {
                    setTheme(opt.key);
                    setOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: selected ? 'var(--color-accent-soft)' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!selected)
                      (e.currentTarget as HTMLDivElement).style.background = 'var(--nav-hover-bg)';
                  }}
                  onMouseLeave={(e) => {
                    if (!selected)
                      (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  {/* Preview swatch */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      flexShrink: 0,
                      background: opt.preview,
                      border: selected
                        ? `2px solid var(--color-accent)`
                        : '1px solid var(--color-border-strong)',
                      boxShadow: selected ? `0 0 0 3px var(--color-accent-soft)` : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color:
                        opt.key === 'dark'
                          ? '#a5b4fc'
                          : opt.key === 'system'
                            ? '#d97706'
                            : '#6366f1',
                      fontSize: 12,
                    }}
                  >
                    {opt.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: selected ? 700 : 500,
                        color: selected ? 'var(--color-accent)' : 'var(--color-text)',
                      }}
                    >
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{opt.desc}</div>
                  </div>

                  {selected && (
                    <Check size={13} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
