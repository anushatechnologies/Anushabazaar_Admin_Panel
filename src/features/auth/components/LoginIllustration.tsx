import { Box } from '@mui/material';

export function LoginIllustration() {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 400,
        animation: 'float 3s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
      }}
    >
      <svg
        viewBox="0 0 500 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto' }}
      >
        {/* Desk */}
        <rect x="50" y="280" width="400" height="15" rx="7.5" fill="#1565c0" opacity="0.2" />

        {/* Chair */}
        <ellipse cx="250" cy="310" rx="40" ry="8" fill="#1976d2" opacity="0.3" />
        <rect x="235" y="240" width="30" height="70" rx="15" fill="#1976d2" opacity="0.4" />
        <rect x="220" y="230" width="60" height="20" rx="10" fill="#1976d2" opacity="0.5" />

        {/* Person Body */}
        <ellipse cx="250" cy="200" rx="35" ry="45" fill="#42a5f5" opacity="0.8" />

        {/* Person Head */}
        <circle cx="250" cy="140" r="25" fill="#64b5f6" />

        {/* Hair */}
        <path
          d="M 225 140 Q 225 115 250 115 Q 275 115 275 140 Q 275 125 250 125 Q 225 125 225 140"
          fill="#1565c0"
        />

        {/* Face details */}
        <circle cx="242" cy="138" r="2" fill="#1a1a1a" />
        <circle cx="258" cy="138" r="2" fill="#1a1a1a" />
        <path
          d="M 240 148 Q 250 152 260 148"
          stroke="#1a1a1a"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Left Arm */}
        <path
          d="M 220 180 Q 180 200 180 240"
          stroke="#42a5f5"
          strokeWidth="20"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Right Arm */}
        <path
          d="M 280 180 Q 320 200 320 240"
          stroke="#42a5f5"
          strokeWidth="20"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Laptop Base */}
        <rect x="170" y="260" width="160" height="10" rx="2" fill="#424242" />
        <rect x="175" y="262" width="150" height="6" rx="1" fill="#616161" />

        {/* Laptop Screen */}
        <rect x="180" y="160" width="140" height="100" rx="4" fill="#1a1a1a" />
        <rect x="190" y="170" width="120" height="80" rx="2" fill="#1565c0" />

        {/* Screen Content - Code Lines */}
        <rect x="200" y="180" width="60" height="3" rx="1.5" fill="#e3f2fd" />
        <rect x="200" y="190" width="80" height="3" rx="1.5" fill="#e3f2fd" />
        <rect x="210" y="200" width="70" height="3" rx="1.5" fill="#e3f2fd" />
        <rect x="210" y="210" width="50" height="3" rx="1.5" fill="#e3f2fd" />
        <rect x="200" y="220" width="90" height="3" rx="1.5" fill="#e3f2fd" />
        <rect x="200" y="230" width="65" height="3" rx="1.5" fill="#e3f2fd" />

        {/* Hands on Keyboard */}
        <ellipse cx="180" cy="265" rx="12" ry="8" fill="#64b5f6" />
        <ellipse cx="320" cy="265" rx="12" ry="8" fill="#64b5f6" />

        {/* Coffee Cup */}
        <rect x="350" y="255" width="30" height="35" rx="3" fill="#8D6E63" />
        <ellipse cx="365" cy="253" rx="15" ry="4" fill="#6D4C41" />
        <path
          d="M 380 265 Q 390 265 390 275 Q 390 280 385 280 L 380 280"
          stroke="#6D4C41"
          strokeWidth="3"
          fill="none"
        />

        {/* Steam from Coffee */}
        <path
          d="M 360 245 Q 362 235 360 230"
          stroke="#90A4AE"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        >
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
        </path>
        <path
          d="M 370 245 Q 368 235 370 230"
          stroke="#90A4AE"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        >
          <animate
            attributeName="opacity"
            values="0.5;0.8;0.5"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </path>

        {/* Floating Icons */}
        {/* Dollar Sign */}
        <g opacity="0.4">
          <circle cx="100" cy="120" r="18" fill="#4CAF50" />
          <text x="100" y="130" fontSize="24" fill="white" textAnchor="middle" fontWeight="bold">
            $
          </text>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -10; 0 0"
            dur="3s"
            repeatCount="indefinite"
          />
        </g>

        {/* Chart Icon */}
        <g opacity="0.4">
          <rect x="380" y="100" width="40" height="40" rx="4" fill="#FF9800" />
          <rect x="385" y="125" width="6" height="10" fill="white" />
          <rect x="395" y="118" width="6" height="17" fill="white" />
          <rect x="405" y="110" width="6" height="25" fill="white" />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -8; 0 0"
            dur="4s"
            repeatCount="indefinite"
          />
        </g>

        {/* Lock Icon */}
        <g opacity="0.4">
          <rect x="75" y="250" width="30" height="25" rx="3" fill="#F44336" />
          <rect
            x="85"
            y="243"
            width="10"
            height="15"
            rx="5"
            fill="none"
            stroke="#F44336"
            strokeWidth="3"
          />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -12; 0 0"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </g>

        {/* Document Icon */}
        <g opacity="0.4">
          <rect x="390" y="200" width="28" height="35" rx="2" fill="#2196F3" />
          <rect x="395" y="210" width="18" height="2" fill="white" />
          <rect x="395" y="217" width="18" height="2" fill="white" />
          <rect x="395" y="224" width="12" height="2" fill="white" />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -10; 0 0"
            dur="4.5s"
            repeatCount="indefinite"
          />
        </g>
      </svg>
    </Box>
  );
}
