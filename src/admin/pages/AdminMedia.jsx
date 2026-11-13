import React, { useEffect, useState, useCallback } from 'react';
import { Upload, Copy, Trash2, Check } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import SeoHead from '../../components/SeoHead';

export default function AdminMedia() {
  const { addToast } = useToast();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [category, setCategory] = useState('product');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getMedia({ category: categoryFilter });
      setMedia(data || []);
    } catch (_) {
      // handled
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      addToast({
        type: 'error',
        title: 'File Required',
        message: 'Please choose a JPEG, PNG, WebP, or AVIF image file (max 5 MB).',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim() || file.name);
    formData.append('altText', altText.trim() || title.trim() || file.name);
    formData.append('category', category);

    setUploading(true);
    try {
      await adminApi.uploadMedia(formData);
      addToast({
        type: 'success',
        title: 'Image Uploaded',
        message: 'Asset added to the Modu Pro Media Library.',
      });
      setTitle('');
      setAltText('');
      setFile(null);
      e.target.reset();
      loadMedia();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: err.response?.data?.message || 'Unable to upload image file.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (item) => {
    navigator.clipboard?.writeText(item.url);
    setCopiedId(item._id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast({
      type: 'info',
      title: 'Asset URL Copied',
      message: item.url,
    });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Remove "${item.title}" from the Media Library?`)) return;
    try {
      await adminApi.deleteMedia(item._id);
      addToast({ type: 'info', title: 'Asset Removed', message: item.title });
      loadMedia();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.response?.data?.message || 'Could not remove media asset.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Media Library | Admin" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#3F5E8C]/40">
        <div>
          <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
            Brand &amp; Product Photography
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#F4EEDF] mt-1">
            Media Library ({media.length})
          </h1>
        </div>

        <select
          aria-label="Filter media by category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#16294D] border border-[#3F5E8C]/60 text-xs uppercase tracking-wider text-[#F4EEDF]"
        >
          <option value="all">All Categories</option>
          <option value="logo">Logo Assets</option>
          <option value="product">Product Assets</option>
          <option value="division">Division Assets</option>
          <option value="service">Service Assets</option>
          <option value="industry">Industry Assets</option>
        </select>
      </div>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="bg-[#16294D] border border-[#D9C08B]/40 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
      >
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
            Image File (Max 5 MB) *
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
            Asset Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Lockpro 808 Drum"
            className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
            Accessible Alt Text
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Descriptive alt text"
            className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[#F4EEDF] mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#0A1428] border border-[#3F5E8C]/60 text-xs text-[#F4EEDF]"
          >
            <option value="product">Product</option>
            <option value="division">Division</option>
            <option value="service">Service</option>
            <option value="industry">Industry</option>
            <option value="logo">Logo</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          <Upload aria-hidden="true" className="w-4 h-4" />
          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
        </button>
      </form>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-4 bg-[#16294D] border border-[#3F5E8C]/40 p-10 text-center text-xs text-[#F4EEDF]/70">
            Loading media assets...
          </div>
        ) : (
          media.map((item) => (
            <div
              key={item._id}
              className="bg-[#16294D] border border-[#3F5E8C]/45 flex flex-col justify-between"
            >
              <div>
                <div className="bg-[#0A1428] h-44 p-4 flex items-center justify-center border-b border-[#3F5E8C]/35">
                  <img
                    src={item.url}
                    alt={item.altText || item.title}
                    loading="lazy"
                    className="max-h-36 w-auto object-contain"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <span className="font-mono-code text-[10px] uppercase text-[#D9C08B]">
                    {item.category} • {item.storageProvider}
                  </span>
                  <p className="text-xs font-medium text-[#F4EEDF] line-clamp-1">{item.title}</p>
                  <p className="font-mono-code text-[10px] text-[#F4EEDF]/55 truncate">
                    {item.url}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-[#3F5E8C]/30 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(item)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#0A1428] border border-[#D9C08B]/40 text-[11px] text-[#D9C08B] cursor-pointer"
                >
                  {copiedId === item._id ? (
                    <>
                      <Check aria-hidden="true" className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy aria-hidden="true" className="w-3 h-3" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#0A1428] border border-[#3F5E8C]/50 text-[11px] text-[#F4EEDF]/75 hover:text-[#D9C08B] cursor-pointer"
                >
                  <Trash2 aria-hidden="true" className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
