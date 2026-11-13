import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useSite } from '../context/SiteContext';

export default function Footer() {
  const { siteSettings, divisions } = useSite();

  const companyName = siteSettings?.companyName || 'Modu Pro Innovation Pvt. Ltd.';
  const tagline = siteSettings?.tagline || 'Faithfully Delivering Excellence';
  const address =
    siteSettings?.contact?.address ||
    'Plot No. 27, Hanuman Daal Mill Road, opposite Royal Touch, Nagpur – 440008';
  const email = siteSettings?.contact?.email || 'moduproinnovations2805@gmail.com';
  const phones = siteSettings?.contact?.phones?.length
    ? siteSettings.contact.phones
    : ['+91 86230 41894', '+91 86258 32095'];

  const divisionLinks =
    divisions && divisions.length > 0
      ? divisions
      : [
          { name: siteSettings?.adhesiBrandSpelling || 'Adhesi Pro', slug: 'adhesi-pro' },
          { name: 'Wood Working & Modular Furniture Tools', slug: 'pcd-blades' },
          { name: 'Panel Processing Machines Division', slug: 'panel-processing' },
          { name: 'PVC Edge-Banding Tapes & Hardware', slug: 'edge-banding-hardware' },
        ];

  return (
    <footer className="bg-[#0A1428] text-[#F4EEDF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-[#16294D] border border-[#D9C08B]/28 px-6 py-8 sm:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="font-mono-code text-xs uppercase tracking-[0.22em] text-[#D9C08B]">
              Single Point of Industrial Coordination
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#F4EEDF] mt-1">
              Ready to source adhesives, blades, machinery, or furniture fittings?
            </h2>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#F4EEDF] transition-colors shrink-0"
          >
            <span>Send an Enquiry</span>
            <ArrowUpRight aria-hidden="true" className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Column 1: Brand & Overview */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3.5">
              <div className="bg-[#F4EEDF] px-2.5 py-1.5 rounded-2xl">
                <img
                  src={siteSettings?.logoUrl || '/assets/logo/modu-pro-logo.png'}
                  alt={companyName}
                  loading="lazy"
                  width="52"
                  height="44"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <p className="font-display text-xl font-semibold uppercase tracking-[0.12em] text-[#F4EEDF]">
                  Modu Pro
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#D9C08B]">
                  Innovation Pvt. Ltd.
                </p>
              </div>
            </Link>

            <p className="font-display italic text-base text-[#D9C08B]">{tagline}</p>

            <p className="text-sm text-[#F4EEDF]/75 leading-relaxed">
              {siteSettings?.footer?.summaryText ||
                'Modu Pro Innovation Pvt. Ltd. brings together adhesive products, precision woodworking blades, panel-processing machinery and furniture hardware to support manufacturers across the woodworking and modular-furniture industry.'}
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-mono-code uppercase tracking-[0.2em] text-[#D9C08B]">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-[#F4EEDF]/80 hover:text-[#D9C08B] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-[#F4EEDF]/80 hover:text-[#D9C08B] transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/divisions"
                  className="text-[#F4EEDF]/80 hover:text-[#D9C08B] transition-colors"
                >
                  Our Divisions
                </Link>
              </li>
              <li>
                <Link
                  to="/industries"
                  className="text-[#F4EEDF]/80 hover:text-[#D9C08B] transition-colors"
                >
                  Industries We Serve
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-[#F4EEDF]/80 hover:text-[#D9C08B] transition-colors"
                >
                  Services & Support
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-[#F4EEDF]/80 hover:text-[#D9C08B] transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Four Business Divisions */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-mono-code uppercase tracking-[0.2em] text-[#D9C08B]">
              Our Divisions
            </h3>
            <ul className="space-y-2.5 text-sm">
              {divisionLinks.map((div) => (
                <li key={div.slug}>
                  <Link
                    to={`/divisions/${div.slug}`}
                    className="text-[#F4EEDF]/80 hover:text-[#D9C08B] transition-colors inline-flex items-start gap-2"
                  >
                    <span className="text-[#D9C08B] mt-1">•</span>
                    <span>{div.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Corporate Contact Details */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-mono-code uppercase tracking-[0.2em] text-[#D9C08B]">
                Corporate Office
              </h3>
              {!siteSettings?.contact?.isContactVerified && (
                <span className="text-[10px] font-mono-code uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#16294D] text-[#F4EEDF]/75">
                  Report Draft
                </span>
              )}
            </div>

            <div className="space-y-3.5 text-sm text-[#F4EEDF]/80">
              <div className="flex items-start gap-3">
                <MapPin aria-hidden="true" className="w-4 h-4 text-[#D9C08B] shrink-0 mt-1" />
                <span>{address}</span>
              </div>

              <div className="flex items-start gap-3">
                <Phone aria-hidden="true" className="w-4 h-4 text-[#D9C08B] shrink-0 mt-1" />
                <div className="space-y-1">
                  {phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="block hover:text-[#D9C08B] transition-colors"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail aria-hidden="true" className="w-4 h-4 text-[#D9C08B] shrink-0 mt-1" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-[#D9C08B] transition-colors break-all"
                >
                  {email}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="gold-hairline my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F4EEDF]/65">
          <p>
            {siteSettings?.footer?.copyrightText ||
              `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
          </p>
          <div className="flex items-center gap-6">
            <Link to="/contact" className="hover:text-[#D9C08B] transition-colors">
              B2B Enquiry Desk
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-[#F4EEDF]/60 hover:text-[#D9C08B] transition-colors"
            >
              <ShieldCheck aria-hidden="true" className="w-3.5 h-3.5 text-[#D9C08B]" />
              <span>Administrator Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
