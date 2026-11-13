import { useEffect } from 'react';
import { useSite } from '../context/SiteContext';

export default function SeoHead({ title, description, canonicalPath = '/', productSchema = null }) {
  const { siteSettings } = useSite();

  useEffect(() => {
    const companyName = siteSettings?.companyName || 'Modu Pro Innovation Pvt. Ltd.';
    const fullTitle = title
      ? `${title} | ${companyName}`
      : siteSettings?.seoDefaults?.defaultTitle ||
        `${companyName} — Complete Solutions for Woodworking & Modular Industries`;
    const metaDesc =
      description ||
      siteSettings?.seoDefaults?.defaultDescription ||
      'Modu Pro Innovation Pvt. Ltd. brings together adhesive products, precision woodworking blades, panel-processing machinery and furniture hardware.';

    document.title = fullTitle;

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attrName, attrVal] = selector.replace('meta[', '').replace(']', '').split('=');
        el.setAttribute(attrName, attrVal.replace(/"/g, ''));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', metaDesc);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', metaDesc);

    // Organization + optional Product JSON-LD structured data (verified facts only, no fabricated ratings/prices)
    const orgSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: companyName,
      description: metaDesc,
      logo: `${window.location.origin}${siteSettings?.logoUrl || '/assets/logo/modu-pro-logo.png'}`,
      email: siteSettings?.contact?.email || 'moduproinnovations2805@gmail.com',
      telephone: siteSettings?.contact?.phones?.[0] || '+91 86230 41894',
      address: {
        '@type': 'PostalAddress',
        streetAddress:
          siteSettings?.contact?.address ||
          'Plot No. 27, Hanuman Daal Mill Road, opposite Royal Touch, Nagpur – 440008',
        addressLocality: 'Nagpur',
        addressRegion: 'Maharashtra',
        postalCode: '440008',
        addressCountry: 'IN',
      },
    };

    const payload = productSchema ? [orgSchema, productSchema] : orgSchema;
    let ldScript = document.getElementById('modu-json-ld');
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.id = 'modu-json-ld';
      ldScript.type = 'application/ld+json';
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify(payload);
  }, [title, description, canonicalPath, productSchema, siteSettings]);

  return null;
}
