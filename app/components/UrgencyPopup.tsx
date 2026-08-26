import {useEffect, useState} from 'react';
import {LocaleLink} from '~/components/LocaleLink';

const SEEN_KEY = 'sp_urgency_seen'; // 'shown' | 'dismissed' | 'closed'

export function UrgencyPopup() {
  const [open, setOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const state = sessionStorage.getItem(SEEN_KEY);

    if (state === 'closed') {
      return; // user fully dismissed, don't show anything again this session
    }

    if (state === 'dismissed') {
      // already saw the popup earlier this session, just show the side banner
      setShowBanner(true);
      return;
    }

    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SEEN_KEY, 'shown');
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  function dismissPopup() {
    setOpen(false);
    setShowBanner(true);
    sessionStorage.setItem(SEEN_KEY, 'dismissed');
  }

  function closeBanner() {
    setShowBanner(false);
    sessionStorage.setItem(SEEN_KEY, 'closed');
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
          onClick={dismissPopup}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-white border-2 border-black p-6 sm:p-7"
          >
            <button
              onClick={dismissPopup}
              aria-label="Close"
              className="absolute top-3 right-3 text-black/50 hover:text-black text-xl leading-none w-7 h-7 flex items-center justify-center"
            >
              ×
            </button>

            <p className="text-red-600 text-[11px] font-bold tracking-[0.25em] uppercase mb-3">
              Limited Stock
            </p>

            <h3 className="text-xl font-black tracking-tight text-black mb-3 leading-snug">
              30th Celebration won&rsquo;t be this price again
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              We're capped at our confirmed allocation for this set, and we're already seeing
              high-volume orders come in from collectors buying multiple boxes at once. Once it's
              gone, it's gone, and reprints don't happen at anniversary pricing. Lock in your box
              now before it sells out.
            </p>

            <button
              onClick={dismissPopup}
              className="block w-full text-center py-3 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-[#9ad2e6] hover:text-black transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {showBanner && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">
          <LocaleLink
            to="/collections/30th-celebration"
            className="bg-red-600 hover:bg-red-700 transition-colors text-white text-[9px] font-bold tracking-[0.15em] uppercase px-1 py-2.5 shadow-lg"
            style={{writingMode: 'vertical-rl'}}
          >
            30th Celebration is limited
          </LocaleLink>
          <button
            onClick={closeBanner}
            aria-label="Dismiss"
            className="bg-black text-white text-[10px] w-full py-0.5 hover:bg-black/80"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
