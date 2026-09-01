import React, { useState, useEffect } from 'react';
import { Cloud, Settings, Image as ImageIcon, Sparkles, Sliders, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, Trash2, ExternalLink, X, Upload, ShieldCheck, Download, Search, Filter } from 'lucide-react';
import { getCloudinaryConfig, saveCloudinaryConfig, testCloudinaryConnection, getAllCloudinaryAssets, deleteCloudinaryAsset, getTransformedImageUrl, buildTransformationString } from '../services/cloudinaryService';
import { CloudinaryConfig, CloudinaryAsset, CloudinaryTransformationOptions } from '../types';

interface CloudinarySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type TabType = 'config' | 'media' | 'transformations';

export const CloudinarySettingsModal: React.FC<CloudinarySettingsModalProps> = ({
  isOpen,
  onClose,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('config');

  // Config State
  const [config, setConfig] = useState<CloudinaryConfig>(getCloudinaryConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Media Library State
  const [assets, setAssets] = useState<CloudinaryAsset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Transformation Lab State
  const [sampleImageUrl, setSampleImageUrl] = useState(
    'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&w=800&q=80'
  );
  const [transformWidth, setTransformWidth] = useState<number>(400);
  const [transformHeight, setTransformHeight] = useState<number>(300);
  const [transformCrop, setTransformCrop] = useState<CloudinaryTransformationOptions['crop']>('fill');
  const [transformGravity, setTransformGravity] = useState<CloudinaryTransformationOptions['gravity']>('auto');
  const [transformQuality, setTransformQuality] = useState<CloudinaryTransformationOptions['quality']>('auto');
  const [transformFormat, setTransformFormat] = useState<CloudinaryTransformationOptions['format']>('auto');
  const [transformRadius, setTransformRadius] = useState<number | 'max' | undefined>(undefined);
  const [transformBlur, setTransformBlur] = useState<number>(0);
  const [transformEffect, setTransformEffect] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setConfig(getCloudinaryConfig());
      setAssets(getAllCloudinaryAssets());
      setTestResult(null);
    }
  }, [isOpen]);

  // Listen to asset / config update events
  useEffect(() => {
    const handleAssetsUpdate = () => setAssets(getAllCloudinaryAssets());
    const handleConfigUpdate = () => setConfig(getCloudinaryConfig());

    window.addEventListener('cloudinary-assets-updated', handleAssetsUpdate);
    window.addEventListener('cloudinary-config-updated', handleConfigUpdate);

    return () => {
      window.removeEventListener('cloudinary-assets-updated', handleAssetsUpdate);
      window.removeEventListener('cloudinary-config-updated', handleConfigUpdate);
    };
  }, []);

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveCloudinaryConfig(config);
    if (showToast) showToast('Cloudinary settings saved successfully!', 'success');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testCloudinaryConnection(config.cloudName, config.uploadPreset);
    setIsTesting(false);
    setTestResult(res);
    if (showToast) {
      showToast(res.message, res.success ? 'success' : 'error');
    }
  };

  const handleApplyPresetDemo = () => {
    const demoConfig: CloudinaryConfig = {
      cloudName: 'demo',
      uploadPreset: 'sample_preset',
      apiKey: '',
      defaultFolder: 'krishi-mart/produce'
    };
    setConfig(demoConfig);
    saveCloudinaryConfig(demoConfig);
    if (showToast) showToast('Loaded Cloudinary demo credentials', 'info');
  };

  const handleDeleteAsset = (id: string) => {
    if (window.confirm('Delete this asset from your Krishi-Mart registry?')) {
      deleteCloudinaryAsset(id);
      if (showToast) showToast('Asset removed from library', 'info');
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    if (showToast) showToast('URL copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered assets
  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      asset.publicId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Current playground transformed URL
  const currentTransformationOptions: CloudinaryTransformationOptions = {
    width: transformWidth,
    height: transformHeight,
    crop: transformCrop,
    gravity: transformGravity,
    quality: transformQuality,
    format: transformFormat,
    radius: transformRadius,
    blur: transformBlur > 0 ? transformBlur : undefined,
    effect: transformEffect || undefined
  };

  const playgroundTransformedUrl = getTransformedImageUrl(sampleImageUrl, currentTransformationOptions);
  const transformationCodeString = buildTransformationString(currentTransformationOptions);

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-gray-200 flex flex-col overflow-hidden text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 sm:p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-xs shadow-inner">
              <Cloud className="text-yellow-300" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">Cloudinary Media Hub</h3>
                <span className="bg-yellow-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  CDN & Optimization
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Image uploading, auto-format (WebP/AVIF), smart cropping & digital asset management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-xl text-emerald-200 hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto text-sm font-semibold text-gray-600">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <Settings size={16} /> Cloud Configuration
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'media'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <ImageIcon size={16} /> Media Assets Library ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('transformations')}
            className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'transformations'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <Sliders size={16} /> Transformation Lab
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
          {/* 1. CONFIGURATION TAB */}
          {activeTab === 'config' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <form onSubmit={handleSaveConfig} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                    <Cloud size={18} className="text-emerald-600" /> Cloudinary Credentials
                  </h4>
                  <button
                    type="button"
                    onClick={handleApplyPresetDemo}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
                  >
                    Load Demo Preset
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Cloud Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. krishi-mart, demo, or your_cloud_name"
                      value={config.cloudName}
                      onChange={(e) => setConfig({ ...config, cloudName: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                      required
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Your Cloudinary product cloud identifier</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Upload Preset (Unsigned) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. krishi_produce_upload, ml_default"
                      value={config.uploadPreset}
                      onChange={(e) => setConfig({ ...config, uploadPreset: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                      required
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Configured in Cloudinary Settings &gt; Upload</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Default Folder
                    </label>
                    <input
                      type="text"
                      placeholder="krishi-mart/produce"
                      value={config.defaultFolder}
                      onChange={(e) => setConfig({ ...config, defaultFolder: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      API Key <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 123456789012345"
                      value={config.apiKey || ''}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Connection Status Banner */}
                {testResult && (
                  <div
                    className={`p-3 rounded-lg flex items-start gap-2.5 text-xs font-medium ${
                      testResult.success
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <strong>{testResult.success ? 'Verified:' : 'Connection Error:'}</strong> {testResult.message}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 flex flex-wrap gap-3 justify-between items-center border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {isTesting ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                    Test Connection
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
                  >
                    <Check size={14} /> Save Configuration
                  </button>
                </div>
              </form>

              {/* Cloudinary Feature Highlights */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 text-xs text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Sparkles size={14} className="text-emerald-600" /> Active Cloudinary Optimizations for Krishi-Mart
                </div>
                <ul className="list-disc list-inside space-y-1 text-emerald-800">
                  <li><strong>q_auto:</strong> Automatically selects the optimal compression level based on image content and format.</li>
                  <li><strong>f_auto:</strong> Serves cutting-edge WebP or AVIF formats dynamically to supporting modern browsers.</li>
                  <li><strong>Hyperlocal Edge CDN:</strong> Images load with minimal latency for farmers and rural consumers.</li>
                  <li><strong>Smart Farmer Document Storage:</strong> Stores soil test certificates and organic verification proofs securely.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 2. MEDIA LIBRARY TAB */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, tag, or public ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  <span className="text-gray-500 font-semibold flex items-center gap-1 shrink-0">
                    <Filter size={12} /> Category:
                  </span>
                  {['all', 'produce', 'farm', 'document', 'review', 'avatar'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-emerald-700 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assets Grid */}
              {filteredAssets.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                  <ImageIcon size={48} className="mx-auto mb-2 opacity-30 text-gray-400" />
                  <p className="font-semibold text-gray-600">No media assets found</p>
                  <p className="text-xs text-gray-400 mt-1">Upload images via Farmer Dashboard or Produce listings</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAssets.map((asset) => {
                    const thumbUrl = getTransformedImageUrl(asset.url, {
                      width: 320,
                      height: 220,
                      crop: 'fill',
                      quality: 'auto',
                      format: 'auto'
                    });

                    return (
                      <div
                        key={asset.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group"
                      >
                        <div className="relative h-40 bg-gray-900 overflow-hidden">
                          <img
                            src={thumbUrl}
                            alt={asset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
                            {asset.category}
                          </span>
                          <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {asset.format.toUpperCase()}
                          </span>
                        </div>

                        <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="font-bold text-gray-900 text-xs truncate" title={asset.name}>
                              {asset.name}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
                              {asset.publicId}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {asset.tags.map((tag, tIdx) => (
                              <span key={tIdx} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
                            <span className="text-[10px] text-gray-400 font-medium">
                              {(asset.sizeBytes / 1024).toFixed(1)} KB
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleCopyUrl(asset.url, asset.id)}
                                className="p-1.5 bg-gray-100 hover:bg-emerald-100 hover:text-emerald-800 text-gray-700 rounded-lg transition-colors"
                                title="Copy Cloudinary URL"
                              >
                                {copiedId === asset.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                              </button>
                              <a
                                href={asset.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-gray-100 hover:bg-blue-100 hover:text-blue-800 text-gray-700 rounded-lg transition-colors"
                                title="Open Full Resolution"
                              >
                                <ExternalLink size={14} />
                              </a>
                              <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="p-1.5 bg-gray-100 hover:bg-red-100 hover:text-red-800 text-gray-700 rounded-lg transition-colors"
                                title="Delete Asset"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. TRANSFORMATION LAB TAB */}
          {activeTab === 'transformations' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <Sliders size={18} className="text-emerald-600" /> Dynamic Cloudinary Transformation Simulator
                    </h4>
                    <p className="text-xs text-gray-500">
                      Test real-time Cloudinary URL transformations (dimensions, crop gravity, format, effects).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Transformation Controls */}
                  <div className="lg:col-span-6 space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Width (w_{transformWidth})</label>
                        <input
                          type="range"
                          min="100"
                          max="800"
                          step="50"
                          value={transformWidth}
                          onChange={(e) => setTransformWidth(Number(e.target.value))}
                          className="w-full accent-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Height (h_{transformHeight})</label>
                        <input
                          type="range"
                          min="100"
                          max="800"
                          step="50"
                          value={transformHeight}
                          onChange={(e) => setTransformHeight(Number(e.target.value))}
                          className="w-full accent-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Crop Mode (c_)</label>
                        <select
                          value={transformCrop}
                          onChange={(e) => setTransformCrop(e.target.value as any)}
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none font-mono"
                        >
                          <option value="fill">fill (Smart Fill)</option>
                          <option value="thumb">thumb (Thumbnail)</option>
                          <option value="scale">scale (Scale)</option>
                          <option value="fit">fit (Fit)</option>
                          <option value="pad">pad (Pad)</option>
                          <option value="crop">crop (Crop)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Gravity (g_)</label>
                        <select
                          value={transformGravity}
                          onChange={(e) => setTransformGravity(e.target.value as any)}
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none font-mono"
                        >
                          <option value="auto">auto (AI Content Aware)</option>
                          <option value="face">face (Face Detection)</option>
                          <option value="center">center</option>
                          <option value="north">north</option>
                          <option value="south">south</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Quality (q_)</label>
                        <select
                          value={transformQuality as string}
                          onChange={(e) => setTransformQuality(e.target.value as any)}
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none font-mono"
                        >
                          <option value="auto">auto (Smart Optimal)</option>
                          <option value="auto:best">auto:best (Lossless/High)</option>
                          <option value="auto:good">auto:good</option>
                          <option value="auto:eco">auto:eco (Data Saver)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Format (f_)</label>
                        <select
                          value={transformFormat}
                          onChange={(e) => setTransformFormat(e.target.value as any)}
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none font-mono"
                        >
                          <option value="auto">auto (WebP/AVIF Auto)</option>
                          <option value="webp">webp</option>
                          <option value="avif">avif</option>
                          <option value="png">png</option>
                          <option value="jpg">jpg</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Corner Radius (r_)</label>
                        <select
                          value={transformRadius === 'max' ? 'max' : transformRadius ? String(transformRadius) : '0'}
                          onChange={(e) => {
                            if (e.target.value === 'max') setTransformRadius('max');
                            else if (e.target.value === '0') setTransformRadius(undefined);
                            else setTransformRadius(Number(e.target.value));
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none font-mono"
                        >
                          <option value="0">None (Square)</option>
                          <option value="16">16px (Card)</option>
                          <option value="32">32px (Pill)</option>
                          <option value="max">max (Circular Avatar)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Effect (e_)</label>
                        <select
                          value={transformEffect}
                          onChange={(e) => setTransformEffect(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none font-mono"
                        >
                          <option value="">None (Standard)</option>
                          <option value="grayscale">Grayscale</option>
                          <option value="sepia">Sepia Vintage</option>
                          <option value="vignette">Vignette</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Live Transformed Preview */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="bg-gray-900 p-4 rounded-xl flex items-center justify-center min-h-[260px] border border-gray-800 relative overflow-hidden">
                      <img
                        src={playgroundTransformedUrl}
                        alt="Transformed produce preview"
                        className="max-h-56 max-w-full object-contain transition-all duration-300 shadow-xl"
                        style={{
                          borderRadius:
                            transformRadius === 'max'
                              ? '9999px'
                              : transformRadius
                              ? `${transformRadius}px`
                              : '8px'
                        }}
                      />
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                        {transformWidth}x{transformHeight} • {transformFormat}
                      </span>
                    </div>

                    {/* Generated URL & Code Box */}
                    <div className="bg-gray-900 text-gray-200 p-3 rounded-lg text-[11px] font-mono space-y-1.5 border border-gray-800">
                      <div className="flex justify-between items-center text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                        <span>Generated Transformation Tag</span>
                        <button
                          onClick={() => handleCopyUrl(transformationCodeString, 'trans-code')}
                          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          {copiedId === 'trans-code' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="text-emerald-300 break-all">{transformationCodeString}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-between items-center text-xs">
          <div className="text-gray-500 font-medium flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            Direct CDN Delivery via Cloudinary
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
