import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import SeoHead from '../components/SeoHead';

export default function NotFound() {
  return (
    <>
      <SeoHead title="Page Not Found (404)" />
      <section className="py-24 sm:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-[#16294D] border border-[#D9C08B]/25 rounded-[1.75rem] p-10 sm:p-14 space-y-6">
            <div className="w-14 h-14 mx-auto bg-[#0A1428] rounded-[1.75rem] flex items-center justify-center">
              <Compass aria-hidden="true" className="w-6 h-6 text-[#D9C08B]" />
            </div>
            <p className="font-mono-code text-xs uppercase tracking-[0.24em] text-[#D9C08B]">
              Error 404 • Route Not Found
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#F4EEDF]">
              The Requested Page Could Not Be Located
            </h1>
            <p className="text-sm sm:text-base text-[#F4EEDF]/80 max-w-xl mx-auto leading-relaxed">
              The URL you followed may be outdated or moved. Explore our four business divisions or
              return to the Modu Pro Innovation homepage below.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-[0.18em] rounded-full"
              >
                <ArrowLeft aria-hidden="true" className="w-4 h-4" />
                <span>Return to Homepage</span>
              </Link>
              <Link
                to="/divisions"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0A1428] border border-[#D9C08B]/30 rounded-[1.5rem] text-xs font-semibold uppercase tracking-[0.18em] text-[#F4EEDF] hover:text-[#D9C08B]"
              >
                <span>Explore Divisions</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
