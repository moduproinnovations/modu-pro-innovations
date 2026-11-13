import React, { useEffect, useRef, useState, useId } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowUpRight, CheckCircle2, Layers } from 'lucide-react';

export default function ProductDetailModal({ product, onClose, onSelectForEnquiry }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    setActiveImageIdx(0);
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (product && !dialog.open) {
      dialog.showModal();
    } else if (!product && dialog.open) {
      dialog.close();
    }
  }, [product]);

  // Modern Web Guidance: dialog — reset returnValue on close & pointer coordinate fallback for closedby="any"
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = '';
      if (onClose) onClose();
    };

    dialog.addEventListener('close', handleClose);

    let cleanupFallback = null;
    if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      const onPointerDown = (e) => {
        pressedOutside = outside(e);
      };
      const onPointerUp = (e) => {
        if (pressedOutside && outside(e)) {
          dialog.close();
        }
      };
      dialog.addEventListener('pointerdown', onPointerDown);
      dialog.addEventListener('pointerup', onPointerUp);
      cleanupFallback = () => {
        dialog.removeEventListener('pointerdown', onPointerDown);
        dialog.removeEventListener('pointerup', onPointerUp);
      };
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
      if (cleanupFallback) cleanupFallback();
    };
  }, [onClose]);

  const images =
    product?.images && product.images.length > 0
      ? product.images
      : [
          {
            url: '/assets/products/panel-processing/edge-banding-machine.png',
            alt: product?.name || 'Product Image',
          },
        ];

  const verifiedSpecs = Array.isArray(product?.specifications)
    ? product.specifications.filter((s) => s.isVerified !== false)
    : [];

  return (
    /* MANDATORY per dialog guide: no role="dialog" or aria-modal on native modal <dialog> */
    <dialog
      ref={dialogRef}
      {...{ closedby: 'any' }}
      aria-labelledby={titleId}
      className="w-full max-w-4xl bg-[#16294D] text-[#F4EEDF] rounded-[1.75rem] overflow-y-auto"
    >
      {product && (
        <div className="p-5 sm:p-8 lg:p-10">
          {/* Top Bar */}
          <div className="flex items-start justify-between gap-4 pb-4 sm:pb-5 border-b border-[#D9C08B]/20">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono-code uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[#D9C08B]">
                <span>{product.division?.name || 'Modu Pro Division'}</span>
                <span>•</span>
                <span className="text-[#F4EEDF]/75">{product.category}</span>
              </div>
              <h2
                id={titleId}
                className="font-display text-xl sm:text-3xl font-semibold text-[#F4EEDF] mt-1.5"
              >
                {product.name}
              </h2>
            </div>

            <form method="dialog">
              <button
                type="submit"
                value="close"
                autoFocus
                aria-label="Close product details dialog"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-[#0A1428] rounded-[1.25rem] sm:rounded-[1.5rem] text-[#F4EEDF] hover:text-[#D9C08B] inline-flex items-center justify-center transition-colors shrink-0"
              >
                <X aria-hidden="true" className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mt-6 sm:mt-7">
            {/* Left: Product Image Gallery */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="bg-[#0A1428] border border-[#D9C08B]/20 rounded-[1.5rem] aspect-square p-4 sm:p-6 flex items-center justify-center">
                <img
                  src={images[activeImageIdx]?.url || images[0].url}
                  alt={images[activeImageIdx]?.alt || product.name}
                  className="max-h-60 sm:max-h-72 w-auto object-contain"
                />
              </div>

              {images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={img.url + idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 p-1.5 bg-[#0A1428] rounded-2xl transition-colors shrink-0 ${
                        activeImageIdx === idx ? 'ring-2 ring-[#D9C08B]' : ''
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt || `${product.name} view ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Description, Verified Specifications, Applications */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-xs font-mono-code uppercase tracking-[0.2em] text-[#D9C08B] mb-2">
                  Product Overview
                </h3>
                <p className="text-sm sm:text-base text-[#F4EEDF]/90 leading-relaxed">
                  {product.fullDescription || product.shortDescription}
                </p>
              </div>

              {product.highlights && product.highlights.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono-code uppercase tracking-[0.2em] text-[#D9C08B] mb-2.5">
                    Key Highlights
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.highlights.map((h) => (
                      <span
                        key={h}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A1428] rounded-[1.75rem] text-xs text-[#F4EEDF]"
                      >
                        <CheckCircle2 aria-hidden="true" className="w-3.5 h-3.5 text-[#D9C08B]" />
                        <span>{h}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {verifiedSpecs.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono-code uppercase tracking-[0.2em] text-[#D9C08B] mb-2.5">
                    Verified Product Information
                  </h3>
                  <dl className="divide-y divide-[#F4EEDF]/10 text-sm">
                    {verifiedSpecs.map((spec) => (
                      <div
                        key={spec.label}
                        className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                      >
                        <dt className="text-[#F4EEDF]/70 font-medium">{spec.label}</dt>
                        <dd className="text-[#F4EEDF] font-mono-code text-xs sm:text-right">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {product.applications && product.applications.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono-code uppercase tracking-[0.2em] text-[#D9C08B] mb-2.5">
                    Industrial Applications
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[#F4EEDF]/85">
                    {product.applications.map((app) => (
                      <li key={app} className="flex items-start gap-2.5">
                        <Layers
                          aria-hidden="true"
                          className="w-4 h-4 text-[#D9C08B] shrink-0 mt-0.5"
                        />
                        <span>{app}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-[#D9C08B]/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                {onSelectForEnquiry ? (
                  <button
                    type="button"
                    onClick={() => {
                      dialogRef.current?.close();
                      onSelectForEnquiry(product);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-[0.16em] sm:tracking-[0.18em] rounded-[1.75rem] hover:bg-[#F4EEDF] transition-colors"
                  >
                    <span>Enquire About This Product</span>
                    <ArrowUpRight aria-hidden="true" className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    to={`/contact?division=${encodeURIComponent(
                      product.division?.slug || ''
                    )}&product=${encodeURIComponent(product.name)}`}
                    onClick={() => dialogRef.current?.close()}
                    className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-[0.16em] sm:tracking-[0.18em] rounded-[1.75rem] hover:bg-[#F4EEDF] transition-colors"
                  >
                    <span>Enquire About This Product</span>
                    <ArrowUpRight aria-hidden="true" className="w-4 h-4" />
                  </Link>
                )}

                <form method="dialog">
                  <button
                    type="submit"
                    value="close"
                    className="w-full sm:w-auto px-5 py-3 bg-[#0A1428] rounded-[1.5rem] text-xs uppercase tracking-[0.16em] text-[#F4EEDF]/85 hover:text-[#D9C08B] transition-colors"
                  >
                    Close Window
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
