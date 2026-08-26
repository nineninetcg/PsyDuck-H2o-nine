import {useEffect, useState} from 'react';

const SALE_DURATION_MS = 48 * 60 * 60 * 1000;
const STORAGE_KEY = 'nc_sale_exp';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function SaleBanner() {
  const [time, setTime] = useState({h: '00', m: '00', s: '00'});

  useEffect(() => {
    let exp = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
    if (!exp || Date.now() > exp) {
      exp = Date.now() + SALE_DURATION_MS;
      localStorage.setItem(STORAGE_KEY, String(exp));
    }
    function tick() {
      let diff = exp - Date.now();
      if (diff <= 0) {
        exp = Date.now() + SALE_DURATION_MS;
        localStorage.setItem(STORAGE_KEY, String(exp));
        diff = SALE_DURATION_MS;
      }
      setTime({
        h: pad(Math.floor(diff / 3600000)),
        m: pad(Math.floor((diff % 3600000) / 60000)),
        s: pad(Math.floor((diff % 60000) / 1000)),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full bg-[#0a0a0a] text-black text-center py-2.5 px-4 flex items-center justify-center gap-3 flex-wrap text-sm z-50">
      <span className="font-semibold tracking-wide">
        ⚡ Flash Sale &mdash; Up to{' '}
        <span className="text-[#00ff87] font-bold">90% off</span> all
        subscriptions. Ends in:
      </span>
      <div className="flex items-center gap-1.5">
        <TimeBox value={time.h} label="HRS" />
        <span className="text-[#00ff87] font-bold text-base">:</span>
        <TimeBox value={time.m} label="MIN" />
        <span className="text-[#00ff87] font-bold text-base">:</span>
        <TimeBox value={time.s} label="SEC" />
      </div>
      <a
        href="/collections/all"
        className="bg-[#00ff87] hover:bg-[#00e07a] text-black text-xs font-bold px-3.5 py-1.5 rounded-none transition-colors whitespace-nowrap"
      >
        Shop Now
      </a>
    </div>
  );
}

function TimeBox({value, label}: {value: string; label: string}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-none px-2.5 py-1 text-center min-w-[42px]">
      <span className="block text-lg font-extrabold leading-tight tabular-nums">
        {value}
      </span>
      <span className="block text-[8px] tracking-widest text-gray-500 mt-0.5">
        {label}
      </span>
    </div>
  );
}
