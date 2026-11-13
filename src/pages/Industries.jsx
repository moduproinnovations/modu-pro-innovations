import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { publicApi } from '../services/api';
import SeoHead from '../components/SeoHead';

const DEFAULT_SECTORS = [
  {
    id: 'modular-furniture-manufacturing',
    sectorNumber: '01',
    name: 'Modular Furniture Manufacturing',
    slug: 'modular-furniture-manufacturing',
    tagline: 'Wardrobe, Cabinet Carcass & Workstation Production',
    description:
      'Modular furniture manufacturers rely on repeatable panel sizing, clean edge banding, dependable adhesive bonding, and accurate knock-down hardware assembly. Modu Pro Innovation Pvt. Ltd. connects all four requirements under one roof—helping manufacturers coordinate Adhesi Pro adhesives, TCT & PCD blades, panel-processing equipment, and PVC edge-banding tapes & fittings through a single point of contact.',
    image: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/edge-banding-machine.png',
    statusBadge: 'REPEATABLE SIZING & KD ASSEMBLY',
    cardFootnote: 'Complete line coordination: adhesives, tooling, machinery & KD fittings',
    keyApplications: [
      'Wardrobe, storage carcass, and office workstation production',
      'Automated panel sizing, pre-milling, and PVC edge-banding workflows',
      'Knock-down (KD) panel assembly using Mini Fix, cam locks, nylon bushes, and hinges',
    ],
    relatedDivisions: [
      { name: 'Adhesi Pro', slug: 'adhesi-pro' },
      { name: 'Wood Working & Modular Furniture Tools', slug: 'pcd-blades' },
      { name: 'Panel Processing Machines Division', slug: 'panel-processing' },
      { name: 'PVC Edge-Banding Tapes & Hardware', slug: 'edge-banding-hardware' },
    ],
  },
  {
    id: 'modular-kitchen-manufacturing',
    sectorNumber: '02',
    name: 'Modular Kitchen Manufacturing',
    slug: 'modular-kitchen-manufacturing',
    tagline: 'Moisture-Conscious Carcass, Shutter & Drawer Engineering',
    description:
      'Kitchen cabinetry and shutters demand moisture-conscious adhesive selection, chip-free panel cutting, sealed PVC edges, and smooth-operating hinges and drawer channels. Our four divisions support modular kitchen manufacturers with relevant products and technical guidance tailored to their production line.',
    image: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/edge-banding-hardware/telescopic-drawer-channels.png',
    statusBadge: 'MOISTURE-CONSCIOUS PRODUCTION',
    cardFootnote: 'D3/PUR adhesives, chip-free pre-milling & soft-closing drawer channels',
    keyApplications: [
      'Carcass and shutter bonding with D3, Commercial D3, PVC/Acrylic, and PUR adhesives',
      'Chip-free pre-milling and grooving on laminated kitchen boards',
      'Telescopic drawer channels, 2D/3D concealed hinges, and colour-matched PVC edge tapes',
    ],
    relatedDivisions: [
      { name: 'Adhesi Pro', slug: 'adhesi-pro' },
      { name: 'Wood Working & Modular Furniture Tools', slug: 'pcd-blades' },
      { name: 'Panel Processing Machines Division', slug: 'panel-processing' },
      { name: 'PVC Edge-Banding Tapes & Hardware', slug: 'edge-banding-hardware' },
    ],
  },
  {
    id: 'door-manufacturing',
    sectorNumber: '03',
    name: 'Door Manufacturing',
    slug: 'door-manufacturing',
    tagline: 'Flush Door, Decorative Laminate & Skin Pressing Lines',
    description:
      'Door manufacturers require consistent platen pressing, reliable wood and skin bonding, and accurate perimeter sizing and surface routing. Modu Pro supports door production units with Adhesi Pro adhesives (including Lockpro WR 3, Lockpro 808, and 1K PUR), hydraulic cold/hot-press machines, dual-spindle CNC routers, and panel-saw blades.',
    image: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/hydraulic-cold-press.png',
    statusBadge: 'HYDRAULIC PRESSING & BONDING',
    cardFootnote: 'Platen cold/hot-press machines, 1K PUR structural bonding & CNC routers',
    keyApplications: [
      'Flush door and decorative laminate door pressing on hydraulic presses',
      'Structural core, frame, and skin bonding with Adhesi Pro adhesives',
      'Automated CNC door surface routing and precision edge sizing',
    ],
    relatedDivisions: [
      { name: 'Adhesi Pro', slug: 'adhesi-pro' },
      { name: 'Wood Working & Modular Furniture Tools', slug: 'pcd-blades' },
      { name: 'Panel Processing Machines Division', slug: 'panel-processing' },
    ],
  },
  {
    id: 'woodworking-and-panel-processing',
    sectorNumber: '04',
    name: 'Woodworking and Panel Processing',
    slug: 'woodworking-and-panel-processing',
    tagline: 'High-Volume Commercial Sizing, Nesting & Edge Banding',
    description:
      'For dedicated panel-processing centers and commercial woodworking businesses, machine uptime and tooling precision are paramount. Modu Pro provides sliding table panel saws, automatic edge banders, CNC nesting machines, multi-boring equipment, TCT/PCD saw blades, adhesives, and ongoing maintenance and spare-parts support.',
    image: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/cnc-nesting-machine.png',
    statusBadge: 'HIGH-UPTIME PROCESSING LINES',
    cardFootnote: 'Automated CNC nesting routers, panel saws, PCD saw blades & technical service',
    keyApplications: [
      'High-volume sheet cutting, nesting, grooving, and edge banding',
      'TCT and PCD blade selection for laminated boards, MDF, and plywood',
      'Machinery installation, preventive maintenance, repairs, and spare parts',
    ],
    relatedDivisions: [
      { name: 'Panel Processing Machines Division', slug: 'panel-processing' },
      { name: 'Wood Working & Modular Furniture Tools', slug: 'pcd-blades' },
      { name: 'Adhesi Pro', slug: 'adhesi-pro' },
      { name: 'PVC Edge-Banding Tapes & Hardware', slug: 'edge-banding-hardware' },
    ],
  },
];

export default function Industries() {
  const prefersReducedMotion = useReducedMotion();
  const [industries, setIndustries] = useState(DEFAULT_SECTORS);
  const [activeSector, setActiveSector] = useState(DEFAULT_SECTORS[0].slug);

  useEffect(() => {
    let active = true;
    publicApi
      .getIndustries()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          const merged = DEFAULT_SECTORS.map((def, i) => {
            const apiItem = data.find((d) => d.slug === def.slug) || data[i];
            if (!apiItem) return def;
            return {
              ...def,
              name: apiItem.name || def.name,
              description: apiItem.description || def.description,
              image: apiItem.image || def.image,
              keyApplications:
                apiItem.keyApplications && apiItem.keyApplications.length > 0
                  ? apiItem.keyApplications
                  : def.keyApplications,
              relatedDivisions:
                apiItem.relatedDivisions && apiItem.relatedDivisions.length > 0
                  ? apiItem.relatedDivisions.map((rd) => ({
                      name: rd.name || rd.slug,
                      slug: rd.slug || 'adhesi-pro',
                    }))
                  : def.relatedDivisions,
            };
          });
          setIndustries(merged);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Track the active sector currently in viewport as the user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 240;
      for (let i = industries.length - 1; i >= 0; i--) {
        const el = document.getElementById(industries[i].slug);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSector(industries[i].slug);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [industries]);

  const scrollToSector = (slug) => {
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fadeUp = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 },
      };

  return (
    <>
      <SeoHead
        title="Industries We Serve"
        description="Modu Pro Innovation Pvt. Ltd. connects industrial adhesives, precision cutting tools, panel-processing machinery, and furniture hardware across four core manufacturing sectors."
        canonicalPath="/industries"
      />

      {/* 1. Page Hero with High-Visibility Background Banner */}
      <section className="relative -mt-[76px] pt-[76px] overflow-hidden hero-banner-dark min-h-[72svh] flex items-center border-b border-[#D9C08B]/20">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/industries-hero-banner.jpeg"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                'https://www.globalwoodmarketsinfo.com/wp-content/uploads/2023/05/ai.jpeg';
            }}
            alt="Modern Industrial Woodworking Factory Floor"
            fetchPriority="high"
            width="1920"
            height="820"
            className="w-full h-full object-cover object-center brightness-90 contrast-105"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#0A1428]/80 via-[#0A1428]/40 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0A1428]/60 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0A1428]/70 to-transparent"
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl space-y-5 bg-[#0A1428]/40 backdrop-blur-[2px] p-6 sm:p-8 rounded-3xl border border-[#D9C08B]/20">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-[1.75rem] bg-[#0A1428]/80 border border-[#D9C08B]/40 backdrop-blur-md">
              <span className="font-mono-code text-xs uppercase tracking-[0.22em] text-[#D9C08B]">
                Industrial Sectors
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F4EEDF] leading-tight drop-shadow-[0_4px_18px_rgba(10,20,40,0.95)]">
              Industries We Serve
            </h1>
            <div className="w-20 h-[1.5px] bg-[#D9C08B]" />
            <p className="text-base sm:text-lg text-[#F4EEDF] leading-relaxed drop-shadow-[0_2px_12px_rgba(10,20,40,0.98)] font-medium">
              Modu Pro Innovation Pvt. Ltd. connects industrial adhesives, precision cutting tools,
              panel-processing machinery, and furniture hardware to support four core manufacturing
              sectors.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Stacked Sticky Step Headers & 2-Column Sector Showcase (Huddle Architecture) */}
      <section className="relative py-8 sm:py-20 bg-[#0A1428]">
        {/* Mobile Horizontal Sticky Sector Nav (lg:hidden) */}
        <div className="lg:hidden sticky top-[60px] sm:top-[68px] z-30 w-full bg-[#16294D]/95 backdrop-blur-md border-b border-[#D9C08B]/30 px-3 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2">
          {industries.map((ind, i) => (
            <button
              key={ind.slug}
              type="button"
              onClick={() => scrollToSector(ind.slug)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-mono-code uppercase tracking-wider transition-colors ${
                activeSector === ind.slug
                  ? 'bg-[#D9C08B] text-[#0A1428] font-semibold shadow-md'
                  : 'bg-[#0A1428] text-[#F4EEDF]/80 border border-[#D9C08B]/25'
              }`}
            >
              0{i + 1} • {ind.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Single continuous container ensures sticky headers stack cleanly together on desktop */}
        <div className="relative">
          {industries.map((industry, idx) => {
            const isActive = activeSector === industry.slug;
            const stickyTop = 72 + idx * 46;

            return (
              <React.Fragment key={industry.slug}>
                {/* Sticky Step Header on Desktop */}
                <div
                  onClick={() => scrollToSector(industry.slug)}
                  style={{ top: `${stickyTop}px` }}
                  className={`hidden lg:block sticky z-30 w-full py-3 px-4 sm:px-8 border-y cursor-pointer transition-all duration-300 backdrop-blur-xl ${
                    isActive
                      ? 'bg-[#16294D] border-[#D9C08B]/70 text-[#D9C08B] shadow-2xl'
                      : 'bg-[#0A1428]/95 border-[#D9C08B]/20 text-[#F4EEDF]/75 hover:bg-[#16294D]/75 hover:text-[#D9C08B] hover:border-[#D9C08B]/50'
                  }`}
                >
                  <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 font-mono-code text-xs uppercase tracking-[0.22em] font-semibold">
                      <span
                        className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                          isActive
                            ? 'bg-[#22C55E] ring-4 ring-[#22C55E]/20'
                            : 'bg-[#D9C08B]/50'
                        }`}
                      />
                      <span>
                        SECTOR 0{idx + 1} • {industry.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono-code text-[10px] uppercase tracking-[0.2em]">
                      {isActive ? (
                        <span className="text-[#22C55E] font-bold inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                          CURRENT SECTOR
                        </span>
                      ) : (
                        <span className="text-[#D9C08B]/80 hover:text-[#D9C08B] hidden sm:inline-flex items-center gap-1">
                          CLICK TO VIEW SECTOR 0{idx + 1} →
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sector 2-Column Content Section */}
                <div
                  id={industry.slug}
                  style={{
                    scrollMarginTop: `${84 + industries.length * 46}px`,
                  }}
                  className="pt-10 pb-20 sm:pt-14 sm:pb-28"
                >
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                      {...fadeUp}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
                    >
                      {/* Left Column (7 cols): Heading, Description, Workflow Box, Division Tags & Primary Pill CTA */}
                      <div className="lg:col-span-7 space-y-6">
                        <div className="space-y-3">
                          <span className="font-mono-code text-[11px] uppercase tracking-[0.22em] text-[#D9C08B]/80">
                            Manufacturing Sector 0{idx + 1}
                          </span>
                          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F4EEDF] leading-tight">
                            {industry.name}
                          </h2>
                          <p className="text-sm sm:text-base text-[#F4EEDF]/85 leading-relaxed">
                            {industry.description}
                          </p>
                        </div>

                        {/* Typical Production Workflows Supported Card */}
                        {industry.keyApplications && industry.keyApplications.length > 0 && (
                          <div className="bg-[#16294D] border border-[#D9C08B]/20 rounded-2xl p-5 sm:p-6 space-y-3 shadow-lg">
                            <div className="flex items-center gap-2 font-mono-code text-[11px] uppercase tracking-[0.2em] text-[#D9C08B]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#D9C08B]" />
                              <span>Typical Production Workflows Supported</span>
                            </div>
                            <ul className="space-y-2 text-xs sm:text-sm text-[#F4EEDF]/85">
                              {industry.keyApplications.map((app) => (
                                <li key={app} className="flex items-start gap-2.5">
                                  <span className="text-[#D9C08B] mt-1 shrink-0">•</span>
                                  <span>{app}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Relevant Modu Pro Divisions (100px radius pill tags) */}
                        {industry.relatedDivisions && industry.relatedDivisions.length > 0 && (
                          <div className="space-y-2.5 pt-1">
                            <p className="font-mono-code text-[10px] uppercase tracking-[0.2em] text-[#F4EEDF]/60">
                              Relevant Modu Pro Divisions:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {industry.relatedDivisions.map((div) => (
                                <Link
                                  key={div.slug}
                                  to={`/divisions/${div.slug}`}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#D9C08B]/40 bg-[#0A1428] text-xs text-[#F4EEDF] hover:border-[#D9C08B] hover:text-[#D9C08B] transition-colors"
                                >
                                  <span className="text-[#D9C08B] text-[10px]">✦</span>
                                  <span>{div.name}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Primary Pill Button (1000px border-radius fully rounded) */}
                        <div className="pt-2">
                          <Link
                            to={`/contact?product=${encodeURIComponent(industry.name)}`}
                            className="inline-flex items-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-[0.16em] sm:tracking-[0.2em] hover:bg-[#F4EEDF] transition-colors shadow-xl group"
                          >
                            <span className="hidden sm:inline">Discuss Your {industry.name} Requirement</span>
                            <span className="sm:hidden">Discuss Sector Requirements</span>
                            <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                          </Link>
                        </div>
                      </div>

                      {/* Right Column (5 cols): Large 32px-Rounded Feature Card with Status Pill & Showcase Visual */}
                      <div className="lg:col-span-5 relative">
                        <div className="relative rounded-[2rem] border border-[#D9C08B]/25 bg-[#16294D] p-6 sm:p-8 overflow-hidden shadow-2xl min-h-[380px] sm:min-h-[420px] flex flex-col justify-between">
                          {/* Top Status Pill Bar */}
                          <div className="flex items-center justify-between z-10">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A1428]/80 border border-[#D9C08B]/30 font-mono-code text-[10px] uppercase tracking-[0.2em] text-[#D9C08B]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                              {industry.statusBadge || 'PRODUCTION READY'}
                            </span>
                            <span className="font-mono-code text-[10px] uppercase tracking-widest text-[#F4EEDF]/50">
                              SECTOR 0{idx + 1}
                            </span>
                          </div>

                          {/* Centered Machine / Product Showcase Image */}
                          <div className="my-6 flex items-center justify-center z-0">
                            <img
                              src={industry.image}
                              alt={industry.name}
                              className="max-h-56 sm:max-h-64 w-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] transform hover:scale-105 transition-transform duration-500"
                            />
                          </div>

                          {/* Floating Bottom Card / Category Tile */}
                          <div className="z-10 bg-[#0A1428]/90 backdrop-blur-md border border-[#D9C08B]/30 rounded-2xl p-4 shadow-xl">
                            <div className="flex items-center gap-2 font-mono-code text-[10px] uppercase tracking-[0.2em] text-[#D9C08B] mb-1">
                              <span className="text-xs">●</span>
                              <span>MODU PRO INTEGRATED SOLUTION</span>
                            </div>
                            <p className="text-xs font-semibold text-[#F4EEDF]">
                              {industry.cardFootnote ||
                                `Complete technical consultation & single-source procurement for ${industry.name}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </section>
    </>
  );
}
