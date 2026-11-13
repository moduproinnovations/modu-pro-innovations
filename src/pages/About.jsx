import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowRight,
  Layers,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Activity,
  Cpu,
  Factory,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import SeoHead from '../components/SeoHead';

export default function About() {
  const { siteSettings, divisions } = useSite();
  const prefersReducedMotion = useReducedMotion();
  const [hoveredDivision, setHoveredDivision] = useState(null);

  const divisionList =
    divisions && divisions.length > 0
      ? divisions.map((d, idx) => ({
          code: d.code || `0${idx + 1}`,
          name:
            (d.slug === 'adhesi-pro' || d.slug === 'adhhesi-pro') && siteSettings?.adhesiBrandSpelling
              ? siteSettings.adhesiBrandSpelling
              : d.name,
          slug: d.slug,
          category: d.subtitle || 'Modu Pro Division',
          shortDescription: d.shortDescription,
          heroImage: d.heroImage,
          tagline:
            (d.slug === 'adhesi-pro' || d.slug === 'adhhesi-pro')
              ? 'Har Joint Mein Pro Strength • D3 & PUR Adhesives'
              : d.slug === 'pcd-blades'
              ? 'PCD Diamond Tooling • Saw Blades & Pre-Milling'
              : d.slug === 'panel-processing'
              ? 'CNC Nesting, Edge Banding & Sizing Lines'
              : 'PVC Edge Finishes & Architectural Cabinet Fittings',
        }))
      : [
          {
            code: '01',
            name: siteSettings?.adhesiBrandSpelling || 'Adhhesi Pro',
            slug: 'adhesi-pro',
            category: 'Industrial Woodworking & Modular Furniture Adhesives',
            shortDescription:
              'Adhhesi Pro is the adhesive brand associated with Modu Pro Innovation Pvt. Ltd. The product range supports furniture, modular-kitchen, door and woodworking applications.',
            heroImage: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/adhesi-pro/lockpro-wr3-drum.png',
            tagline: 'Har Joint Mein Pro Strength • D3 & PUR Adhesives',
          },
          {
            code: '02',
            name: 'Wood Working & Modular Furniture Tools',
            slug: 'pcd-blades',
            category: 'PCD Pre-Milling & Grooving Saw Blades',
            shortDescription:
              'Types of Tools: Brazed Tooling, Replaceable Tooling, CNC Router Bits, Saw Blades, PCD Tools, Multi-Boring Bits.',
            heroImage: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/pcd-blades/pre-milling-cutters.png',
            tagline: 'PCD Diamond Tooling • Saw Blades & Pre-Milling',
          },
          {
            code: '03',
            name: 'Panel Processing Machines Division',
            slug: 'panel-processing',
            category: 'Woodworking Machinery, Spare Parts & Technical Service Support',
            shortDescription:
              'Modu Pro Innovation Pvt. Ltd. supports woodworking operations with panel-processing machinery, related spare parts and service support.',
            heroImage: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/cnc-nesting-machine.png',
            tagline: 'CNC Nesting, Edge Banding & Sizing Lines',
          },
          {
            code: '04',
            name: 'PVC Edge-Banding Tapes & Hardware',
            slug: 'edge-banding-hardware',
            category: 'Edge-Banding Finishes & Modular Furniture Fittings',
            shortDescription:
              'This division brings together PVC edge-banding tapes and selected furniture fittings used in modular furniture and kitchen applications.',
            heroImage: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/edge-banding-hardware/pvc-woodgrain-tape.png',
            tagline: 'PVC Edge Finishes & Architectural Cabinet Fittings',
          },
        ];

  return (
    <div className="relative bg-[#0A1428] text-[#F4EEDF] overflow-x-hidden min-h-screen">
      <SeoHead
        title="About Us"
        description={siteSettings?.aboutContent?.overviewParagraphOne}
        canonicalPath="/about"
      />

      {/* 1. STRUCTURAL 12-COLUMN BACKGROUND GRID (PERSISTENT BEHIND CONTENT) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-8 grid grid-cols-12 gap-0 h-full"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-full border-r border-[#D9C08B]/[0.06] first:border-l first:border-[#D9C08B]/[0.06]"
          />
        ))}
      </div>

      {/* 2. GLOBAL NOISE TEXTURE OVERLAY */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10 noise-overlay opacity-40 mix-blend-overlay"
      />

      {/* MAIN CONTENT WRAPPER (Z-20 ABOVE GRID & NOISE) */}
      <div className="relative z-20">

        {/* 3. SPLIT HERO SECTION (12 COLS: 7 LEFT / 5 RIGHT) */}
        <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 border-b border-[#D9C08B]/20">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-stretch">
              
              {/* Left Column (7 cols): Editorial Stack */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-8 pr-0 lg:pr-8">
                <div className="space-y-6">
                  {/* Status Indicator */}
                  <div className="inline-flex items-center gap-3 px-3.5 py-1.5 border border-[#D9C08B]/30 bg-[#16294D]/60 backdrop-blur-md">
                    <span className="status-pulse-dot" />
                    <span className="font-mono-code text-[10px] font-bold uppercase tracking-[0.28em] text-[#D9C08B]">
                      FACILITY ACTIVE • MODU PRO INNOVATION HQ
                    </span>
                  </div>

                  {/* Modern Precision Hero Heading */}
                  <div className="space-y-2">
                    <h1 className="font-display text-4xl xs:text-5xl sm:text-6xl lg:text-[5.2rem] font-bold tracking-tight text-[#F4EEDF] leading-[1.02]">
                      Precision Engineering &amp; Machinery{' '}
                      <span className="text-[#D9C08B] block mt-1 sm:mt-2">
                        at Industrial Scale.
                      </span>
                    </h1>
                  </div>

                  {/* Technical Readout Labels (10px Mono) */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 font-mono-code text-[10px] font-semibold uppercase tracking-[0.25em] text-[#F4EEDF]/60">
                    <span className="text-[#D9C08B]">[LAT 21.1458° N]</span>
                    <span>[LON 79.0882° E]</span>
                    <span>[SYSTEM: 04 DIVISIONS]</span>
                    <span className="text-[#22C55E]">[STATUS: 100% OPERATIONAL]</span>
                  </div>

                  {/* Editorial Body Text */}
                  <p className="text-base sm:text-lg text-[#F4EEDF]/85 leading-relaxed max-w-2xl font-inter">
                    {siteSettings?.aboutContent?.overviewParagraphOne ||
                      'Modu Pro Innovation Pvt. Ltd. serves modular furniture, kitchen, door and woodworking manufacturers through a focused industrial range. The company brings together industrial adhesives, precision tooling, panel-processing machinery and architectural hardware under one single enterprise.'}
                  </p>
                </div>

                {/* Rectangular Industrial CTA Button */}
                <div className="pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                  <a
                    href="#divisions-directory"
                    className="group inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#D9C08B] text-[#0A1428] font-inter text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] border border-[#D9C08B] hover:bg-transparent hover:text-[#D9C08B] cubic-inertia duration-300"
                  >
                    <span>EXPLORE 4 DIVISIONS</span>
                    <ArrowRight
                      aria-hidden="true"
                      className="w-4 h-4 transform group-hover:translate-x-1.5 cubic-inertia duration-300"
                    />
                  </a>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#16294D] text-[#F4EEDF] font-inter text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] border border-[#D9C08B]/30 hover:border-[#D9C08B] hover:text-[#D9C08B] cubic-inertia duration-300"
                  >
                    <span>CONTACT FACILITY</span>
                    <ArrowUpRight aria-hidden="true" className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column (5 cols): Grayscale Factory Frame & Glassmorphic Telemetry Card */}
              <div className="lg:col-span-5 relative flex flex-col justify-center">
                <div className="relative border border-[#D9C08B]/30 bg-[#16294D]/40 p-4 sm:p-5">
                  {/* Internal Frame */}
                  <div className="relative overflow-hidden border border-[#D9C08B]/20 bg-[#0A1428] h-[360px] sm:h-[440px] lg:h-[480px]">
                    <img
                      src="/assets/full backgorund banners/Panel Processing Machines Division.png"
                      alt="Modu Pro Innovation Production Line"
                      className="w-full h-full object-cover grayscale contrast-125 opacity-75 transform hover:scale-105 cubic-inertia duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1428] via-[#0A1428]/40 to-transparent" />

                    {/* Technical Readout HUD Overlay */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between font-mono-code text-[10px] uppercase tracking-[0.2em] text-[#D9C08B] bg-[#0A1428]/85 px-3 py-1.5 border border-[#D9C08B]/30 backdrop-blur-sm">
                      <span>SYS_VIEW // LINE-03</span>
                      <span className="flex items-center gap-1.5 text-[#22C55E]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                        STREAM ACTIVE
                      </span>
                    </div>

                    {/* Bottom Telemetry Card (Glassmorphism with Progress Bars) */}
                    <div className="absolute bottom-4 left-4 right-4 bg-[#16294D]/90 backdrop-blur-md border border-[#D9C08B]/35 p-4 space-y-3 shadow-2xl">
                      <div className="flex items-center justify-between font-mono-code text-[10px] uppercase tracking-[0.22em] text-[#D9C08B]">
                        <span>TELEMETRY METRICS</span>
                        <span>MODU_PRO_CORE</span>
                      </div>

                      <div className="space-y-2 font-mono-code text-[10px] text-[#F4EEDF]/80">
                        {/* Status bar 1 */}
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>ADHESIVE BOND RETENTION</span>
                            <span className="text-[#D9C08B]">99.8%</span>
                          </div>
                          <div className="w-full h-1 bg-[#0A1428] overflow-hidden">
                            <div className="h-full bg-[#D9C08B] w-[99.8%]" />
                          </div>
                        </div>

                        {/* Status bar 2 */}
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>TOOLING CUTTING TOLERANCE</span>
                            <span className="text-[#22C55E]">±0.01 MM</span>
                          </div>
                          <div className="w-full h-1 bg-[#0A1428] overflow-hidden">
                            <div className="h-full bg-[#22C55E] w-[96%]" />
                          </div>
                        </div>

                        {/* Status bar 3 */}
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>MACHINERY SIZING ACCURACY</span>
                            <span className="text-[#D9C08B]">DIN CERTIFIED</span>
                          </div>
                          <div className="w-full h-1 bg-[#0A1428] overflow-hidden">
                            <div className="h-full bg-[#38BDF8] w-[98%]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. MARQUEE TICKER (120px HEIGHT, CONTINUOUS RAPID LOOP) */}
        <section className="relative overflow-hidden h-[110px] sm:h-[120px] bg-[#16294D] border-b border-[#D9C08B]/25 flex items-center">
          <div className="flex whitespace-nowrap overflow-hidden select-none w-full">
            <motion.div
              animate={prefersReducedMotion ? {} : { x: ['0%', '-50%'] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 24 }}
              className="flex items-center gap-8 font-display text-3xl sm:text-5xl font-semibold uppercase tracking-wider text-[#F4EEDF] shrink-0"
            >
              <span className="text-[#D9C08B]">MODU PRO INNOVATION</span>
              <span className="text-[#D9C08B]/60 text-xl">✦</span>
              <span>ADHHESI PRO™ Adhesives</span>
              <span className="text-[#D9C08B]/60 text-xl">✦</span>
              <span className="text-[#F4EEDF]/80">Woodworking Tools</span>
              <span className="text-[#D9C08B]/60 text-xl">✦</span>
              <span className="text-[#D9C08B]">Panel Processing Machinery</span>
              <span className="text-[#D9C08B]/60 text-xl">✦</span>
              <span>PVC Edge Tapes &amp; Hardware</span>
              <span className="text-[#D9C08B]/60 text-xl">✦</span>
              <span className="text-[#F4EEDF]/80">Industrial Woodworking Solutions</span>
              <span className="text-[#D9C08B]/60 text-xl">✦</span>

              {/* Second duplicate set for seamless infinite loop */}
              <span className="text-[#D9C08B]">MODU PRO INNOVATION</span>
              <span className="text-[#D9C08B]/60 text-xl">✦</span>
              <span>ADHHESI PRO™ Adhesives</span>
              <span className="text-[#D9C08B]/60 text-xl">✦</span>
              <span className="text-[#F4EEDF]/80">Woodworking Tools</span>
              <span className="text-[#D9C08B]/60 text-xl">✦</span>
              <span className="text-[#D9C08B]">Panel Processing Machinery</span>
              <span className="text-[#D9C08B]/60 text-xl">✦</span>
              <span>PVC Edge Tapes &amp; Hardware</span>
              <span className="text-[#D9C08B]/60 text-xl">✦</span>
              <span className="text-[#F4EEDF]/80">Industrial Woodworking Solutions</span>
              <span className="text-[#D9C08B]/60 text-xl">✦</span>
            </motion.div>
          </div>
        </section>

        {/* 5. INTERACTIVE PROJECT / DIVISION LIST (CLIP-PATH REVEAL & CUBIC INERTIA) */}
        <section id="divisions-directory" className="relative py-20 sm:py-28 border-b border-[#D9C08B]/20">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 border-b border-[#D9C08B]/20 pb-6 gap-4">
              <div>
                <p className="font-mono-code text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9C08B]">
                  OPERATIONAL DIRECTORY // 04 DIVISIONS
                </p>
                <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-[#F4EEDF] mt-1">
                  Core Business Divisions
                </h2>
              </div>
              <p className="font-mono-code text-[11px] text-[#F4EEDF]/60 max-w-sm sm:text-right">
                [HOVER ROW TO REVEAL TECHNICAL SPECIFICATION AND PRODUCT SHOWCASE]
              </p>
            </div>

            {/* Vertical Stack of Rows */}
            <div className="divide-y divide-[#D9C08B]/20 border-t border-[#D9C08B]/20">
              {divisionList.map((div, index) => {
                const isHovered = hoveredDivision === div.slug;
                return (
                  <Link
                    key={div.slug}
                    to={`/divisions/${div.slug}`}
                    onMouseEnter={() => setHoveredDivision(div.slug)}
                    onMouseLeave={() => setHoveredDivision(null)}
                    className="group relative block min-h-[200px] sm:min-h-[240px] py-8 sm:py-10 px-4 sm:px-8 transition-colors duration-300 hover:bg-[#16294D]/30"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      
                      {/* Left: Code & Titles (8 cols) */}
                      <div className="lg:col-span-8 space-y-3 z-10">
                        <div className="flex items-center gap-4 font-mono-code text-xs uppercase tracking-[0.25em] text-[#D9C08B]">
                          <span>DIVISION {div.code}</span>
                          <span className="text-[#F4EEDF]/30">•</span>
                          <span className="text-[#F4EEDF]/70">{div.category}</span>
                        </div>

                        <h3 className="font-display text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F4EEDF] group-hover:text-[#D9C08B] transition-colors duration-300">
                          {div.name}
                        </h3>

                        <p className="text-sm sm:text-base text-[#F4EEDF]/75 max-w-2xl font-inter line-clamp-2">
                          {div.shortDescription}
                        </p>

                        <div className="pt-1 font-mono-code text-[10px] uppercase tracking-[0.2em] text-[#D9C08B]/80">
                          {div.tagline}
                        </div>

                        {/* Mobile Visual Preview */}
                        <div className="md:hidden flex items-center gap-3 pt-3">
                          <div className="w-16 h-16 rounded-xl bg-[#0A1428] border border-[#D9C08B]/25 p-1.5 flex items-center justify-center shrink-0">
                            <img
                              src={div.heroImage}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <span className="font-mono-code text-[11px] text-[#D9C08B] inline-flex items-center gap-1">
                            Inspect Division <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Right: Floating View Pill / Arrow Action (4 cols) */}
                      <div className="lg:col-span-4 flex items-center justify-end gap-4 z-10">
                        <div className="hidden sm:inline-flex items-center gap-3 font-mono-code text-[11px] font-bold uppercase tracking-[0.25em] text-[#D9C08B] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span>INSPECT DIVISION</span>
                        </div>
                        <div className="w-14 h-14 rounded-full border border-[#D9C08B] bg-[#0A1428] text-[#D9C08B] group-hover:bg-[#D9C08B] group-hover:text-[#0A1428] flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-45 cubic-inertia duration-500 shadow-xl">
                          <ArrowUpRight aria-hidden="true" className="w-5 h-5" />
                        </div>
                      </div>

                    </div>

                    {/* Clip-Path Image Reveal on Hover (From Right to Left) */}
                    <div
                      aria-hidden="true"
                      style={{
                        clipPath: isHovered ? 'inset(0 0 0 0)' : 'inset(0 0 0 100%)',
                        transition:
                          'clip-path 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      className="absolute right-0 top-0 bottom-0 w-full sm:w-[480px] lg:w-[560px] pointer-events-none overflow-hidden z-0 hidden md:block"
                    >
                      <div className="relative w-full h-full flex items-center justify-center p-6 bg-gradient-to-l from-[#16294D] via-[#16294D]/90 to-transparent">
                        <img
                          src={div.heroImage}
                          alt={div.name}
                          className="max-h-[85%] max-w-[85%] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] filter grayscale group-hover:grayscale-0 cubic-inertia duration-500"
                        />
                        <div className="absolute inset-0 bg-[#0066FF]/10 mix-blend-multiply pointer-events-none" />
                      </div>
                    </div>

                  </Link>
                );
              })}
            </div>

          </div>
        </section>

        {/* 6. PHILOSOPHICAL EDITORIAL & PARALLAX SECTION */}
        <section className="relative py-20 sm:py-32 bg-[#16294D]/30 border-b border-[#D9C08B]/20">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Massive Editorial Headline */}
              <div className="lg:col-span-8 space-y-6">
                <p className="font-mono-code text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9C08B]">
                  OPERATIONAL PHILOSOPHY // INTEGRATION
                </p>
                <blockquote className="font-display text-3xl sm:text-5xl lg:text-5xl font-medium text-[#F4EEDF] leading-[1.18] tracking-tight">
                  &ldquo;Bringing related woodworking products &amp; machinery under one single business enterprise.&rdquo;
                </blockquote>
                <p className="text-base sm:text-lg text-[#F4EEDF]/80 max-w-2xl font-inter leading-relaxed">
                  {siteSettings?.aboutContent?.approachText ||
                    'Rather than forcing manufacturers to juggle fragmented vendors for adhesives, cutting tools, machinery, and cabinet hardware, Modu Pro coordinates all four critical nodes through a unified technical consultation pipeline.'}
                </p>
              </div>

              {/* Manufacturing Sectors Matrix */}
              <div className="lg:col-span-4 bg-[#0A1428] border border-[#D9C08B]/30 p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between border-b border-[#D9C08B]/20 pb-3">
                  <span className="font-mono-code text-[10px] font-bold uppercase tracking-[0.25em] text-[#D9C08B]">
                    TARGET SECTORS [04]
                  </span>
                  <span className="status-pulse-dot" />
                </div>

                <div className="space-y-3 font-inter text-sm">
                  {[
                    { id: '01', title: 'Modular Furniture Manufacturers' },
                    { id: '02', title: 'Modular Kitchen Manufacturers' },
                    { id: '03', title: 'Commercial Door Manufacturers' },
                    { id: '04', title: 'Woodworking & Panel Processors' },
                  ].map((sec) => (
                    <div
                      key={sec.id}
                      className="p-3 border border-[#D9C08B]/15 bg-[#16294D]/40 flex items-center justify-between hover:border-[#D9C08B]/40 cubic-inertia duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono-code text-xs text-[#D9C08B]">{sec.id}</span>
                        <span className="text-[#F4EEDF]/90 font-medium">{sec.title}</span>
                      </div>
                      <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-[#D9C08B]" />
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Link
                    to="/industries"
                    className="inline-flex items-center gap-2 font-mono-code text-[10px] font-bold uppercase tracking-[0.25em] text-[#D9C08B] hover:underline"
                  >
                    <span>VIEW INDUSTRY APPLICATIONS</span>
                    <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 7. TECHNICAL JOURNAL / SPECIFICATIONS GRID (4-COLUMN INDUSTRIAL CARDS) */}
        <section className="relative py-20 sm:py-28 border-b border-[#D9C08B]/20">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 border-b border-[#D9C08B]/20 pb-6 gap-4">
              <div>
                <p className="font-mono-code text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9C08B]">
                  ENGINEERING RIGOR // TECHNICAL JOURNAL
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#F4EEDF] mt-1">
                  Technical Specifications
                </h2>
              </div>
              <p className="font-mono-code text-[11px] text-[#F4EEDF]/60">
                [VERIFIED AGAINST INTERNATIONAL INDUSTRIAL STANDARDS]
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  code: 'SPEC // 01',
                  icon: Sparkles,
                  title: 'Adhesive Formulation',
                  subtitle: 'DIN/EN 204 Certified Bonding',
                  desc: 'Waterproof D3 PVAc emulsions and 1K PUR moisture-curing adhesives formulated for tropical humidity resistance and high-tensile joint security.',
                },
                {
                  code: 'SPEC // 02',
                  icon: Wrench,
                  title: 'Tooling Tolerances',
                  subtitle: 'Dynamic Balancing to 18,000 RPM',
                  desc: 'Precision PCD diamond tips and micro-grain carbide teeth engineered for chip-free panel pre-milling and mirror edge cut quality on laminated boards.',
                },
                {
                  code: 'SPEC // 03',
                  icon: Cpu,
                  title: 'Machinery Calibration',
                  subtitle: 'CNC & Automated Sizing Lines',
                  desc: 'Dual-spindle CNC nesting machines, high-speed edge banders, and hydraulic cold presses supported with scheduled maintenance and factory spares.',
                },
                {
                  code: 'SPEC // 04',
                  icon: ShieldCheck,
                  title: 'Hardware Integrity',
                  subtitle: 'High Cycle Fatigue Ratings',
                  desc: 'Concealed auto-cup hinges, hydraulic flap stays, and cam-lock connectors engineered for consistent load-bearing cycles in modular cabinetry.',
                },
              ].map((card) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={card.code}
                    className="border border-[#D9C08B]/20 bg-[#16294D]/35 p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-[#D9C08B]/50 hover:bg-[#16294D]/60 cubic-inertia duration-300"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono-code text-[10px] font-bold uppercase tracking-[0.25em] text-[#D9C08B]">
                          {card.code}
                        </span>
                        <div className="w-8 h-8 rounded border border-[#D9C08B]/30 flex items-center justify-center text-[#D9C08B]">
                          <IconComponent aria-hidden="true" className="w-4 h-4" />
                        </div>
                      </div>

                      <h3 className="font-display text-xl font-semibold tracking-tight text-[#F4EEDF]">
                        {card.title}
                      </h3>

                      <p className="font-mono-code text-[11px] text-[#D9C08B]/90">
                        {card.subtitle}
                      </p>

                      <p className="text-xs text-[#F4EEDF]/75 leading-relaxed font-inter">
                        {card.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#D9C08B]/15 flex items-center justify-between font-mono-code text-[9px] uppercase tracking-[0.2em] text-[#F4EEDF]/50">
                      <span>STATUS: APPROVED</span>
                      <span className="text-[#22C55E]">● VERIFIED</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* 8. MASSIVE EDITORIAL FOOTER & CTA SECTION WITH 18vw WATERMARK */}
        <section className="relative overflow-hidden pt-20 sm:pt-28 pb-12 bg-[#0A1428] border-b border-[#D9C08B]/20">
          
          {/* Massive Background Marquee Watermark */}
          <div
            aria-hidden="true"
            className="absolute -bottom-8 left-0 right-0 whitespace-nowrap pointer-events-none select-none overflow-hidden"
          >
            <div className="font-display text-[18vw] font-bold uppercase tracking-tight text-[#D9C08B]/[0.04] leading-none">
              MODU PRO INNOVATION
            </div>
          </div>

          <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Editorial Contact Banner */}
            <div className="max-w-4xl space-y-6">
              <p className="font-mono-code text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9C08B]">
                FACILITY CONTACT // CONSULTATION
              </p>
              
              <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F4EEDF] leading-[1.05]">
                Ready to Equip Your Woodworking Line?
              </h2>

              <p className="text-base sm:text-lg text-[#F4EEDF]/80 max-w-2xl font-inter leading-relaxed">
                Connect directly with our engineering and division specialists in Nagpur. We evaluate your substrate, tooling profile, and machine requirements to specify the exact industrial grade.
              </p>

              {/* Large-scale Contact Link */}
              <div className="pt-4">
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-3 sm:gap-4 text-xl sm:text-3xl lg:text-4xl font-display font-semibold text-[#D9C08B] hover:text-[#F4EEDF] transition-colors duration-300 border-b-2 border-[#D9C08B] pb-2 hover:border-[#F4EEDF]"
                >
                  <span>Start a Technical Consultation</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="w-6 h-6 sm:w-8 sm:h-8 transform group-hover:translate-x-3 transition-transform duration-300"
                  />
                </Link>
              </div>
            </div>

            {/* Bottom Technical Status Bar (10px Mono Tracking) */}
            <div className="pt-12 border-t border-[#D9C08B]/20 flex flex-col md:flex-row items-center justify-between gap-4 font-mono-code text-[10px] uppercase tracking-[0.25em] text-[#F4EEDF]/60">
              <div className="flex items-center gap-3">
                <span className="status-pulse-dot" />
                <span className="text-[#22C55E]">ALL ENTERPRISE SYSTEMS OPERATIONAL</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                <span>FACILITY: NAGPUR, MAHARASHTRA</span>
                <span>ATLAS_CONNECTED: TRUE</span>
                <span className="text-[#D9C08B]">&copy; {new Date().getFullYear()} MODU PRO INNOVATION PVT. LTD.</span>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
