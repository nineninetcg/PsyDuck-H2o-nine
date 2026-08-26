import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {Separator} from '@/components/ui/separator';
import {cn} from '@/lib/utils';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
      
      // Prevent body scroll and horizontal overflow when sidebar is open
      const previousOverflow = document.body.style.overflow;
      const previousOverflowX = document.body.style.overflowX;
      document.body.style.overflow = 'hidden';
      document.body.style.overflowX = 'hidden';
      
      return () => {
        abortController.abort();
        document.body.style.overflow = previousOverflow;
        document.body.style.overflowX = previousOverflowX;
      };
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <div
      className={cn(
        'fixed inset-0 bg-black/50 z-[60] transition-all duration-300',
        expanded ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      )}
      role="dialog"
      aria-modal
    >
      <button 
        className="absolute inset-0 cursor-default" 
        onClick={close}
        aria-label="Close sidebar"
      />
      <aside
        className={cn(
          'fixed right-0 top-0 h-full w-[85%] sm:w-[400px] max-w-[85vw] bg-white text-black shadow-2xl transition-transform duration-300 ease-in-out z-[60] border-l-2 border-[#9ad2e6]',
          expanded ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <header className="flex items-center justify-between h-16 px-5 border-b border-gray-800">
          <h3 className="text-lg font-semibold m-0 text-[#9ad2e6] tracking-[0.15em]">{heading}</h3>
          <button 
            className="text-2xl w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity" 
            onClick={close} 
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <main className="p-4 overflow-y-auto h-[calc(100%-4rem)]">{children}</main>
      </aside>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
