import {useEffect, useState} from 'react';
import {useNavigation} from 'react-router';
import {motion, AnimatePresence} from 'framer-motion';
import {VoltSVG} from '~/components/VoltSVG';

export function LoadingScreen() {
  const navigation = useNavigation();
  const [showInitial, setShowInitial] = useState(true);
  const isNavigating = navigation.state === 'loading';

  useEffect(() => {
    const timer = setTimeout(() => setShowInitial(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  const visible = showInitial || isNavigating;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={showInitial ? 'initial' : 'nav'}
          initial={{opacity: 1}}
          exit={{opacity: 0, transition: {duration: 0.5, ease: 'easeInOut'}}}
          className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center gap-6 pointer-events-none"
        >
          <motion.div
            initial={{scale: 0.7, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            transition={{duration: 0.4, ease: 'backOut'}}
          >
            <VoltSVG size={88} animate={true} />
          </motion.div>

          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 0.5}}
            className="flex gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-none bg-[#9ad2e6]"
                animate={{opacity: [0.2, 1, 0.2]}}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
