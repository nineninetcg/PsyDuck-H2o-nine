import {motion} from 'framer-motion';

/**
 * SassyDuck — coded mascot. Base pose: fists pressed to the sides of the head, no tail.
 * Micro-animation: bobbing, stressed head shake, pupil jitter, blink, optional sweat drop.
 */
const BLUE = '#A9D9EB';
const BLUE_LIGHT = '#CFEAF5';
const INK = '#0d1b22';
const BILL = '#F2C14E';

export function SassyDuck({
  size = 220,
  className = '',
  showSweat = false,
}: {
  size?: number;
  className?: string;
  showSweat?: boolean;
}) {
  return (
    <motion.div
      className={className}
      style={{width: size, height: size * 1.12, display: 'inline-block'}}
      animate={{y: [0, -5, 0]}}
      transition={{duration: 3.2, repeat: Infinity, ease: 'easeInOut'}}
    >
      <svg width="100%" height="100%" viewBox="0 0 240 268" fill="none">
        {/* feet */}
        <path d="M84 244 q-20 2 -24 12 q14 8 40 2z" fill={BILL} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        <path d="M156 244 q20 2 24 12 q-14 8 -40 2z" fill={BILL} stroke={INK} strokeWidth="6" strokeLinejoin="round" />

        {/* body */}
        <ellipse cx="120" cy="204" rx="54" ry="50" fill={BLUE} stroke={INK} strokeWidth="6" />
        <ellipse cx="120" cy="214" rx="34" ry="32" fill={BLUE_LIGHT} />

        {/* arms — short, straight up from the body to fists at the sides of the head */}
        <rect x="46" y="128" width="24" height="70" rx="12" transform="rotate(8 58 163)" fill={BLUE} stroke={INK} strokeWidth="6" />
        <rect x="170" y="128" width="24" height="70" rx="12" transform="rotate(-8 182 163)" fill={BLUE} stroke={INK} strokeWidth="6" />

        {/* head group — stressed shake */}
        <motion.g
          style={{transformBox: 'fill-box', transformOrigin: '50% 85%'}}
          animate={{rotate: [0, 0, 2.4, -2.4, 1.6, -1.6, 0, 0]}}
          transition={{duration: 4.6, repeat: Infinity, times: [0, 0.5, 0.56, 0.64, 0.72, 0.8, 0.86, 1], ease: 'easeInOut'}}
        >
          {/* hairs */}
          <path d="M112 34 L104 12" stroke={INK} strokeWidth="6" strokeLinecap="round" />
          <path d="M120 32 L120 9" stroke={INK} strokeWidth="6" strokeLinecap="round" />
          <path d="M128 34 L136 12" stroke={INK} strokeWidth="6" strokeLinecap="round" />

          {/* head — big, psyduck proportions */}
          <ellipse cx="120" cy="108" rx="76" ry="70" fill={BLUE} stroke={INK} strokeWidth="6" />

          {/* eyes — vacant stare, close together above bill */}
          <ellipse cx="102" cy="86" rx="13" ry="17" fill="#fff" stroke={INK} strokeWidth="5" />
          <ellipse cx="138" cy="86" rx="13" ry="17" fill="#fff" stroke={INK} strokeWidth="5" />
          <motion.circle
            cx="106" cy="84" r="4" fill={INK}
            animate={{cx: [106, 106, 108, 104, 106], cy: [84, 84, 82, 84, 84]}}
            transition={{duration: 4.6, repeat: Infinity, times: [0, 0.45, 0.55, 0.75, 1]}}
          />
          <motion.circle
            cx="134" cy="84" r="4" fill={INK}
            animate={{cx: [134, 134, 136, 132, 134], cy: [84, 84, 82, 84, 84]}}
            transition={{duration: 4.6, repeat: Infinity, times: [0, 0.45, 0.55, 0.75, 1]}}
          />
          {/* blink lids */}
          <motion.ellipse
            cx="102" cy="86" rx="14" ry="18" fill={BLUE}
            style={{transformBox: 'fill-box', transformOrigin: '50% 0%'}}
            animate={{scaleY: [0, 0, 1, 0, 0]}}
            transition={{duration: 4.6, repeat: Infinity, times: [0, 0.3, 0.33, 0.36, 1]}}
          />
          <motion.ellipse
            cx="138" cy="86" rx="14" ry="18" fill={BLUE}
            style={{transformBox: 'fill-box', transformOrigin: '50% 0%'}}
            animate={{scaleY: [0, 0, 1, 0, 0]}}
            transition={{duration: 4.6, repeat: Infinity, times: [0, 0.3, 0.33, 0.36, 1]}}
          />

          {/* bill — wide, flat, dominant */}
          <path d="M74 118 q-8 14 6 22 q16 10 40 10 q24 0 40 -10 q14 -8 6 -22 q-10 -16 -46 -16 q-36 0 -46 16z" fill={BILL} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
          <path d="M84 134 q36 -8 72 0" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="112" cy="114" rx="2.6" ry="3.4" fill={INK} />
          <ellipse cx="128" cy="114" rx="2.6" ry="3.4" fill={INK} />

          {/* fists pressed flat against the sides of the head, at ear/eye height */}
          <circle cx="58" cy="90" r="19" fill={BLUE} stroke={INK} strokeWidth="6" />
          <path d="M50 82 q8 -6 16 -2 M48 92 q9 -4 18 0 M50 100 q8 4 16 2" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="182" cy="90" r="19" fill={BLUE} stroke={INK} strokeWidth="6" />
          <path d="M190 82 q-8 -6 -16 -2 M192 92 q-9 -4 -18 0 M190 100 q-8 4 -16 2" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
        </motion.g>

        {/* sweat drop — optional, shown only where requested */}
        {showSweat && (
          <motion.path
            d="M206 52 q7 12 0 17 q-8 5 -12 -4 q-3 -8 12 -13z"
            fill="#7EC8E3" stroke={INK} strokeWidth="4"
            animate={{opacity: [0, 0, 1, 1, 0], y: [0, 0, 4, 16, 22]}}
            transition={{duration: 4.6, repeat: Infinity, times: [0, 0.48, 0.56, 0.78, 0.9]}}
          />
        )}
      </svg>
    </motion.div>
  );
}
