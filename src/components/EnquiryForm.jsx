import React, { useState, useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { publicApi } from '../services/api';
import { useSite } from '../context/SiteContext';
import { useToast } from '../context/ToastContext';
import CustomDropdown from './CustomDropdown';

export default function EnquiryForm({
  defaultDivisionSlug = '',
  defaultDivisionName = '',
  defaultProduct = '',
  defaultServiceCategory = '',
  enquiryType = 'general',
  sourcePage = '/contact',
  showServiceFields = false,
  serviceCategories = [],
  heading = 'Send a Business Enquiry',
  subheading = 'Tell us about your manufacturing or machinery requirement, and our team will direct your enquiry to the relevant division.',
}) {
  const { siteSettings, divisions } = useSite();
  const { addToast } = useToast();
  const formId = useId();

  const [submissionResult, setSubmissionResult] = useState(null);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    // Modern Web Guidance: forms — validate on blur and clear errors on input
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      companyName: '',
      phone: '',
      email: '',
      divisionName:
        defaultDivisionName ||
        ((defaultDivisionSlug === 'adhesi-pro' || defaultDivisionSlug === 'adhhesi-pro')
          ? siteSettings?.adhesiBrandSpelling || 'Adhhesi Pro'
          : defaultDivisionSlug === 'pcd-blades'
          ? 'Wood Working & Modular Furniture Tools'
          : defaultDivisionSlug === 'panel-processing'
          ? 'Panel Processing Machines Division'
          : defaultDivisionSlug === 'edge-banding-hardware'
          ? 'PVC Edge-Banding Tapes & Hardware'
          : 'General / Multi-Division'),
      serviceCategory: defaultServiceCategory || '',
      machineOrProductDetails: defaultProduct || '',
      message: defaultProduct
        ? `We would like to enquire about ${defaultProduct}. Please share product availability and compatibility details.`
        : '',
      consentAccepted: true,
      websiteHoneypot: '',
    },
  });

  useEffect(() => {
    if (defaultProduct) {
      setValue('machineOrProductDetails', defaultProduct);
      setValue(
        'message',
        `We would like to enquire about ${defaultProduct}. Please share product availability and compatibility details.`
      );
    }
  }, [defaultProduct, setValue]);

  useEffect(() => {
    if (defaultServiceCategory) {
      setValue('serviceCategory', defaultServiceCategory);
    }
  }, [defaultServiceCategory, setValue]);

  const selectedDivisionName = watch('divisionName');
  const selectedServiceCategory = watch('serviceCategory');

  const divisionOptions =
    divisions && divisions.length > 0
      ? divisions.map((d, idx) => ({
          name:
            (d.slug === 'adhesi-pro' || d.slug === 'adhhesi-pro') && siteSettings?.adhesiBrandSpelling
              ? siteSettings.adhesiBrandSpelling
              : d.name,
          slug: d.slug,
          code: d.code || `0${idx + 1}`,
          subtitle: d.subtitle || '',
        }))
      : [
          {
            name: siteSettings?.adhesiBrandSpelling || 'Adhhesi Pro',
            slug: 'adhesi-pro',
            code: '01',
            subtitle: 'PVAC, D3/D2, PVC/Acrylic & PUR Adhesives',
          },
          {
            name: 'Wood Working & Modular Furniture Tools',
            slug: 'pcd-blades',
            code: '02',
            subtitle: 'Panel Processing & Solid Wood Machine Tools',
          },
          {
            name: 'Panel Processing Machines Division',
            slug: 'panel-processing',
            code: '03',
            subtitle: 'Edge Banders, CNC, Panel Saws & Hydraulic Presses',
          },
          {
            name: 'PVC Edge-Banding Tapes & Hardware',
            slug: 'edge-banding-hardware',
            code: '04',
            subtitle: 'PVC Edge Tapes, Hinges, Channels & KD Fittings',
          },
        ];

  const divisionDropdownOptions = [
    {
      value: 'General / Multi-Division',
      label: 'General / Multiple Divisions (Single Point of Contact)',
      subtitle: 'Integrated industrial woodworking supply and machinery support',
      badge: 'ALL',
    },
    ...divisionOptions.map((div) => ({
      value: div.name,
      label: div.name,
      subtitle: div.subtitle,
      badge: div.code,
    })),
  ];

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const matchedDiv = divisionOptions.find((d) => d.name === values.divisionName);
      const response = await publicApi.submitEnquiry({
        ...values,
        divisionSlug: matchedDiv?.slug || defaultDivisionSlug || '',
        enquiryType,
        sourcePage,
      });

      if (response?.success && response?.data?.reference) {
        setSubmissionResult(response.data);
        addToast({
          type: 'success',
          title: `Enquiry Recorded (${response.data.reference})`,
          message: 'Your requirement has been saved and routed to the relevant division.',
        });
      } else {
        throw new Error('Unexpected response from server.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to submit your enquiry at this moment. Please verify your connection or contact us directly by phone.';
      setServerError(msg);
      addToast({
        type: 'error',
        title: 'Submission Error',
        message: msg,
      });
    }
  };

  if (submissionResult) {
    return (
      <div
        role="region"
        aria-live="polite"
        className="bg-[#16294D] border border-[#D9C08B]/30 rounded-[1.75rem] p-8 sm:p-10 space-y-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#0A1428] rounded-[1.75rem] flex items-center justify-center shrink-0">
            <CheckCircle2 aria-hidden="true" className="w-6 h-6 text-[#D9C08B]" />
          </div>
          <div>
            <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
              Enquiry Logged in Database
            </p>
            <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#F4EEDF] mt-1">
              Thank You, {submissionResult.fullName}
            </h3>
            <p className="text-sm text-[#F4EEDF]/80 mt-2 leading-relaxed">
              Your enquiry for{' '}
              <span className="text-[#F4EEDF] font-medium">{submissionResult.companyName}</span> has
              been recorded and assigned to{' '}
              <span className="text-[#D9C08B] font-medium">{submissionResult.divisionName}</span>.
            </p>
          </div>
        </div>

        <div className="bg-[#0A1428] border border-[#D9C08B]/20 rounded-[1.5rem] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#F4EEDF]/65 block">
              Enquiry Reference Code
            </span>
            <span className="font-mono-code text-xl font-semibold text-[#D9C08B] mt-0.5 block">
              {submissionResult.reference}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSubmissionResult(null);
              reset();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#16294D] rounded-[1.75rem] text-xs uppercase tracking-widest text-[#F4EEDF] hover:text-[#D9C08B] transition-colors"
          >
            <RotateCcw aria-hidden="true" className="w-3.5 h-3.5" />
            <span>Submit Another Enquiry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      action="/api/public/enquiries"
      method="POST"
      noValidate
      className="bg-[#0A1428]/84 backdrop-blur-md border border-[#D9C08B]/35 shadow-[0_28px_70px_-15px_rgba(10,20,40,0.85)] rounded-[1.75rem] p-6 sm:p-8 lg:p-10"
    >
      <div className="pb-6 mb-7 border-b border-[#D9C08B]/20">
        <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
          Direct Division Routing
        </p>
        <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#F4EEDF] mt-1">
          {heading}
        </h3>
        {subheading && (
          <p className="text-sm text-[#F4EEDF]/75 mt-2 leading-relaxed">{subheading}</p>
        )}
      </div>

      {/* Anti-spam honeypot hidden via canonical visually-hidden class */}
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor={`${formId}-honeypot`}>Leave this field blank</label>
        <input
          id={`${formId}-honeypot`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('websiteHoneypot')}
        />
      </div>

      {serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-6 p-4 bg-[#0A1428] rounded-[1.75rem] flex items-start gap-3 text-sm text-[#F4EEDF]"
        >
          <AlertCircle aria-hidden="true" className="w-5 h-5 text-[#D9C08B] shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
        {/* Full Name */}
        <div>
          <label
            htmlFor={`${formId}-fullName`}
            className="block text-xs font-medium uppercase tracking-wider text-[#F4EEDF] mb-1.5"
          >
            Full Name <span className="text-[#D9C08B]">*</span>
          </label>
          <input
            id={`${formId}-fullName`}
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? `${formId}-fullName-err` : undefined}
            className="w-full px-4 py-3 bg-[#0A1428] border border-[#D9C08B]/30 focus:border-[#D9C08B] rounded-[1.5rem] text-[#F4EEDF] placeholder-[#F4EEDF]/35 transition-colors"
            placeholder="e.g., Rajesh Sharma"
            {...register('fullName', {
              required: 'Please enter your full name.',
              minLength: { value: 2, message: 'Name must be at least 2 characters.' },
            })}
          />
          {errors.fullName && (
            <p
              id={`${formId}-fullName-err`}
              role="alert"
              className="mt-1.5 text-xs text-[#D9C08B] flex items-center gap-1.5"
            >
              <AlertCircle aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.fullName.message}</span>
            </p>
          )}
        </div>

        {/* Company Name */}
        <div>
          <label
            htmlFor={`${formId}-companyName`}
            className="block text-xs font-medium uppercase tracking-wider text-[#F4EEDF] mb-1.5"
          >
            Company Name <span className="text-[#D9C08B]">*</span>
          </label>
          <input
            id={`${formId}-companyName`}
            type="text"
            autoComplete="organization"
            aria-invalid={Boolean(errors.companyName)}
            aria-describedby={errors.companyName ? `${formId}-companyName-err` : undefined}
            className="w-full px-4 py-3 bg-[#0A1428] border border-[#D9C08B]/30 focus:border-[#D9C08B] rounded-[1.5rem] text-[#F4EEDF] placeholder-[#F4EEDF]/35 transition-colors"
            placeholder="e.g., Apex Modular Interiors Pvt. Ltd."
            {...register('companyName', {
              required: 'Please enter your company or workshop name.',
              minLength: { value: 2, message: 'Company name must be at least 2 characters.' },
            })}
          />
          {errors.companyName && (
            <p
              id={`${formId}-companyName-err`}
              role="alert"
              className="mt-1.5 text-xs text-[#D9C08B] flex items-center gap-1.5"
            >
              <AlertCircle aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.companyName.message}</span>
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor={`${formId}-phone`}
            className="block text-xs font-medium uppercase tracking-wider text-[#F4EEDF] mb-1.5"
          >
            Phone Number <span className="text-[#D9C08B]">*</span>
          </label>
          <input
            id={`${formId}-phone`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${formId}-phone-err` : undefined}
            className="w-full px-4 py-3 bg-[#0A1428] border border-[#D9C08B]/30 focus:border-[#D9C08B] rounded-[1.5rem] text-[#F4EEDF] placeholder-[#F4EEDF]/35 transition-colors"
            placeholder="+91 98765 43210"
            {...register('phone', {
              required: 'Please enter a contact phone number.',
              pattern: {
                value: /^[+\d\s\-()]{7,20}$/,
                message: 'Please enter a valid 10-digit mobile or landline number.',
              },
            })}
          />
          {errors.phone && (
            <p
              id={`${formId}-phone-err`}
              role="alert"
              className="mt-1.5 text-xs text-[#D9C08B] flex items-center gap-1.5"
            >
              <AlertCircle aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.phone.message}</span>
            </p>
          )}
        </div>

        {/* Business Email */}
        <div>
          <label
            htmlFor={`${formId}-email`}
            className="block text-xs font-medium uppercase tracking-wider text-[#F4EEDF] mb-1.5"
          >
            Email Address <span className="text-[#D9C08B]">*</span>
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${formId}-email-err` : undefined}
            className="w-full px-4 py-3 bg-[#0A1428] border border-[#D9C08B]/30 focus:border-[#D9C08B] rounded-[1.5rem] text-[#F4EEDF] placeholder-[#F4EEDF]/35 transition-colors"
            placeholder="procurement@company.com"
            {...register('email', {
              required: 'Please enter your email address.',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address.',
              },
            })}
          />
          {errors.email && (
            <p
              id={`${formId}-email-err`}
              role="alert"
              className="mt-1.5 text-xs text-[#D9C08B] flex items-center gap-1.5"
            >
              <AlertCircle aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.email.message}</span>
            </p>
          )}
        </div>

        {/* Product or Service Division */}
        <div className={showServiceFields ? 'sm:col-span-1' : 'sm:col-span-2'}>
          <CustomDropdown
            id={`${formId}-divisionName`}
            label="Product or Service Division *"
            options={divisionDropdownOptions}
            value={selectedDivisionName}
            onChange={(val) =>
              setValue('divisionName', val, { shouldValidate: true, shouldDirty: true })
            }
            placeholder="Select a Division..."
            error={errors.divisionName?.message}
          />
        </div>

        {/* Optional Service Category field for Services & Support Page */}
        {showServiceFields && (
          <div>
            <CustomDropdown
              id={`${formId}-serviceCategory`}
              label="Service Category"
              options={
                serviceCategories.length > 0
                  ? serviceCategories
                  : [
                      'Panel-Processing Machinery Consultation',
                      'Machinery Spare Parts Supply',
                      'Machine Installation Support',
                      'Preventive Maintenance',
                      'Troubleshooting & Diagnostics',
                      'Mechanical & Electrical Repairs',
                      'Computerized-Control Servicing',
                    ]
              }
              value={selectedServiceCategory}
              onChange={(val) =>
                setValue('serviceCategory', val, { shouldValidate: true, shouldDirty: true })
              }
              placeholder="Select Service Category"
              isClearable
            />
          </div>
        )}

        {/* Machine or Product Details */}
        <div className="sm:col-span-2">
          <label
            htmlFor={`${formId}-machineOrProductDetails`}
            className="block text-xs font-medium uppercase tracking-wider text-[#F4EEDF] mb-1.5"
          >
            Machine or Product Details (Optional)
          </label>
          <input
            id={`${formId}-machineOrProductDetails`}
            type="text"
            className="w-full px-4 py-3 bg-[#0A1428] border border-[#D9C08B]/30 focus:border-[#D9C08B] rounded-[1.5rem] text-[#F4EEDF] placeholder-[#F4EEDF]/35 transition-colors"
            placeholder="e.g., Lockpro WR 3, Automatic Edge Bander, PCD Pre-Milling Cutter, or Telescopic Channels"
            {...register('machineOrProductDetails')}
          />
        </div>

        {/* Requirement / Message */}
        <div className="sm:col-span-2">
          <label
            htmlFor={`${formId}-message`}
            className="block text-xs font-medium uppercase tracking-wider text-[#F4EEDF] mb-1.5"
          >
            Requirement / Message <span className="text-[#D9C08B]">*</span>
          </label>
          <textarea
            id={`${formId}-message`}
            rows={4}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? `${formId}-message-err` : undefined}
            className="w-full px-4 py-3 bg-[#0A1428] border border-[#D9C08B]/30 focus:border-[#D9C08B] rounded-[1.5rem] text-[#F4EEDF] placeholder-[#F4EEDF]/35 transition-colors resize-y"
            placeholder="Describe your application, panel material, machinery requirement, or product enquiry..."
            {...register('message', {
              required: 'Please describe your requirement.',
              minLength: {
                value: 10,
                message: 'Please provide at least 10 characters describing your requirement.',
              },
            })}
          />
          {errors.message && (
            <p
              id={`${formId}-message-err`}
              role="alert"
              className="mt-1.5 text-xs text-[#D9C08B] flex items-center gap-1.5"
            >
              <AlertCircle aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.message.message}</span>
            </p>
          )}
        </div>

        {/* Consent Checkbox */}
        <div className="sm:col-span-2">
          <div className="flex items-start gap-3">
            <input
              id={`${formId}-consent`}
              type="checkbox"
              className="mt-1 w-4 h-4 min-h-0 accent-[#D9C08B]"
              {...register('consentAccepted', {
                required: 'Please confirm consent to submit your enquiry.',
              })}
            />
            <label htmlFor={`${formId}-consent`} className="text-xs text-[#F4EEDF]/75 leading-relaxed">
              {siteSettings?.privacyNotice ||
                'I consent to Modu Pro Innovation Pvt. Ltd. storing and using these details to review and respond to this business enquiry.'}
            </label>
          </div>
          {errors.consentAccepted && (
            <p role="alert" className="mt-1.5 text-xs text-[#D9C08B]">
              {errors.consentAccepted.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-7 pt-5 border-t border-[#D9C08B]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-[#F4EEDF]/65">
          All fields marked with <span className="text-[#D9C08B]">*</span> are mandatory.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-[0.18em] rounded-[1.75rem] hover:bg-[#F4EEDF] disabled:opacity-60 transition-colors cursor-pointer"
        >
          <span>{isSubmitting ? 'Recording Enquiry...' : 'Submit Enquiry'}</span>
          <Send aria-hidden="true" className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
