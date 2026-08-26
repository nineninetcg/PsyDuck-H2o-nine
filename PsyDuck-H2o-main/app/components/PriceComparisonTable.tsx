/**
 * PriceComparisonTable — "Logic Close" conversion component.
 * Renders on ChatGPT and Claude product pages to contrast retail vs NC pricing.
 */

type Row = {
  feature: string;
  retail: string;
  nc: string;
};

const CHATGPT_ROWS: Row[] = [
  {feature: 'Monthly Cost (Plus)', retail: '$20.00', nc: '$9.99'},
  {feature: '6-Month Cost', retail: '$120.00', nc: '$39.98'},
  {feature: 'Delivery', retail: 'Instant (self-serve)', nc: 'Within 24 Hours'},
  {feature: 'Support', retail: 'Standard', nc: '24/7 Priority'},
  {feature: 'Money-Back Guarantee', retail: 'None', nc: '48-Hour Guarantee'},
];

const CLAUDE_ROWS: Row[] = [
  {feature: 'Monthly Cost (Pro)', retail: '$20.00', nc: '$16.99'},
  {feature: '6-Month Cost', retail: '$120.00', nc: '$69.99'},
  {feature: 'Delivery', retail: 'Instant (self-serve)', nc: 'Within 24 Hours'},
  {feature: 'Support', retail: 'Standard', nc: '24/7 Priority'},
  {feature: 'Money-Back Guarantee', retail: 'None', nc: '48-Hour Guarantee'},
];

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-[#9ad2e6] inline-block mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4 text-gray-300 inline-block mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

export function PriceComparisonTable({productHandle}: {productHandle: string}) {
  const isChatGPT = productHandle === 'chatgpt-pro';
  const isClaude = productHandle === 'claude-pro';

  if (!isChatGPT && !isClaude) return null;

  const rows = isChatGPT ? CHATGPT_ROWS : CLAUDE_ROWS;
  const productName = isChatGPT ? 'ChatGPT Plus' : 'Claude Pro';
  const retailName = isChatGPT ? 'OpenAI (Retail)' : 'Anthropic (Retail)';

  return (
    <div className="mt-10 mb-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-black text-black tracking-tight">
          Why Buy From Sassypsyduck?
          <span className="block w-8 h-1 bg-[#9ad2e6] mt-2" />
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Same {productName} access — significantly less out of pocket.
        </p>
      </div>

      {/* Table wrapper — horizontally scrollable on mobile */}
      <div className="overflow-x-auto rounded-none border border-gray-200 shadow-sm">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-500 bg-gray-50 w-[40%]">
                Feature
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500 bg-gray-50 w-[30%]">
                {retailName}
              </th>
              <th className="text-center px-4 py-3 font-bold text-black bg-[#9ad2e6] w-[30%]">
                Sassypsyduck ✓
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.feature}
                className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {row.feature}
                </td>
                <td className="px-4 py-3 text-center text-gray-500">
                  {row.retail}
                </td>
                <td className="px-4 py-3 text-center font-bold text-black bg-[#9ad2e6]/10 border-x border-[#9ad2e6]/20">
                  <span className="flex items-center justify-center gap-1">
                    <CheckIcon />
                    {row.nc}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA nudge */}
      <p className="text-xs text-gray-600 mt-3 text-center">
        Same model · Same features · 48-hour money-back guarantee
      </p>
    </div>
  );
}
