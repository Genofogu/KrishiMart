import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, CheckCircle, AlertCircle, Loader, Camera, Link as LinkIcon, Sparkles, Cloud, Trash2, Eye, Star } from 'lucide-react';
import { uploadToCloudinary, getTransformedImageUrl, getCloudinaryConfig } from '../services/cloudinaryService';
import { CloudinaryAsset, CloudinaryTransformationOptions } from '../types';

interface CloudinaryUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
  category?: CloudinaryAsset['category'];
  label?: string;
  helperText?: string;
  allowCamera?: boolean;
  aspectRatioPreset?: 'square' | 'standard' | 'landscape' | 'all';
  onUploadSuccess?: (result: any) => void;
}

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  images = [],
  onChange,
  maxFiles = 6,
  category = 'produce',
  label = 'Produce Images (Cloudinary CDN)',
  helperText = 'Upload high-resolution farm photos. Optimized automatically by Cloudinary with q_auto, f_auto.',
  allowCamera = true,
  aspectRatioPreset = 'standard',
  onUploadSuccess
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [previewTransform, setPreviewTransform] = useState<CloudinaryTransformationOptions>({ quality: 'auto', format: 'auto' });
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const config = getCloudinaryConfig();

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxFiles - images.length;
    if (remainingSlots <= 0) {
      setErrorMessage(`Maximum limit of ${maxFiles} images reached.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);
    setErrorMessage('');
    setUploadProgress(10);
    setUploadStatus(`Preparing ${filesToUpload.length} image(s)...`);

    const newUploadedUrls: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      setUploadStatus(`Uploading ${file.name} to Cloudinary...`);

      try {
        const result = await uploadToCloudinary(file, {
          category: category as CloudinaryAsset['category'],
          tags: ['krishi-mart', category || 'produce', 'produce-listing'],
          onProgress: (pct) => {
            const overallPct = Math.round(((i + pct / 100) / filesToUpload.length) * 100);
            setUploadProgress(overallPct);
          }
        });

        const finalUrl = result.secure_url || result.url;
        newUploadedUrls.push(finalUrl);
        if (onUploadSuccess) onUploadSuccess(result);
      } catch (err: any) {
        console.error('Failed to upload file to Cloudinary', err);
        setErrorMessage(`Failed to upload ${file.name}: ${err?.message || 'Error'}`);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
    setUploadStatus('');

    if (newUploadedUrls.length > 0) {
      onChange([...images, ...newUploadedUrls]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsUploading(true);
    setUploadStatus('Processing URL with Cloudinary...');
    setUploadProgress(30);

    try {
      const result = await uploadToCloudinary(urlInput.trim(), {
        category: category as CloudinaryAsset['category'],
        customName: 'remote_' + Date.now(),
        onProgress: (p) => setUploadProgress(p)
      });

      const finalUrl = result.secure_url || result.url;
      onChange([...images, finalUrl]);
      setUrlInput('');
      if (onUploadSuccess) onUploadSuccess(result);
    } catch (err: any) {
      // If direct fetch fails, allow the URL directly
      onChange([...images, urlInput.trim()]);
      setUrlInput('');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimary = (indexToMakePrimary: number) => {
    if (indexToMakePrimary === 0) return;
    const selected = images[indexToMakePrimary];
    const rest = images.filter((_, idx) => idx !== indexToMakePrimary);
    onChange([selected, ...rest]);
  };

  return (
    <div className="space-y-3">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <Cloud size={16} className="text-emerald-600" />
            {label}
            <span className="text-xs font-normal text-gray-500">
              ({images.length}/{maxFiles})
            </span>
          </label>
          <p className="text-[11px] text-gray-500">{helperText}</p>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-semibold text-gray-600 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'upload' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-gray-900'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'url' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-gray-900'
            }`}
          >
            Paste URL
          </button>
        </div>
      </div>

      {/* Cloudinary Active Badge */}
      <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200/80 px-3 py-1.5 rounded-lg text-xs text-emerald-900">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-emerald-600" />
          <span>
            Connected Cloud: <strong className="font-semibold">{config.cloudName || 'krishi-mart'}</strong>
          </span>
        </div>
        <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-medium">
          Auto-Compression Active
        </span>
      </div>

      {/* Upload Area / Dropzone */}
      {images.length < maxFiles && (
        <>
          {activeTab === 'upload' ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                  : 'border-gray-300 hover:border-emerald-500 bg-gray-50/70 hover:bg-emerald-50/30'
              } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files || [])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files || [])}
              />

              {isUploading ? (
                <div className="py-3 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-emerald-800 font-semibold text-sm">
                    <Loader size={18} className="animate-spin text-emerald-600" />
                    {uploadStatus || 'Uploading to Cloudinary...'}
                  </div>
                  <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{uploadProgress}% complete</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <Upload size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800">
                      Click to browse or drag & drop photos
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      JPG, PNG, WebP, AVIF up to 10MB each
                    </p>
                  </div>

                  {allowCamera && (
                    <div className="pt-2 flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-emerald-500 transition-colors shadow-xs"
                      >
                        <Camera size={14} className="text-emerald-600" />
                        Take Photo (Mobile)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* URL Input Tab */
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or Cloudinary URL"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  disabled={isUploading}
                />
              </div>
              <button
                type="submit"
                disabled={!urlInput.trim() || isUploading}
                className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? <Loader size={16} className="animate-spin" /> : 'Import'}
              </button>
            </form>
          )}
        </>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Image Gallery & Preview Cards */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-medium text-gray-600">
            <span>Uploaded Media ({images.length})</span>
            <span className="text-[11px] text-emerald-700 flex items-center gap-1">
              <CheckCircle size={12} /> Star = Cover Photo
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((imgUrl, idx) => {
              const isPrimary = idx === 0;
              const thumbUrl = getTransformedImageUrl(imgUrl, {
                width: 240,
                height: 240,
                crop: 'fill',
                quality: 'auto',
                format: 'auto'
              });

              return (
                <div
                  key={idx}
                  className={`relative group rounded-xl overflow-hidden border-2 transition-all bg-gray-900 ${
                    isPrimary ? 'border-emerald-500 shadow-md ring-2 ring-emerald-200' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={thumbUrl}
                    alt={`Product upload ${idx + 1}`}
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback
                      (e.target as HTMLImageElement).src = imgUrl;
                    }}
                  />

                  {/* Top Bar Badges & Controls */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-center pointer-events-none">
                    {isPrimary ? (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <Star size={10} fill="white" /> Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="pointer-events-auto bg-black/60 hover:bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs flex items-center gap-1"
                        title="Set as Main Cover Image"
                      >
                        <Star size={10} /> Set Cover
                      </button>
                    )}

                    <div className="flex gap-1 pointer-events-auto">
                      <button
                        type="button"
                        onClick={() => setPreviewModalUrl(imgUrl)}
                        className="bg-black/60 hover:bg-black/80 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
                        title="Preview"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                        title="Delete Image"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Cloudinary CDN Indicator Bottom */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 pt-3 text-[10px] text-white flex justify-between items-center opacity-80">
                    <span className="flex items-center gap-1 truncate max-w-[85px] font-mono text-[9px] text-emerald-300">
                      <Cloud size={10} /> CDN Opt
                    </span>
                    <span className="text-gray-300 text-[9px]">#{idx + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Cloud className="text-emerald-400" size={18} />
                <h4 className="font-bold text-sm">Cloudinary High-Res Media Viewer</h4>
              </div>
              <button
                onClick={() => setPreviewModalUrl(null)}
                className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-gray-950 flex items-center justify-center min-h-[300px] max-h-[60vh]">
              <img
                src={getTransformedImageUrl(previewModalUrl, { quality: 'auto:best', format: 'auto' })}
                alt="Enlarged preview"
                className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-md"
              />
            </div>

            <div className="p-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600 border-t">
              <div className="truncate max-w-md font-mono text-[11px] text-gray-500">
                {previewModalUrl}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(previewModalUrl);
                    alert('Cloudinary URL copied to clipboard!');
                  }}
                  className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg font-semibold hover:bg-emerald-200"
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModalUrl(null)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
