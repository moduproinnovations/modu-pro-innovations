import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import SeoHead from '../../components/SeoHead';

export default function AdminSettings() {
  const { refreshSiteData } = useSite();
  const { addToast } = useToast();

  const [settings, setSettings] = useState(null);
  const [phonesText, setPhonesText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .getSiteSettings()
      .then((data) => {
        setSettings(data);
        setPhonesText((data?.contact?.phones || []).join('\n'));
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);

    const payload = {
      ...settings,
      contact: {
        ...settings.contact,
        phones: phonesText
          .split('\n')
          .map((p) => p.trim())
          .filter(Boolean),
      },
    };

    try {
      const res = await adminApi.updateSiteSettings(payload);
      setSettings(res.data);
      await refreshSiteData();
      addToast({
        type: 'success',
        title: 'Site Settings Saved',
        message: 'Public website configuration has been updated.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.response?.data?.message || 'Unable to update site settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="bg-[#16294D] border border-[#3F5E8C]/40 p-10 text-center text-xs text-[#F4EEDF]/70">
        Loading site settings...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl">
      <SeoHead title="Site Settings | Admin" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#3F5E8C]/40">
        <div>
          <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
            Global Corporate Configuration
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#F4EEDF] mt-1">
            Site Settings &amp; Verified Contact Details
          </h1>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          <Save aria-hidden="true" className="w-4 h-4" />
          <span>{saving ? 'Saving Settings...' : 'Save All Changes'}</span>
        </button>
      </div>

      {/* 1. Brand Identity & Configurable Brand Spelling */}
      <div className="bg-[#16294D] border border-[#3F5E8C]/50 p-6 sm:p-8 space-y-5">
        <h2 className="font-display text-2xl font-semibold text-[#F4EEDF] border-b border-[#3F5E8C]/35 pb-3">
          1. Brand Identity &amp; Division 1 Spelling
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={settings.companyName || ''}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
              Company Tagline
            </label>
            <input
              type="text"
              value={settings.tagline || ''}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
              Adhesive Brand Spelling (Default: Adhhesi Pro)
            </label>
            <input
              type="text"
              value={settings.adhesiBrandSpelling || 'Adhhesi Pro'}
              onChange={(e) => setSettings({ ...settings, adhesiBrandSpelling: e.target.value })}
              className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
              Logo Asset Path
            </label>
            <input
              type="text"
              value={settings.logoUrl || ''}
              onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
            />
          </div>
        </div>
      </div>

      {/* 2. Contact Information & Client Verification Toggle */}
      <div className="bg-[#16294D] border border-[#3F5E8C]/50 p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3F5E8C]/35 pb-3">
          <h2 className="font-display text-2xl font-semibold text-[#F4EEDF]">
            2. Corporate Contact Information
          </h2>
          <label className="flex items-center gap-2 text-xs text-[#D9C08B] cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(settings.contact?.isContactVerified)}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, isContactVerified: e.target.checked },
                })
              }
              className="w-4 h-4 min-h-0 accent-[#D9C08B]"
            />
            <span>Mark Contact Details as Client-Verified</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
              Business Address
            </label>
            <input
              type="text"
              value={settings.contact?.address || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, address: e.target.value },
                })
              }
              className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
              Public Contact Email
            </label>
            <input
              type="email"
              value={settings.contact?.email || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, email: e.target.value },
                })
              }
              className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
              Enquiry Notification Recipient Email (Internal)
            </label>
            <input
              type="email"
              value={settings.notification?.enquiryRecipientEmail || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notification: {
                    ...settings.notification,
                    enquiryRecipientEmail: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
              Phone Numbers (One per line)
            </label>
            <textarea
              rows={2}
              value={phonesText}
              onChange={(e) => setPhonesText(e.target.value)}
              className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
              Business Hours
            </label>
            <input
              type="text"
              value={settings.contact?.businessHours || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, businessHours: e.target.value },
                })
              }
              className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
              Optional Google Maps Embed URL (iframe src)
            </label>
            <input
              type="url"
              value={settings.contact?.mapEmbedUrl || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, mapEmbedUrl: e.target.value },
                })
              }
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
            />
          </div>
        </div>
      </div>

      {/* 3. Homepage Hero & About Us Approved Content */}
      <div className="bg-[#16294D] border border-[#3F5E8C]/50 p-6 sm:p-8 space-y-5">
        <h2 className="font-display text-2xl font-semibold text-[#F4EEDF] border-b border-[#3F5E8C]/35 pb-3">
          3. Homepage Hero &amp; Approved About Us Copy
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
              Homepage Hero Heading
            </label>
            <input
              type="text"
              value={settings.hero?.heading || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  hero: { ...settings.hero, heading: e.target.value },
                })
              }
              className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
              Homepage Hero Supporting Text
            </label>
            <textarea
              rows={2}
              value={settings.hero?.supportingText || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  hero: { ...settings.hero, supportingText: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
              About Us — Paragraph 1
            </label>
            <textarea
              rows={3}
              value={settings.aboutContent?.overviewParagraphOne || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  aboutContent: {
                    ...settings.aboutContent,
                    overviewParagraphOne: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
              About Us — Paragraph 2
            </label>
            <textarea
              rows={2}
              value={settings.aboutContent?.overviewParagraphTwo || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  aboutContent: {
                    ...settings.aboutContent,
                    overviewParagraphTwo: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-sm text-[#F4EEDF]"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Action for Mobile Convenience */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          <Save aria-hidden="true" className="w-4 h-4" />
          <span>{saving ? 'Saving Settings...' : 'Save All Changes'}</span>
        </button>
      </div>
    </form>
  );
}
