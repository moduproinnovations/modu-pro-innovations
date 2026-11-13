import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowLeft,
  Search,
  Eye,
  CheckCircle2,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { publicApi } from '../services/api';
import { useSite } from '../context/SiteContext';
import SeoHead from '../components/SeoHead';
import ProductDetailModal from '../components/ProductDetailModal';
import EnquiryForm from '../components/EnquiryForm';

const DIVISION_BG_BANNERS = {
  'Adhhesi-pro': '/assets/full%20backgorund%20banners/new%20Adhhesi%20bg%20banner.png',
  'pcd-blades':
    '/assets/full%20backgorund%20banners/PCD%20Pre-Milling%20&%20Grooving%20Saw%20Blades.png',
  'panel-processing':
    '/assets/full%20backgorund%20banners/Panel%20Processing%20Machines%20Division.png',
  'edge-banding-hardware':
    '/assets/full%20backgorund%20banners/PVC%20Edge-Banding%20Tapes%20&%20Hardware.png',
};

const DIVISION_RIGHT_PRODUCT_IMAGE = {
  'Adhhesi-pro': null, // new Adhhesi bg banner already contains the product drum on the right
  'pcd-blades': 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/pcd-blades/pre-milling-cutter-single.png',
  'panel-processing': 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/cnc-nesting-machine.png',
  'edge-banding-hardware': 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/edge-banding-hardware/pvc-woodgrain-tape.png',
};

const HERO_LOOP_STEP_MS = 3000;

const DIVISION_HERO_LOOP_PRODUCTS = {
  'Adhhesi-pro': [
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/Adhhesi-pro/lockpro-wr3-drum.png',
      alt: 'Adhhesi Pro Lockpro WR 3 D3 Water-Resistant Adhhesive Drum',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/Adhhesi-pro/lockpro-808-drum.png',
      alt: 'Adhhesi Pro Lockpro 808 Woodworking Adhhesive Drum',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/Adhhesi-pro/1k-pur-Adhhesive.png',
      alt: 'Adhhesi Pro 1K PUR Moisture-Curing Polyurethane Adhhesive',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/Adhhesi-pro/lockpro-707-drum.png',
      alt: 'Adhhesi Pro Lockpro 707 Industrial Adhhesive Drum',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/Adhhesi-pro/lockpro-wr3-bucket.png',
      alt: 'Adhhesi Pro Lockpro WR 3 Adhhesive Bucket',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/Adhhesi-pro/lockpro-808-pr-bucket.png',
      alt: 'Adhhesi Pro Lockpro 808 PR Adhhesive Bucket',
    },
  ],
  'pcd-blades': [
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/pcd-blades/pre-milling-cutter-single.png',
      alt: 'Wood Working PCD Pre-Milling Cutter Single',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/pcd-blades/pre-milling-cutters.png',
      alt: 'Wood Working PCD Pre-Milling & Spindle Moulder Cutters',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/pcd-blades/grooving-saw-blade.png',
      alt: 'Wood Working Grooving & Slot Cutter Saw Blade',
    },
  ],
  'panel-processing': [
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/cnc-nesting-machine.png',
      alt: 'CNC Nesting Router Machine',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/edge-banding-machine.png',
      alt: 'Automatic Edge Banding Machine',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/sliding-table-panel-saw.png',
      alt: 'Precision Sliding Table Panel Saw',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/multi-boring-machine.png',
      alt: 'Multi-Boring & Drilling Machine',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/hydraulic-cold-press.png',
      alt: 'Hydraulic Cold Press Machine',
    },
  ],
  'edge-banding-hardware': [
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/edge-banding-hardware/pvc-woodgrain-tape.png',
      alt: 'Woodgrain PVC Edge Banding Tape Roll',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/edge-banding-hardware/pvc-solid-color-tapes.png',
      alt: 'Solid Colour PVC Edge Banding Tape Rolls',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/edge-banding-hardware/telescopic-drawer-channels.png',
      alt: 'Telescopic Ball-Bearing Drawer Slides',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/edge-banding-hardware/concealed-cup-hinge.png',
      alt: 'Concealed Cabinet Auto Cup Hinge',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/edge-banding-hardware/spring-flap-hinge.png',
      alt: 'Hydraulic Flap Stay Support Hinge',
    },
    {
      src: 'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/edge-banding-hardware/minifix-cam-fittings.jpg',
      alt: 'Mini Fix Cam & Bolt Furniture Connector Fittings',
    },
  ],
};

export default function DivisionDetail() {
  const { slug } = useParams();
  const { siteSettings, divisions } = useSite();
  const prefersReducedMotion = useReducedMotion();
  const enquirySectionRef = useRef(null);

  const [division, setDivision] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [enquiryProduct, setEnquiryProduct] = useState('');

  const [heroLoopIndex, setHeroLoopIndex] = useState(0);
  const [isHeroLoopPaused, setIsHeroLoopPaused] = useState(false);

  const divisionLoopItems = useMemo(() => {
    if (!division?.slug) return [];
    const baseItems = DIVISION_HERO_LOOP_PRODUCTS[division.slug] || [];
    if (baseItems.length === 0) return [];

    const seen = new Set(baseItems.map((item) => item.src));
    const extras = [];
    if (Array.isArray(products)) {
      products.forEach((product) => {
        const img = product?.images?.[0];
        if (
          img?.url &&
          img.url.toLowerCase().endsWith('.png') &&
          !seen.has(img.url)
        ) {
          seen.add(img.url);
          extras.push({
            src: img.url,
            alt: img.alt || product.name || 'Division Product',
          });
        }
      });
    }
    return [...baseItems, ...extras];
  }, [division?.slug, products]);

  useEffect(() => {
    if (prefersReducedMotion || isHeroLoopPaused || divisionLoopItems.length <= 1) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setHeroLoopIndex((prev) => (prev + 1) % divisionLoopItems.length);
    }, HERO_LOOP_STEP_MS);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, isHeroLoopPaused, divisionLoopItems.length]);

  useEffect(() => {
    if (typeof window === 'undefined' || divisionLoopItems.length <= 1) return;
    const nextItem = divisionLoopItems[(heroLoopIndex + 1) % divisionLoopItems.length];
    if (!nextItem?.src) return;
    const preload = new window.Image();
    preload.fetchPriority = 'low';
    preload.decoding = 'async';
    preload.src = nextItem.src;
  }, [heroLoopIndex, divisionLoopItems]);

  const activeLoopProduct =
    divisionLoopItems.length > 0
      ? divisionLoopItems[heroLoopIndex % divisionLoopItems.length]
      : null;


  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setSelectedCategory('all');
    setSearchQuery('');
    setEnquiryProduct('');
    setHeroLoopIndex(0);
    setIsHeroLoopPaused(false);

    const lookupSlug = slug === 'adhhesi-pro' ? 'Adhhesi-pro' : slug;

    publicApi
      .getDivisionBySlug(lookupSlug)
      .then((data) => {
        if (!active) return;
        setDivision(data.division);
        setProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.data?.message || 'Unable to load division details.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const displayName =
    (division?.slug === 'Adhhesi-pro' || division?.slug === 'adhhesi-pro') && siteSettings?.AdhhesiBrandSpelling
      ? siteSettings.AdhhesiBrandSpelling
      : division?.name || 'Business Division';

  const categories = useMemo(() => {
    const set = new Set(division?.categories || []);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [division, products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const relatedDivisions = useMemo(() => {
    return (divisions || []).filter((d) => d.slug !== slug);
  }, [divisions, slug]);

  const handleSelectProductForEnquiry = (prod) => {
    setEnquiryProduct(prod.name);
    enquirySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-[#16294D] rounded-[1.5rem] p-12 text-center space-y-3">
          <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
            Loading Division Data
          </p>
          <p className="text-sm text-[#F4EEDF]/75">
            Retrieving division catalog and approved specifications...
          </p>
        </div>
      </div>
    );
  }

  if (error || !division) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
        <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
          Division Not Found
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#F4EEDF]">
          {error || 'The requested division could not be found.'}
        </h1>
        <Link
          to="/divisions"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-widest rounded-full"
        >
          <ArrowLeft aria-hidden="true" className="w-4 h-4" />
          <span>Back to All Divisions</span>
        </Link>
      </div>
    );
  }

  const heroBgBanner = DIVISION_BG_BANNERS[division.slug] || null;
  const rightProductImage =
    division.slug in DIVISION_RIGHT_PRODUCT_IMAGE
      ? DIVISION_RIGHT_PRODUCT_IMAGE[division.slug]
      : division.heroImage;

  return (
    <>
      <SeoHead
        title={division.seo?.metaTitle || displayName}
        description={division.seo?.metaDescription || division.shortDescription}
        canonicalPath={`/divisions/${division.slug}`}
      />

      {/* 1. DIVISION-SPECIFIC HERO */}
      <section
        className={`relative -mt-[76px] pt-[76px] overflow-hidden ${
          heroBgBanner ? 'hero-banner-dark min-h-[86svh] flex items-center' : ''
        }`}
      >
        {heroBgBanner && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src={heroBgBanner}
              alt=""
              fetchPriority="high"
              width="1920"
              height="820"
              className="w-full h-full object-cover object-left sm:object-center"
            />
            {division.slug === 'panel-processing' && (
              <>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-[#0A1428]/88 via-[#0A1428]/58 to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0A1428]/70 to-transparent"
                />
              </>
            )}
          </div>
        )}

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="mb-6">
            <Link
              to="/divisions"
              className="inline-flex items-center gap-2 text-xs font-mono-code uppercase tracking-widest text-[#D9C08B] hover:underline drop-shadow-[0_2px_8px_rgba(10,20,40,0.9)]"
            >
              <ArrowLeft aria-hidden="true" className="w-3.5 h-3.5" />
              <span>All Business Divisions</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-[1.75rem] bg-[#0A1428]/80 border border-[#D9C08B]/40">
                <span className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
                  DIVISION {division.code || '01'} • {division.subtitle || 'Modu Pro Innovation'}
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F4EEDF] leading-tight drop-shadow-[0_4px_18px_rgba(10,20,40,0.92)]">
                {displayName}
              </h1>

              <div className="w-20 h-[1.5px] bg-[#D9C08B]" />

              <p className="text-base sm:text-lg text-[#F4EEDF] leading-relaxed drop-shadow-[0_2px_12px_rgba(10,20,40,0.95)] whitespace-pre-line">
                {division.fullDescription || division.shortDescription}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                <a
                  href="#division-products"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-[0.16em] sm:tracking-[0.18em] rounded-[1.75rem] hover:bg-[#F4EEDF] transition-colors shadow-[0_12px_28px_rgba(10,20,40,0.5)]"
                >
                  <span>Browse Products</span>
                  <ArrowUpRight aria-hidden="true" className="w-4 h-4" />
                </a>
                <a
                  href="#division-enquiry"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-[#16294D] text-[#F4EEDF] border border-[#D9C08B]/40 text-xs font-semibold uppercase tracking-[0.16em] sm:tracking-[0.18em] rounded-[1.5rem] hover:text-[#D9C08B] transition-colors shadow-[0_12px_28px_rgba(10,20,40,0.5)]"
                >
                  <span>Division Enquiry</span>
                </a>
              </div>
            </div>

            {activeLoopProduct ? (
              <div
                onMouseEnter={() => setIsHeroLoopPaused(true)}
                onMouseLeave={() => setIsHeroLoopPaused(false)}
                className={`lg:col-span-5 relative w-full h-[320px] sm:h-[400px] lg:h-[480px] xl:h-[520px] flex items-center ${
                  (division.slug === 'Adhhesi-pro' || division.slug === 'adhhesi-pro')
                    ? 'justify-center lg:justify-end'
                    : 'justify-center'
                }`}
              >
                {division.slug === 'edge-banding-hardware' && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none rounded-full bg-[#0A1428]/45 blur-2xl"
                  />
                )}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeLoopProduct.src}
                    src={activeLoopProduct.src}
                    alt={activeLoopProduct.alt}
                    fetchPriority="low"
                    decoding="async"
                    initial={
                      prefersReducedMotion
                        ? { opacity: 1 }
                        : { opacity: 0, scale: 0.94, y: 12 }
                    }
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={
                      prefersReducedMotion
                        ? { opacity: 1 }
                        : { opacity: 0, scale: 0.96, y: -12 }
                    }
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="max-h-[300px] sm:max-h-[380px] lg:max-h-[460px] xl:max-h-[500px] w-auto max-w-full object-contain rounded-2xl drop-shadow-[0_32px_54px_rgba(0,0,0,0.85)] select-none transition-transform duration-500 hover:scale-[1.04]"
                  />
                </AnimatePresence>
              </div>
            ) : rightProductImage ? (
              <div className="lg:col-span-5 flex items-center justify-center">
                <img
                  src={rightProductImage}
                  alt={displayName}
                  fetchPriority="high"
                  width="620"
                  height="520"
                  className={`max-h-[360px] sm:max-h-[440px] lg:max-h-[500px] w-auto object-contain drop-shadow-[0_32px_54px_rgba(0,0,0,0.75)] transition-transform duration-700 hover:scale-[1.04] ${
                    prefersReducedMotion ? '' : 'lux-float'
                  }`}
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* 2. PRODUCT OR SERVICE CATEGORY LISTING */}
      {categories.length > 0 && (
        <section className="py-12 bg-[#16294D]/45 border-y border-[#D9C08B]/18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B] mb-4">
              Division Product & Service Categories
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-medium rounded-full transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#D9C08B] text-[#0A1428]'
                    : 'bg-[#0A1428] border border-[#D9C08B]/25 hover:border-[#D9C08B]/50 text-[#F4EEDF]/85'
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-medium rounded-full transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#D9C08B] text-[#0A1428]'
                      : 'bg-[#0A1428] border border-[#D9C08B]/25 hover:border-[#D9C08B]/50 text-[#F4EEDF]/85'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. DATABASE-POPULATED PRODUCT GRID */}
      <section id="division-products" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="font-mono-code text-xs uppercase tracking-[0.22em] text-[#D9C08B]">
                Approved Product Range
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#F4EEDF] mt-1">
                {displayName} Catalog
              </h2>
            </div>

            {/* Search Filter */}
            <div className="w-full md:w-80 relative">
              <label htmlFor="division-product-search" className="sr-only">
                Search products in {displayName}
              </label>
              <Search
                aria-hidden="true"
                className="w-4 h-4 text-[#D9C08B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                id="division-product-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder="Search by product or application..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#0A1428] border border-[#D9C08B]/30 focus:border-[#D9C08B] rounded-full text-sm text-[#F4EEDF] placeholder-[#F4EEDF]/45"
              />
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <motion.article
                  key={product._id || product.slug}
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="group bg-[#16294D] border border-[#D9C08B]/24 hover:border-[#D9C08B]/50 overflow-hidden rounded-[1.5rem] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="bg-[#0A1428] border-b border-[#D9C08B]/15 h-64 p-6 flex items-center justify-center relative overflow-hidden">
                      <span className="absolute top-3 left-3 text-[10px] font-mono-code uppercase tracking-wider px-2.5 py-1 bg-[#16294D] rounded-[1.5rem] text-[#D9C08B]">
                        {product.category}
                      </span>
                      <img
                        src={
                          product.images?.[0]?.url ||
                          division.heroImage ||
                          'https://oezygoabjdgrfxdgjosi.supabase.co/storage/v1/object/public/product/panel-processing/edge-banding-machine.png'
                        }
                        alt={product.images?.[0]?.alt || product.name}
                        loading="lazy"
                        width="300"
                        height="220"
                        className="max-h-48 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="font-display text-2xl font-semibold text-[#F4EEDF] group-hover:text-[#D9C08B] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-[#F4EEDF]/80 leading-relaxed">
                        {product.shortDescription}
                      </p>

                      {product.highlights && product.highlights.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {product.highlights.slice(0, 3).map((h) => (
                            <span
                              key={h}
                              className="text-[11px] px-2.5 py-1 bg-[#0A1428] rounded-[1.5rem] text-[#D9C08B]"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3.5 sm:pt-4 border-t border-[#D9C08B]/15 flex items-center justify-between gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-widest text-[#D9C08B] hover:underline cursor-pointer"
                    >
                      <Eye aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">Specifications &amp; Details</span>
                      <span className="sm:hidden">Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectProductForEnquiry(product)}
                      className="inline-flex items-center gap-1 text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-[#F4EEDF]/85 hover:text-[#D9C08B] cursor-pointer shrink-0"
                    >
                      <span>Enquire</span>
                      <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="bg-[#16294D] rounded-[1.5rem] p-10 text-center space-y-3">
              <p className="text-base text-[#F4EEDF]">
                No products matched your current filter criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#0A1428] rounded-[1.75rem] text-xs uppercase tracking-widest text-[#D9C08B]"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. APPLICATIONS & SERVICE HIGHLIGHTS SECTION */}
      <section className="py-20 bg-[#16294D]/35 border-y border-[#D9C08B]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Applications */}
            <div className="bg-[#16294D] border border-[#D9C08B]/25 rounded-[1.75rem] p-8">
              <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
                Industrial Use Cases
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#F4EEDF] mt-1 mb-6">
                Typical Manufacturing Applications
              </h2>
              <ul className="space-y-3.5">
                {(division.applications || []).map((app) => (
                  <li
                    key={app}
                    className="p-3.5 bg-[#0A1428] rounded-[1.5rem] flex items-start gap-3 text-sm text-[#F4EEDF]/90"
                  >
                    <Layers aria-hidden="true" className="w-4 h-4 text-[#D9C08B] shrink-0 mt-0.5" />
                    <span>{app}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Division Service / Support Highlights */}
            <div className="bg-[#16294D] border border-[#D9C08B]/25 rounded-[1.75rem] p-8">
              <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
                Division Coordination
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#F4EEDF] mt-1 mb-6">
                How This Division Supports Manufacturers
              </h2>
              <ul className="space-y-3.5">
                {(division.serviceHighlights || []).map((item) => (
                  <li
                    key={item}
                    className="p-3.5 bg-[#0A1428] rounded-[1.5rem] flex items-start gap-3 text-sm text-[#F4EEDF]/90"
                  >
                    <CheckCircle2
                      aria-hidden="true"
                      className="w-4 h-4 text-[#D9C08B] shrink-0 mt-0.5"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5 & 6. FULL-BANNER FAQ & DIVISION ENQUIRY STAGE */}
      <div className="hero-banner-dark relative">
        {/* Pinned Full-Screen Background Banner (Full Visibility) */}
        <div className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none z-0">
          <img
            src="/assets/full%20backgorund%20banners/Frequently%20Asked%20Questions.png"
            alt=""
            loading="lazy"
            width="1920"
            height="820"
            className="w-full h-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0A1428] to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A1428] to-transparent"
          />
        </div>

        <div className="relative z-10 -mt-[100vh]">
          {/* 5. APPROVED FAQ SECTION */}
          {division.faqs && division.faqs.length > 0 && (
            <section className="pt-24 pb-16 sm:pt-28 sm:pb-20">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0A1428]/80 border border-[#D9C08B]/40 backdrop-blur-md mb-3">
                    <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
                      Verified Answers
                    </p>
                  </div>
                  <h2 className="font-display text-3xl sm:text-5xl font-semibold text-[#F4EEDF] drop-shadow-[0_4px_18px_rgba(10,20,40,0.95)]">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="space-y-4">
                  {division.faqs.map((faq, idx) => (
                    <details
                      key={faq._id || idx}
                      className="group bg-[#0A1428]/84 backdrop-blur-md border border-[#D9C08B]/35 shadow-[0_20px_50px_-12px_rgba(10,20,40,0.85)] rounded-[1.5rem] p-6"
                    >
                      <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-display text-xl font-semibold text-[#F4EEDF]">
                        <span className="flex items-center gap-3">
                          <HelpCircle
                            aria-hidden="true"
                            className="w-5 h-5 text-[#D9C08B] shrink-0"
                          />
                          <span>{faq.question}</span>
                        </span>
                        <span className="font-mono-code text-xs text-[#D9C08B] group-open:rotate-45 transition-transform">
                          +
                        </span>
                      </summary>
                      <p className="mt-4 pl-8 text-sm sm:text-base text-[#F4EEDF]/85 leading-relaxed pt-4 border-t border-[#D9C08B]/20">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 6. DIVISION-SPECIFIC ENQUIRY FORM */}
          <section
            id="division-enquiry"
            ref={enquirySectionRef}
            className="py-16 sm:py-24"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <EnquiryForm
                defaultDivisionSlug={division.slug}
                defaultDivisionName={displayName}
                defaultProduct={enquiryProduct}
                enquiryType="division"
                sourcePage={`/divisions/${division.slug}`}
                heading={`Enquire With ${displayName}`}
                subheading={`Submit your product or machinery enquiry directly to our ${displayName} team.`}
              />
            </div>
          </section>
        </div>
      </div>

      {/* 7. RELATED DIVISIONS */}
      {relatedDivisions.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#F4EEDF]">
                Explore Related Divisions
              </h2>
              <Link
                to="/divisions"
                className="text-xs font-mono-code uppercase tracking-widest text-[#D9C08B] hover:underline"
              >
                All Four Divisions
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedDivisions.map((rel) => (
                <Link
                  key={rel.slug}
                  to={`/divisions/${rel.slug}`}
                  className="group bg-[#16294D] border border-[#D9C08B]/24 hover:border-[#D9C08B]/50 rounded-[1.5rem] p-6 flex flex-col justify-between transition-colors"
                >
                  <div>
                    <span className="font-mono-code text-xs text-[#D9C08B]">
                      DIVISION {rel.code}
                    </span>
                    <h3 className="font-display text-xl font-semibold text-[#F4EEDF] group-hover:text-[#D9C08B] mt-1">
                      {rel.name}
                    </h3>
                    <p className="text-xs text-[#F4EEDF]/75 mt-2 line-clamp-2 leading-relaxed">
                      {rel.shortDescription}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#D9C08B]">
                    <span>Explore Division</span>
                    <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectForEnquiry={handleSelectProductForEnquiry}
      />
    </>
  );
}
