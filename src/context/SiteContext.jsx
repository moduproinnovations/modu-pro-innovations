import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { publicApi } from '../services/api';

const DEFAULT_SETTINGS = {
  companyName: 'Modu Pro Innovation Pvt. Ltd.',
  tagline: 'Faithfully Delivering Excellence',
  adhesiBrandSpelling: 'Adhesi Pro',
  logoUrl: '/assets/logo/modu-pro-logo.png',
  contact: {
    address: 'Plot No. 27, Hanuman Daal Mill Road, opposite Royal Touch, Nagpur – 440008',
    email: 'moduproinnovations2805@gmail.com',
    phones: ['+91 86230 41894', '+91 86258 32095'],
    businessHours: 'Monday – Saturday: 10:00 AM – 7:00 PM IST (Subject to Client Confirmation)',
    isContactVerified: false,
    mapEmbedUrl: '',
  },
  hero: {
    heading: 'Complete Solutions for Woodworking and Modular Industries',
    supportingText:
      'Modu Pro Innovation Pvt. Ltd. brings together adhesive products, precision woodworking blades, panel-processing machinery and furniture hardware to support manufacturers across the woodworking and modular-furniture industry.',
    primaryCtaLabel: 'Explore Our Divisions',
    secondaryCtaLabel: 'Discuss Your Requirement',
  },
  aboutContent: {
    overviewParagraphOne:
      'Modu Pro Innovation Pvt. Ltd. serves the needs of modular furniture, kitchen, door and woodworking manufacturers through a focused range of products and industry solutions. The company brings together adhesive products, woodworking blades, panel-processing machinery and furniture hardware under one business, helping customers explore related products and services through a single point of contact.',
    overviewParagraphTwo:
      'Our goal is to support manufacturers with relevant products, dependable communication and practical assistance for their woodworking requirements.',
    approachText:
      'Every manufacturing floor operates with distinct panel substrates, production volumes, and machinery setups. Rather than offering generic off-the-shelf packages, our four divisions coordinate to help furniture, kitchen, and door manufacturers identify suitable adhesives, tooling, panel-processing equipment, spare parts, and hardware fittings through structured consultation.',
  },
  footer: {
    summaryText:
      'Integrated industrial solutions across Adhesi Pro adhesives, PCD & TCT woodworking saw blades, panel-processing machinery, and PVC edge-banding tapes & furniture hardware.',
    copyrightText: '© Modu Pro Innovation Pvt. Ltd. All rights reserved.',
  },
  privacyNotice:
    'Information submitted through our enquiry forms is used solely by Modu Pro Innovation Pvt. Ltd. to review and respond to your business requirement and route your enquiry to the relevant division.',
};

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SETTINGS);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshSiteData = useCallback(async () => {
    try {
      const [settingsData, divisionsData] = await Promise.all([
        publicApi.getSiteSettings(),
        publicApi.getDivisions(),
      ]);
      if (settingsData) {
        setSiteSettings((prev) => ({ ...prev, ...settingsData }));
      }
      if (Array.isArray(divisionsData)) {
        setDivisions(divisionsData);
      }
    } catch (_) {
      // Keep clean default settings if backend is momentarily unreachable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSiteData();
  }, [refreshSiteData]);

  return (
    <SiteContext.Provider
      value={{
        siteSettings,
        divisions,
        loading,
        refreshSiteData,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return ctx;
}
