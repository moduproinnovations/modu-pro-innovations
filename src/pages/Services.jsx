import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Wrench, CheckCircle2, ArrowUpRight, Clock } from 'lucide-react';
import { publicApi } from '../services/api';
import SeoHead from '../components/SeoHead';
import EnquiryForm from '../components/EnquiryForm';

export default function Services() {
  const prefersReducedMotion = useReducedMotion();
  const formSectionRef = useRef(null);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('');

  useEffect(() => {
    let active = true;
    publicApi
      .getServices()
      .then((data) => {
        if (active && Array.isArray(data)) {
          setServices(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const fadeUp = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.45 },
      };

  const handleRequestService = (serviceName) => {
    setSelectedServiceCategory(serviceName);
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <SeoHead
        title="Services & Support"
        description="Machinery consultation, spare parts supply, installation support, preventive maintenance, troubleshooting, mechanical & electrical repairs, and computerized-control servicing."
        canonicalPath="/services"
      />

      {/* Hero Section */}
      <section className="py-16 sm:py-24 border-b border-[#D9C08B]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-5">
            <p className="font-mono-code text-xs uppercase tracking-[0.22em] text-[#D9C08B]">
              Machinery, Spare Parts & Technical Assistance
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F4EEDF] leading-tight">
              Services &amp; Technical Support
            </h1>
            <div className="w-20 h-[1.5px] bg-[#D9C08B]" />
            <p className="text-base sm:text-lg text-[#F4EEDF]/85 leading-relaxed">
              Alongside panel-processing machinery and consumables, Modu Pro Innovation Pvt. Ltd.
              provides enquiry-based technical assistance, spare-parts sourcing, and machine
              servicing for woodworking manufacturers.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-mono-code text-xs uppercase tracking-[0.22em] text-[#D9C08B]">
                Service Portfolio
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#F4EEDF] mt-1">
                Machinery &amp; Maintenance Offerings
              </h2>
            </div>
            <Link
              to="/divisions/panel-processing"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#D9C08B] hover:underline"
            >
              <span>View Panel Processing Machines Division</span>
              <ArrowUpRight aria-hidden="true" className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="bg-[#16294D] rounded-[1.5rem] p-12 text-center">
              <p className="text-sm text-[#F4EEDF]/75">Loading service categories...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {services.map((srv, idx) => (
                <motion.article
                  key={srv._id || srv.slug}
                  {...fadeUp}
                  className="bg-[#16294D] border border-[#D9C08B]/24 hover:border-[#D9C08B]/50 overflow-hidden rounded-[1.5rem] transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="p-6 flex items-center justify-between gap-2 bg-[#0A1428]/60 border-b border-[#D9C08B]/15">
                      <span className="font-mono-code text-xs text-[#D9C08B]">
                        SERVICE 0{idx + 1}
                      </span>
                      {srv.confirmationStatus === 'pending_confirmation' ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase tracking-wider px-2.5 py-1 bg-[#16294D] rounded-[1.75rem] text-[#D9C08B]">
                          <Clock aria-hidden="true" className="w-3 h-3" />
                          <span>Subject to Confirmation</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono-code uppercase tracking-wider px-2.5 py-1 bg-[#0A1428] rounded-[1.5rem] text-[#F4EEDF]/85">
                          Active Offering
                        </span>
                      )}
                    </div>

                    <div className="p-7 space-y-4">
                      <div className="w-11 h-11 bg-[#0A1428] rounded-[1.75rem] flex items-center justify-center">
                        <Wrench aria-hidden="true" className="w-5 h-5 text-[#D9C08B]" />
                      </div>
                      <h3 className="font-display text-2xl font-semibold text-[#F4EEDF]">
                        {srv.name}
                      </h3>
                      <p className="text-sm text-[#F4EEDF]/80 leading-relaxed">
                        {srv.description || srv.shortDescription}
                      </p>

                      {srv.scopeItems && srv.scopeItems.length > 0 && (
                        <ul className="space-y-2 pt-2 text-xs text-[#F4EEDF]/85">
                          {srv.scopeItems.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <CheckCircle2
                                aria-hidden="true"
                                className="w-3.5 h-3.5 text-[#D9C08B] shrink-0 mt-0.5"
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="px-7 pb-6 pt-4 border-t border-[#D9C08B]/15">
                    <button
                      type="button"
                      onClick={() => handleRequestService(srv.name)}
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D9C08B] hover:underline cursor-pointer"
                    >
                      <span>Enquire For This Service</span>
                      <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dedicated Service Enquiry Form */}
      <section ref={formSectionRef} className="py-20 sm:py-24 bg-[#16294D]/25 border-t border-[#D9C08B]/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <EnquiryForm
            defaultDivisionSlug="panel-processing"
            defaultDivisionName="Panel Processing Machines Division"
            defaultServiceCategory={selectedServiceCategory}
            enquiryType="service"
            sourcePage="/services"
            showServiceFields={true}
            serviceCategories={services.map((s) => s.name)}
            heading="Request Machinery Service or Spare Parts"
            subheading="Provide your machine details and service requirement below. Scope and scheduling are confirmed directly by our technical team upon review."
          />
        </div>
      </section>
    </>
  );
}
