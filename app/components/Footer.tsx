import {Suspense} from 'react';
import {Await} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {LocaleNavLink} from '~/components/LocaleLink';
import {processMenuUrl} from '~/lib/menu-utils';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

const POLICIES = [
  ['Shipping Policy', '/policies/shipping-policy'],
  ['Refund Policy', '/policies/refund-policy'],
  ['Privacy Policy', '/policies/privacy-policy'],
  ['Terms of Service', '/policies/terms-of-service'],
];

const INFO = [
  ['About Us', '/about-us'],
  ['FAQ', '/faq'],
  ['Contact Us', '/pages/contact'],
  ['Affiliate Program', '/affiliates'],
  ['All Products', '/collections/all'],
];

export function Footer({footer: footerPromise, header, publicStoreDomain}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {() => (
          <footer className="mt-auto bg-[#111111] text-white">
            <div className="w-full px-6 md:px-14 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src="/sassy-logo-512.png" alt="Sassypsyduck" width={48} height={48} style={{width: 48, height: 48}} />
                  <span className="font-black tracking-tight text-lg">SASSYPSYDUCK</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  Officially allocated Pokémon TCG sealed product across the EU, US and Asia.
                  Capped preorders, real allocation, zero games.
                </p>
              </div>

              {/* Term & Policy */}
              <div>
                <h4 className="text-xs font-black mb-5 uppercase tracking-[0.25em] text-white/50">Term &amp; Policy</h4>
                <ul className="space-y-3 text-sm">
                  {POLICIES.map(([label, to]) => (
                    <li key={to}>
                      <LocaleNavLink to={to} className="text-white/70 hover:text-[#9ad2e6] transition-colors">{label}</LocaleNavLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Information */}
              <div>
                <h4 className="text-xs font-black mb-5 uppercase tracking-[0.25em] text-white/50">Information</h4>
                <ul className="space-y-3 text-sm">
                  {INFO.map(([label, to]) => (
                    <li key={to}>
                      <LocaleNavLink to={to} className="text-white/70 hover:text-[#9ad2e6] transition-colors">{label}</LocaleNavLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Why shop with us */}
              <div>
                <h4 className="text-xs font-black mb-5 uppercase tracking-[0.25em] text-white/50">Why Shop With Us</h4>
                <ul className="space-y-3.5 text-sm">
                  {[
                    ['M20 6L9 17l-5-5', 'Capped, confirmed allocation'],
                    ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', '100% sealed authentic product'],
                    ['M13 2L3 14h9l-1 8 10-12h-9l1-8z', 'Fast insured shipping across the EU, US and Asia'],
                  ].map(([d, label]) => (
                    <li key={label} className="flex items-center gap-2.5 text-white/70">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ad2e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Community */}
              <div>
                <h4 className="text-xs font-black mb-5 uppercase tracking-[0.25em] text-white/50">Follow Us</h4>
                <p className="text-white/60 text-sm mb-4">Drops, restocks and packing videos.</p>
                <div className="flex gap-3">
                  {[
                    ['Instagram', 'https://instagram.com/sassypsyduck', 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'],
                    ['TikTok', 'https://tiktok.com/@sassypsyduck', 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'],
                  ].map(([label, href, d]) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                       className="w-9 h-9 border border-white/25 flex items-center justify-center hover:bg-[#9ad2e6] hover:border-[#9ad2e6] group transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white group-hover:text-black"><path d={d} /></svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 px-6 md:px-14 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
              <span>© 2026 Sassypsyduck. All rights reserved. Not affiliated with Nintendo, The Pokémon Company or Game Freak.</span>
              <span className="flex gap-5">
                <LocaleNavLink to="/policies/terms-of-service" className="hover:text-white">Terms</LocaleNavLink>
                <LocaleNavLink to="/policies/privacy-policy" className="hover:text-white">Privacy</LocaleNavLink>
              </span>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}
