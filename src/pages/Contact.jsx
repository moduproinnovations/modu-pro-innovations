import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Building2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import SeoHead from '../components/SeoHead';
import EnquiryForm from '../components/EnquiryForm';

export default function Contact() {
  const { siteSettings, divisions } = useSite();
  const [searchParams] = useSearchParams();

  const paramDivision = searchParams.get('division') || '';
  const paramProduct = searchParams.get('product') || '';

  const [selectedDivisionSlug, setSelectedDivisionSlug] = useState(paramDivision);

  useEffect(() => {
    if (paramDivision) {
      setSelectedDivisionSlug(paramDivision);
    }
  }, [paramDivision]);

  const address =
    siteSettings?.contact?.address ||
    'Plot No. 27, Hanuman Daal Mill Road, opposite Royal Touch, Nagpur – 440008';
  const email = siteSettings?.contact?.email || 'moduproinnovations2805@gmail.com';
  const phones = siteSettings?.contact?.phones?.length
    ? siteSettings.contact.phones
    : ['+91 86230 41894', '+91 86258 32095'];
  const mapEmbedUrl =
    siteSettings?.contact?.mapEmbedUrl || import.meta.env.VITE_MAP_EMBED_URL || '';

  const divisionPills =
    divisions && divisions.length > 0
      ? divisions.map((d) => ({
          slug: d.slug,
          name:
            (d.slug === 'adhesi-pro' || d.slug === 'adhhesi-pro') && siteSettings?.adhesiBrandSpelling
              ? siteSettings.adhesiBrandSpelling
              : d.name,
          code: d.code,
        }))
      : [
          { slug: 'adhesi-pro', name: siteSettings?.adhesiBrandSpelling || 'Adhhesi Pro', code: '01' },
          { slug: 'pcd-blades', name: 'Wood Working & Modular Furniture Tools', code: '02' },
          { slug: 'panel-processing', name: 'Panel Processing Machines Division', code: '03' },
          { slug: 'edge-banding-hardware', name: 'PVC Edge-Banding Tapes & Hardware', code: '04' },
        ];

  const activeDivisionObj = divisionPills.find((d) => d.slug === selectedDivisionSlug);

  return (
    <>
      <SeoHead
        title="Contact Us"
        description={`Contact Modu Pro Innovation Pvt. Ltd. at ${address}. Submit an enquiry for Adhhesi Pro adhesives, PCD blades, panel-processing machinery, or PVC edge-banding tapes & hardware.`}
        canonicalPath="/contact"
      />

      {/* Page Hero */}
      <section className="py-16 sm:py-24 border-b border-[#D9C08B]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-5">
            <p className="font-mono-code text-xs uppercase tracking-[0.22em] text-[#D9C08B]">
              B2B Enquiry & Division Desk
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F4EEDF] leading-tight">
              Contact Modu Pro Innovation
            </h1>
            <div className="w-20 h-[1.5px] bg-[#D9C08B]" />
            <p className="text-base sm:text-lg text-[#F4EEDF]/85 leading-relaxed">
              Whether you are sourcing industrial woodworking adhesives, TCT/PCD saw blades,
              panel-processing machinery, spare parts, or PVC edge-banding tapes and furniture
              hardware, our team can direct your enquiry to the right division.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Interactive Division Selector Strip */}
          <div className="mb-12 bg-[#16294D] border border-[#D9C08B]/25 rounded-[1.5rem] p-6 sm:p-8">
            <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B] mb-3">
              Step 1: Select Relevant Product or Service Division (Optional)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <button
                type="button"
                onClick={() => setSelectedDivisionSlug('')}
                className={`p-3.5 text-left rounded-2xl transition-colors cursor-pointer ${
                  selectedDivisionSlug === ''
                    ? 'bg-[#D9C08B] border border-[#D9C08B] text-[#0A1428] font-semibold'
                    : 'bg-[#0A1428] border border-[#D9C08B]/22 hover:border-[#D9C08B]/50 text-[#F4EEDF]'
                }`}
              >
                <span className="font-mono-code text-[10px] block opacity-80">ALL DIVISIONS</span>
                <span className="text-xs block mt-1">General / Multi-Division</span>
              </button>

              {divisionPills.map((div) => (
                <button
                  key={div.slug}
                  type="button"
                  onClick={() => setSelectedDivisionSlug(div.slug)}
                  className={`p-3.5 text-left rounded-2xl transition-colors cursor-pointer ${
                    selectedDivisionSlug === div.slug
                      ? 'bg-[#D9C08B] border border-[#D9C08B] text-[#0A1428] font-semibold'
                      : 'bg-[#0A1428] border border-[#D9C08B]/22 hover:border-[#D9C08B]/50 text-[#F4EEDF]'
                  }`}
                >
                  <span className="font-mono-code text-[10px] block opacity-80">
                    DIV / {div.code}
                  </span>
                  <span className="text-xs block mt-1 line-clamp-1">{div.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Contact Details & Address */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#16294D] border border-[#D9C08B]/25 rounded-[1.75rem] p-8 space-y-7">
                <div className="flex items-center justify-between pb-4 border-b border-[#D9C08B]/15">
                  <div>
                    <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
                      Registered Office
                    </p>
                    <h2 className="font-display text-2xl font-semibold text-[#F4EEDF] mt-1">
                      Corporate Contact Details
                    </h2>
                  </div>
                  {!siteSettings?.contact?.isContactVerified && (
                    <span className="text-[10px] font-mono-code uppercase tracking-wider px-2.5 py-1 bg-[#0A1428] rounded-[1.5rem] text-[#D9C08B]">
                      Draft Details
                    </span>
                  )}
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#0A1428] rounded-[1.75rem] flex items-center justify-center shrink-0">
                    <MapPin aria-hidden="true" className="w-4 h-4 text-[#D9C08B]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono-code uppercase tracking-wider text-[#D9C08B]">
                      Business Address
                    </h3>
                    <p className="text-sm text-[#F4EEDF]/90 mt-1 leading-relaxed">{address}</p>
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#0A1428] rounded-[1.75rem] flex items-center justify-center shrink-0">
                    <Phone aria-hidden="true" className="w-4 h-4 text-[#D9C08B]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono-code uppercase tracking-wider text-[#D9C08B]">
                      Direct Telephone
                    </h3>
                    <div className="mt-1 space-y-1 text-sm text-[#F4EEDF]/90">
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
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#0A1428] rounded-[1.75rem] flex items-center justify-center shrink-0">
                    <Mail aria-hidden="true" className="w-4 h-4 text-[#D9C08B]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono-code uppercase tracking-wider text-[#D9C08B]">
                      Email Enquiries
                    </h3>
                    <a
                      href={`mailto:${email}`}
                      className="text-sm text-[#F4EEDF]/90 hover:text-[#D9C08B] transition-colors mt-1 block break-all"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                {/* Business Hours */}
                {siteSettings?.contact?.businessHours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#0A1428] rounded-[1.75rem] flex items-center justify-center shrink-0">
                      <Clock aria-hidden="true" className="w-4 h-4 text-[#D9C08B]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-mono-code uppercase tracking-wider text-[#D9C08B]">
                        Operating Hours
                      </h3>
                      <p className="text-sm text-[#F4EEDF]/85 mt-1">
                        {siteSettings.contact.businessHours}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Map Embed */}
              {mapEmbedUrl ? (
                <div className="bg-[#16294D] border border-[#D9C08B]/25 rounded-[1.5rem] p-3">
                  <iframe
                    title="Modu Pro Innovation Pvt. Ltd. Location Map"
                    src={mapEmbedUrl}
                    width="100%"
                    height="260"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="border-0 w-full"
                  />
                </div>
              ) : (
                <div className="bg-[#16294D] border border-[#D9C08B]/25 rounded-[1.5rem] p-6 flex items-start gap-3.5">
                  <Building2 aria-hidden="true" className="w-5 h-5 text-[#D9C08B] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#F4EEDF]/80 space-y-1 leading-relaxed">
                    <p className="font-semibold text-[#F4EEDF]">Nagpur Industrial Hub</p>
                    <p>
                      Located on Hanuman Daal Mill Road, opposite Royal Touch, Nagpur – 440008.
                      Interactive map embed can be enabled at any time from the Admin Settings
                      panel.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Company Enquiry Form */}
            <div className="lg:col-span-7">
              <EnquiryForm
                key={selectedDivisionSlug || 'general'}
                defaultDivisionSlug={selectedDivisionSlug}
                defaultDivisionName={activeDivisionObj?.name || 'General / Multi-Division'}
                defaultProduct={paramProduct}
                enquiryType={selectedDivisionSlug ? 'division' : 'general'}
                sourcePage="/contact"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
