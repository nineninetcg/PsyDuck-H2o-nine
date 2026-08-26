import {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {LocaleLink} from '~/components/LocaleLink';
import {VoltSVG} from '~/components/VoltSVG';

export function VoltMascot() {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const suggestions = [
    {label: 'Best Bundles', href: '/collections/bundles'},
    {label: 'Writing Tools', href: '/collections/writing'},
    {label: 'Video Editors', href: '/collections/video-editors'},
    {label: 'On Sale', href: '/collections/sale'},
    {label: 'Shop All', href: '/collections/all'},
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{opacity: 0, scale: 0.85, y: 16}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.85, y: 16}}
            transition={{type: 'spring', stiffness: 320, damping: 26}}
            className="bg-white border-2 border-black rounded-none shadow-2xl w-68 overflow-hidden"
            style={{width: '272px'}}
          >
            <div className="bg-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <VoltSVG size={32} animate={true} />
                </div>
                <div>
                  <p className="text-black font-bold text-sm tracking-wide">VOLT</p>
                  <p className="text-[#9ad2e6] text-xs">Your deal finder</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-black/50 hover:text-black transition-colors text-sm"
                aria-label="Close"
              >
                x
              </button>
            </div>

            <div className="p-4">
              <div className="bg-gray-50 rounded-none p-3 mb-4 border border-gray-100">
                <p className="text-sm text-gray-800 leading-relaxed">
                  <span className="font-bold text-black">Hey — I am Volt.</span>
                  <br />
                  Where do you want to go?
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {suggestions.map((s) => (
                  <LocaleLink
                    key={s.href}
                    to={s.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-none border-2 border-black text-sm font-semibold hover:bg-[#9ad2e6] hover:border-[#9ad2e6] transition-all group"
                  >
                    <span>{s.label}</span>
                    <span className="text-gray-600 group-hover:text-black transition-colors">
                      &rarr;
                    </span>
                  </LocaleLink>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 px-4 py-2 flex justify-between items-center">
              <p className="text-xs text-gray-600">Powered by Volt</p>
              <button
                onClick={() => setDismissed(true)}
                className="text-xs text-gray-600 hover:text-black transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{scale: 1.08}}
        whileTap={{scale: 0.94}}
        className="relative w-16 h-16 bg-[#9ad2e6] rounded-none flex items-center justify-center shadow-lg"
        style={{border: '3px solid black'}}
        aria-label="Chat with Volt"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{rotate: -90, opacity: 0}}
              animate={{rotate: 0, opacity: 1}}
              exit={{rotate: 90, opacity: 0}}
              transition={{duration: 0.15}}
              className="text-black font-black text-lg"
            >
              x
            </motion.span>
          ) : (
            <motion.div
              key="robot"
              initial={{rotate: 15, opacity: 0}}
              animate={{rotate: 0, opacity: 1}}
              exit={{rotate: -15, opacity: 0}}
              transition={{duration: 0.15}}
            >
              <VoltSVG size={36} animate={true} />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-none bg-[#9ad2e6]"
            animate={{scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4]}}
            transition={{duration: 2.5, repeat: Infinity, ease: 'easeInOut'}}
            style={{zIndex: -1}}
          />
        )}
      </motion.button>
    </div>
  );
}
