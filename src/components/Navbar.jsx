import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  Building2,
  ChevronDown,
  Factory,
  Home,
  Layers,
  Mail,
  Menu,
  ShieldCheck,
  Wrench,
  X,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import MagnificationDock from './MagnificationDock';

const DEFAULT_DIVISION_LINKS = [
  {
    code: '01',
    name: 'Adhhesi Pro',
    slug: 'Adhhesi-pro',
    subtitle: 'PVAC, D3/D2, PVC/Acrylic & PUR Adhhesives',
    heroImage: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/Adhhesi-pro/lockpro-wr3-drum.png',
  },
  {
    code: '02',
    name: 'Wood Working & Modular Furniture Tools',
    slug: 'pcd-blades',
    subtitle: 'Panel Processing and Solid Wood Machine',
    heroImage: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/pcd-blades/pre-milling-cutters.png',
  },
  {
    code: '03',
    name: 'Panel Processing Machines Division',
    slug: 'panel-processing',
    subtitle: 'Edge Banders, CNC, Panel Saws & Presses',
    heroImage: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/edge-banding-machine.png',
  },
  {
    code: '04',
    name: 'PVC Edge-Banding Tapes & Hardware',
    slug: 'edge-banding-hardware',
    subtitle: 'PVC Edge Tapes, Hinges, Channels & KD Fittings',
    heroImage: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/edge-banding-hardware/pvc-woodgrain-tape.png',
  },
];

export default function Navbar() {
  const { siteSettings, divisions } = useSite();
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDivisionsExpanded, setMobileDivisionsExpanded] = useState(true);

  const dropdownRef = useRef(null);
  const mobileSheetRef = useRef(null);
  const mobileTriggerRef = useRef(null);

  const divisionList =
    divisions && divisions.length > 0
      ? divisions.map((d, idx) => ({
          code: d.code || `0${idx + 1}`,
          name:
            (d.slug === 'Adhhesi-pro' || d.slug === 'adhhesi-pro') && siteSettings?.AdhhesiBrandSpelling
              ? siteSettings.AdhhesiBrandSpelling
              : d.name,
          slug: d.slug,
          subtitle: d.subtitle || d.shortDescription,
          heroImage: d.heroImage || 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/edge-banding-machine.png',
        }))
      : DEFAULT_DIVISION_LINKS;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 28);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close desktop dropdown on outside click or Escape
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Toggle inert on <main> and focus mobile drawer sheet when opened (Modern Web Guidance: navigation-drawer)
  useEffect(() => {
    const mainEl = document.getElementById('main-content');
    if (mobileMenuOpen) {
      if (mainEl) mainEl.inert = true;
      mobileSheetRef.current?.focus();
    } else {
      if (mainEl) mainEl.inert = false;
    }
    return () => {
      if (mainEl) mainEl.inert = false;
    };
  }, [mobileMenuOpen]);

  const pathActive = (to, end = false) =>
    end
      ? location.pathname === to
      : location.pathname === to || location.pathname.startsWith(`${to}/`);

  const dockItems = [
    { icon: <Home size={18} />, label: 'Home', to: '/', end: true },
    { icon: <Building2 size={18} />, label: 'About', to: '/about' },
    { icon: <Layers size={18} />, label: 'Divisions', to: '/divisions', menu: true },
    { icon: <Factory size={18} />, label: 'Industries', to: '/industries' },
    { icon: <Wrench size={18} />, label: 'Services', to: '/services' },
    { icon: <Mail size={18} />, label: 'Contact', to: '/contact' },
  ].map((item) => {
    const active = item.menu
      ? pathActive('/divisions')
      : pathActive(item.to, item.end);
    return {
      icon: item.icon,
      label: item.label,
      className: active ? 'bg-[#D9C08B] text-[#0A1428]' : 'bg-[#0A1428]/75',
      onClick: () => {
        if (item.menu) {
          setDropdownOpen((open) => !open);
          return;
        }
        setDropdownOpen(false);
        navigate(item.to);
      },
    };
  });

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? 'bg-[#0A1428]/75 backdrop-blur-xl py-3 border-b border-[#D9C08B]/20'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo Lockup */}
        <Link
          to="/"
          className="flex items-center shrink-0 min-w-0 group"
          aria-label={`${siteSettings?.companyName || 'Modu Pro Innovation Pvt. Ltd.'} Home`}
        >
          <div className="bg-[#F4EEDF] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center justify-center shrink-0 border border-[#D9C08B]/40 group-hover:border-[#D9C08B] transition-all shadow-sm">
            <img
              src={siteSettings?.logoUrl || '/assets/logo/modu-pro-logo.png'}
              alt={siteSettings?.companyName || 'Modu Pro Innovation Pvt. Ltd.'}
              className="h-7 sm:h-8 lg:h-9 w-auto object-contain"
            />
          </div>
        </Link>

        <div
          ref={dropdownRef}
          className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 min-[1160px]:block"
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <MagnificationDock
            items={dockItems}
            panelHeight={58}
            baseItemSize={42}
            magnification={62}
            distance={120}
          />
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                id="desktop-divisions-menu"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-1/2 top-full w-[38rem] -translate-x-1/2 pt-4"
              >
                <div className="rounded-[1.75rem] bg-[#16294D] border border-[#D9C08B]/30 shadow-[0_24px_60px_-15px_rgba(10,20,40,0.85)] p-6">
                  <div className="mb-4 flex items-center justify-between pb-3 border-b border-[#D9C08B]/15">
                    <span className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
                      Four Focused Business Divisions
                    </span>
                    <Link
                      to="/divisions"
                      className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-[#F4EEDF]/80 hover:text-[#D9C08B]"
                    >
                      Overview <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {divisionList.map((div) => (
                      <Link
                        key={div.slug}
                        to={`/divisions/${div.slug}`}
                        className="group flex items-start gap-3.5 rounded-2xl bg-[#0A1428]/55 border border-[#D9C08B]/15 hover:border-[#D9C08B]/40 p-3.5 transition-colors hover:bg-[#0A1428]"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#16294D] p-1.5">
                          <img
                            src={div.heroImage}
                            alt=""
                            fetchPriority="low"
                            loading="lazy"
                            width="44"
                            height="44"
                            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-mono-code text-[11px] text-[#D9C08B]">
                            DIV / {div.code}
                          </span>
                          <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-[#F4EEDF] group-hover:text-[#D9C08B]">
                            {div.name}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#F4EEDF]/70">
                            {div.subtitle}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Enquire Now CTA & Mobile Drawer Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/contact"
            className="hidden sm:inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#F4EEDF] transition-colors duration-250"
          >
            <span>Enquire Now</span>
            <ArrowUpRight aria-hidden="true" className="w-4 h-4" />
          </Link>

          <button
            ref={mobileTriggerRef}
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="min-[1160px]:hidden inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#16294D] border border-[#D9C08B]/25 text-[#F4EEDF] hover:text-[#D9C08B] transition-colors"
          >
            {mobileMenuOpen ? (
              <X aria-hidden="true" className="w-5 h-5" />
            ) : (
              <Menu aria-hidden="true" className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div id="mobile-navigation-drawer" className="min-[1160px]:hidden fixed inset-0 top-[60px] sm:top-[68px] z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-[60px] sm:top-[68px] bg-[#0A1428]/80 backdrop-blur-xs"
            />
            <motion.nav
              ref={mobileSheetRef}
              tabIndex={-1}
              aria-label="Mobile navigation"
              initial={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-[60px] sm:top-[68px] w-[min(22rem,85vw)] h-[calc(100svh-60px)] sm:h-[calc(100svh-68px)] bg-[#16294D] border-l border-[#D9C08B]/25 rounded-l-[2rem] p-5 sm:p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-1">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `block py-3 px-3 text-sm uppercase tracking-widest font-medium  ${
                      isActive ? 'text-[#D9C08B]' : 'text-[#F4EEDF]'
                    }`
                  }
                >
                  Home
                </NavLink>

                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `block py-3 px-3 text-sm uppercase tracking-widest font-medium  ${
                      isActive ? 'text-[#D9C08B]' : 'text-[#F4EEDF]'
                    }`
                  }
                >
                  About Us
                </NavLink>

                <div className=" py-2">
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <NavLink
                      to="/divisions"
                      className={({ isActive }) =>
                        `text-sm uppercase tracking-widest font-medium ${
                          isActive ? 'text-[#D9C08B]' : 'text-[#F4EEDF]'
                        }`
                      }
                    >
                      Our Divisions
                    </NavLink>
                    <button
                      type="button"
                      onClick={() => setMobileDivisionsExpanded((v) => !v)}
                      aria-expanded={mobileDivisionsExpanded}
                      aria-label="Toggle divisions list"
                      className="p-1.5 text-[#D9C08B]"
                    >
                      <ChevronDown
                        aria-hidden="true"
                        className={`w-4 h-4 transition-transform ${
                          mobileDivisionsExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {mobileDivisionsExpanded && (
                    <div className="mt-2 pl-4 pr-2 space-y-1.5 pb-2">
                      {divisionList.map((div) => (
                        <Link
                          key={div.slug}
                          to={`/divisions/${div.slug}`}
                          className="block py-2 px-3 bg-[#0A1428]/60 rounded-2xl"
                        >
                          <span className="font-mono-code text-[10px] text-[#D9C08B] block">
                            DIV / {div.code}
                          </span>
                          <span className="text-xs font-medium text-[#F4EEDF] block mt-0.5">
                            {div.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <NavLink
                  to="/industries"
                  className={({ isActive }) =>
                    `block py-3 px-3 text-sm uppercase tracking-widest font-medium  ${
                      isActive ? 'text-[#D9C08B]' : 'text-[#F4EEDF]'
                    }`
                  }
                >
                  Industries We Serve
                </NavLink>

                <NavLink
                  to="/services"
                  className={({ isActive }) =>
                    `block py-3 px-3 text-sm uppercase tracking-widest font-medium  ${
                      isActive ? 'text-[#D9C08B]' : 'text-[#F4EEDF]'
                    }`
                  }
                >
                  Services & Support
                </NavLink>

                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `block py-3 px-3 text-sm uppercase tracking-widest font-medium  ${
                      isActive ? 'text-[#D9C08B]' : 'text-[#F4EEDF]'
                    }`
                  }
                >
                  Contact Us
                </NavLink>
              </div>

              <div className="pt-6 space-y-4">
                <Link
                  to="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-[0.18em]"
                >
                  <span>Enquire Now</span>
                  <ArrowUpRight aria-hidden="true" className="w-4 h-4" />
                </Link>
                <div className="pt-3 flex items-center justify-between text-xs text-[#F4EEDF]/70">
                  <span>Nagpur, Maharashtra</span>
                  <Link
                    to="/admin/login"
                    className="inline-flex items-center gap-1 text-[#D9C08B] hover:underline"
                  >
                    <ShieldCheck aria-hidden="true" className="w-3.5 h-3.5" /> Admin
                  </Link>
                </div>
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
