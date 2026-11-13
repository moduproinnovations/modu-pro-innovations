import React from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { useSite } from '../context/SiteContext';
import SeoHead from '../components/SeoHead';

const STACK_TONES = [
  {
    card: 'bg-[#F4EEDF] text-[#0A1428] border border-[#D9C08B]/55',
    muted: 'text-[#0A1428]/70',
    ring: 'border-[#D9C08B] text-[#3F5E8C]',
  },
  {
    card: 'bg-[#D9C08B] text-[#0A1428] border border-[#0A1428]/20',
    muted: 'text-[#0A1428]/75',
    ring: 'border-[#0A1428]/35 text-[#0A1428]',
  },
  {
    card: 'bg-[#3F5E8C] text-[#F4EEDF] border border-[#D9C08B]/45',
    muted: 'text-[#F4EEDF]/80',
    ring: 'border-[#D9C08B] text-[#D9C08B]',
  },
  {
    card: 'bg-[#F4EEDF] text-[#0A1428] border border-[#D9C08B]/55',
    muted: 'text-[#0A1428]/70',
    ring: 'border-[#D9C08B] text-[#3F5E8C]',
  },
];

export default function Divisions() {
  const { siteSettings, divisions } = useSite();
  const prefersReducedMotion = useReducedMotion();

  const divisionList =
    divisions && divisions.length > 0
      ? divisions.map((d, idx) => ({
          ...d,
          code: d.code || `0${idx + 1}`,
          displayName:
            d.slug === 'adhesi-pro' && siteSettings?.adhesiBrandSpelling
              ? siteSettings.adhesiBrandSpelling
              : d.name,
        }))
      : [
          {
            code: '01',
            displayName: siteSettings?.adhesiBrandSpelling || 'Adhesi Pro',
            slug: 'adhesi-pro',
            shortDescription:
              'Adhesi Pro is the adhesive brand associated with Modu Pro Innovation Pvt. Ltd. The product range supports furniture, modular-kitchen, door and woodworking applications.',
            heroImage: '/assets/products/adhesi-pro/lockpro-wr3-drum.png',
          },
          {
            code: '02',
            displayName: 'Wood Working & Modular Furniture Tools',
            slug: 'pcd-blades',
            shortDescription:
              'Types of Tools: Brazed Tooling, Replaceable Tooling, CNC Router Bits, Saw Blades, PCD Tools, Multi-Boring Bits.',
            heroImage: '/assets/products/pcd-blades/pre-milling-cutters.png',
          },
          {
            code: '03',
            displayName: 'Panel Processing Machines Division',
            slug: 'panel-processing',
            shortDescription:
              'Modu Pro Innovation Pvt. Ltd. supports woodworking operations with panel-processing machinery, related spare parts and service support.',
            heroImage: '/assets/products/panel-processing/edge-banding-machine.png',
          },
          {
            code: '04',
            displayName: 'PVC Edge-Banding Tapes & Hardware',
            slug: 'edge-banding-hardware',
            shortDescription:
              'This division brings together PVC edge-banding tapes and selected furniture fittings used in modular furniture and kitchen applications.',
            heroImage: '/assets/products/edge-banding-hardware/pvc-woodgrain-tape.png',
          },
        ];

  return (
    <>
      <SeoHead
        title="Our Divisions"
        description="Explore Modu Pro Innovation Pvt. Ltd.’s four specialized business divisions: Adhesi Pro, Wood Working & Modular Furniture Tools, Panel Processing Machines Division, and PVC Edge-Banding Tapes & Hardware."
        canonicalPath="/divisions"
      />

      {/* Page Hero */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-5">
            <p className="font-mono-code text-xs uppercase tracking-[0.22em] text-[#D9C08B]">
              Four Specialized Verticals
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F4EEDF] leading-tight">
              Our Business Divisions
            </h1>
            <div className="w-20 h-[1.5px] bg-[#D9C08B]" />
            <p className="text-base sm:text-lg text-[#F4EEDF]/85 leading-relaxed">
              Modu Pro Innovation Pvt. Ltd. structures its product portfolio and technical services
              into four complementary divisions—enabling furniture, kitchen, door, and woodworking
              manufacturers to source related industrial solutions through a single point of
              contact.
            </p>
          </div>
        </div>
      </section>

      <section className="relative pb-16 sm:pb-24" aria-label="Division cards">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {divisionList.map((div, index) => {
            const tone = STACK_TONES[index % STACK_TONES.length];
            return (
              <div
                key={div.slug}
                className={prefersReducedMotion ? 'relative mb-4' : 'sticky mb-4'}
                style={
                  prefersReducedMotion
                    ? undefined
                    : { top: `calc(5.25rem + ${index * 14}px)`, zIndex: index + 1 }
                }
              >
                <Link
                  to={`/divisions/${div.slug}`}
                  className={`group relative grid min-h-0 sm:min-h-[250px] grid-cols-1 overflow-hidden rounded-[1.75rem] sm:grid-cols-[1.35fr_0.85fr] ${tone.card}`}
                >
                  <div className="relative z-10 flex flex-col justify-center px-5 py-7 sm:px-10 sm:py-10 lg:px-12">
                    <span
                      className={`inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border bg-transparent text-xs sm:text-sm font-medium ${tone.ring}`}
                    >
                      0{index + 1}
                    </span>
                    <h2 className="mt-4 sm:mt-6 max-w-xl text-xl sm:text-[1.85rem] font-semibold leading-tight tracking-tight">
                      {div.displayName}
                    </h2>
                    <p className={`mt-2.5 sm:mt-3 max-w-lg text-xs sm:text-[15px] leading-relaxed ${tone.muted}`}>
                      {div.shortDescription || div.fullDescription}
                    </p>
                  </div>
                  <div className="relative h-44 sm:h-auto flex items-center justify-center sm:block p-4 sm:p-0">
                    <img
                      src={div.heroImage}
                      alt=""
                      loading={index === 0 ? undefined : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : undefined}
                      width="420"
                      height="320"
                      className="sm:absolute sm:inset-y-4 sm:right-4 h-36 sm:h-[calc(100%-2rem)] w-auto max-w-[90%] object-contain object-center sm:object-right transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
