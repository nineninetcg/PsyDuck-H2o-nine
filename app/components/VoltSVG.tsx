import {motion} from 'framer-motion';

interface VoltSVGProps {
  size?: number;
  animate?: boolean;
}

export function VoltSVG({size = 80, animate = false}: VoltSVGProps) {
  const scale = size / 100;

  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 100 125"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Antenna */}
      <line x1="50" y1="14" x2="50" y2="4" stroke="#9ad2e6" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="50" cy="3" r="3" fill="#9ad2e6"/>

      {/* Head */}
      <rect x="17" y="14" width="66" height="54" rx="13" fill="#0d0d0d" stroke="#9ad2e6" strokeWidth="2.5"/>

      {/* Eye sockets */}
      <circle cx="36" cy="38" r="9" fill="#9ad2e6" opacity="0.15"/>
      <circle cx="64" cy="38" r="9" fill="#9ad2e6" opacity="0.15"/>

      {/* Eyes */}
      <circle cx="36" cy="38" r="6" fill="#9ad2e6"/>
      <circle cx="64" cy="38" r="6" fill="#9ad2e6"/>
      <circle cx="36" cy="38" r="2.5" fill="#0d0d0d"/>
      <circle cx="64" cy="38" r="2.5" fill="#0d0d0d"/>
      <circle cx="37.5" cy="36" r="1.2" fill="#9ad2e6"/>
      <circle cx="65.5" cy="36" r="1.2" fill="#9ad2e6"/>

      {/* Smile */}
      <path d="M36 52 Q50 62 64 52" stroke="#9ad2e6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

      {/* Ear bolts */}
      <rect x="10" y="33" width="7" height="12" rx="3" fill="#0d0d0d" stroke="#9ad2e6" strokeWidth="2"/>
      <rect x="83" y="33" width="7" height="12" rx="3" fill="#0d0d0d" stroke="#9ad2e6" strokeWidth="2"/>

      {/* Neck */}
      <rect x="43" y="68" width="14" height="7" rx="3" fill="#9ad2e6" opacity="0.4"/>

      {/* Body */}
      <rect x="25" y="75" width="50" height="36" rx="9" fill="#0d0d0d" stroke="#9ad2e6" strokeWidth="2.5"/>

      {/* Body squares */}
      <rect x="32" y="83" width="14" height="14" rx="4" fill="none" stroke="#9ad2e6" strokeWidth="2"/>
      <rect x="54" y="83" width="14" height="14" rx="4" fill="none" stroke="#9ad2e6" strokeWidth="2"/>

      {/* Left arm (static) */}
      <rect x="5" y="78" width="20" height="7" rx="3.5" fill="#0d0d0d" stroke="#9ad2e6" strokeWidth="2"/>
      <circle cx="5" cy="81.5" r="4" fill="#0d0d0d" stroke="#9ad2e6" strokeWidth="2"/>

      {/* Right arm (waving) */}
      {animate ? (
        <motion.g
          style={{transformOrigin: '75px 81px'}}
          animate={{rotate: [-15, 25, -15]}}
          transition={{duration: 0.9, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut'}}
        >
          <rect x="75" y="78" width="20" height="7" rx="3.5" fill="#0d0d0d" stroke="#9ad2e6" strokeWidth="2"/>
          <circle cx="95" cy="81.5" r="4" fill="#0d0d0d" stroke="#9ad2e6" strokeWidth="2"/>
        </motion.g>
      ) : (
        <g>
          <rect x="75" y="78" width="20" height="7" rx="3.5" fill="#0d0d0d" stroke="#9ad2e6" strokeWidth="2"/>
          <circle cx="95" cy="81.5" r="4" fill="#0d0d0d" stroke="#9ad2e6" strokeWidth="2"/>
        </g>
      )}
    </svg>
  );
}
