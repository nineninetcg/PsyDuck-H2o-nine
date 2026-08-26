/**
 * HowItWorks — 3-step section for product pages.
 * Dark/green aesthetic, mobile-first, lightweight (no dependencies).
 */
export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Preorder',
      description: 'Lock your box while allocation lasts. Full payment at checkout, and free cancellation within 3 days.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 6h12.8M7 13L5.4 5M17 21a1 1 0 100-2 1 1 0 000 2zm-10 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Release day',
      description: 'Stock lands with us around the official street date. Every packing is filmed.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Delivered',
      description: 'Insured shipping within 3 working days of arrival, tracking straight to your WhatsApp.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mt-8 bg-white rounded-none p-6 sm:p-8">
      {/* Header */}
      <p className="text-[#9ad2e6] text-xs font-bold uppercase tracking-widest mb-1">Simple Process</p>
      <h3 className="text-xl font-black text-black mb-6">How It Works</h3>

      {/* Steps */}
      <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        {steps.map((step, i) => (
          <div key={step.number} className="relative flex flex-row sm:flex-col gap-4 sm:gap-3">

            {/* Connector line on desktop (between steps) */}
            {i < steps.length - 1 && (
              <div className="hidden sm:block absolute top-5 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-px bg-[#9ad2e6]/20 z-0" />
            )}

            {/* Icon circle */}
            <div className="relative z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-none bg-[#9ad2e6]/10 border border-[#9ad2e6]/30 flex items-center justify-center text-[#9ad2e6]">
              {step.icon}
            </div>

            {/* Text */}
            <div className="flex-1">
              <p className="text-[10px] font-bold text-[#9ad2e6]/60 tracking-widest uppercase mb-0.5">
                Step {step.number}
              </p>
              <p className="font-bold text-black text-sm mb-1">{step.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
