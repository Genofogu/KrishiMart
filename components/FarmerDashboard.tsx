
import React, { useState } from 'react';
import { Plus, MapPin, CheckCircle, XCircle, Clock, Star, Landmark, Phone, Info, User as UserIcon, Calendar, Pencil, Save, X, ArrowRight, ShieldCheck, Home, Image as ImageIcon, Share2, Cloud, FileText, Camera, Upload } from 'lucide-react';
import { Product, User, Category } from '../types';
import { AVAILABLE_PRODUCTS, GOVERNMENT_SCHEMES, OFFLINE_AGENTS, PRODUCT_IMAGES } from '../constants';
import { CloudinaryUploader } from './CloudinaryUploader';
import { CloudinaryImage } from './CloudinaryImage';

interface FarmerDashboardProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  currentUser: User; 
  onUpdateUser: (updates: Partial<User>) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ products, onAddProduct, onEditProduct, currentUser, onUpdateUser }) => {
  // Add Product State
  const [productName, setProductName] = useState(AVAILABLE_PRODUCTS[0]);
  const [productImages, setProductImages] = useState<string[]>([PRODUCT_IMAGES[AVAILABLE_PRODUCTS[0]]]);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState('');
  
  // Profile State
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(currentUser.address || '');
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [showFarmMediaModal, setShowFarmMediaModal] = useState(false);

  // Modals State
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // LOGIC: Find Agent for this village
  const myAgent = OFFLINE_AGENTS.find(a => a.assignedVillage === currentUser.village) || OFFLINE_AGENTS[0];

  const handleSaveAddress = () => {
    onUpdateUser({ address: tempAddress });
    setIsEditingAddress(false);
  };

  const handleProduceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setProductName(val);
    // Auto-select image based on product name
    setProductImages([PRODUCT_IMAGES[val] || PRODUCT_IMAGES['Potato']]);
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !quantity) return;

    const isHighDemand = productName === 'Onion' || productName === 'Tomato';
    const seasonTag = isHighDemand ? 'High Demand' : 'Standard';

    const newProduct: Product = {
      id: Date.now().toString(),
      productName,
      category: 'Vegetables' as Category,
      description: `Freshly harvested ${productName} from the fertile fields of ${currentUser.village || 'Rampur'}. High quality produce directly from verified farm.`,
      pricePerKg: Number(price),
      unit: 'kg',
      images: productImages.length > 0 ? productImages : [PRODUCT_IMAGES['Potato']],
      farmerName: currentUser.name,
      seller: {
        id: currentUser.id,
        name: currentUser.name,
        type: 'farmer',
        rating: currentUser.trustScore,
        totalReviews: currentUser.totalOrders,
        address: currentUser.address
      },
      villageName: (currentUser.village as string) || 'Rampur',
      location: currentUser.location || { 
        lat: 26.8467, 
        lng: 80.9462, 
        village: currentUser.village as string || 'Rampur' 
      },
      quantityAvailable: Number(quantity),
      harvestDate: date,
      contactNumber: '9876543210', 
      status: 'pending',
      seasonTag,
      reviews: [],
      similarProductIds: []
    };

    onAddProduct(newProduct);
    setPrice('');
    setQuantity('');
    // Reset images to default for current selection
    setProductImages([PRODUCT_IMAGES[productName] || PRODUCT_IMAGES['Potato']]);
    alert('Product Submitted for Admin Approval with Cloudinary CDN media!');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onEditProduct(editingProduct);
      setEditingProduct(null);
    }
  };

  const handleShare = async (product: Product) => {
    const shareText = `Fresh ${product.productName} available directly from my farm in ${product.villageName}! \nPrice: ₹${product.pricePerKg}/${product.unit}. \nQuality Guaranteed on Krishi-Mart.`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Buy ${product.productName}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const myProducts = products.filter(p => p.farmerName === currentUser.name);
  const totalEarnings = myProducts
    .filter(p => p.status === 'approved')
    .reduce((sum, item) => sum + (item.pricePerKg * item.quantityAvailable), 0);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold"><CheckCircle size={12}/> Live</span>;
      case 'rejected': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold"><XCircle size={12}/> Rejected</span>;
      default: return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold"><Clock size={12}/> Pending Approval</span>;
    }
  };

  const userLandSize = currentUser.landSizeAcres || 0;
  const farmPhotos = currentUser.farmPhotos || [
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 animate-in slide-in-from-right-10 duration-500">
      
      {/* 1. PROFILE & TRUST HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 w-full md:w-auto flex items-start gap-4">
          {/* Farmer Avatar with Cloudinary Quick Upload */}
          <div className="relative group shrink-0">
            {currentUser.avatarUrl ? (
              <CloudinaryImage
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                transformations={{ width: 120, height: 120, crop: 'thumb', gravity: 'face', radius: 'max' }}
                className="w-16 h-16 rounded-full border-2 border-emerald-500 object-cover shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-800 font-bold text-xl shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowAvatarUpload(true)}
              className="absolute -bottom-1 -right-1 bg-emerald-700 hover:bg-emerald-800 text-white p-1.5 rounded-full shadow-md transition-transform active:scale-95"
              title="Upload Profile Picture via Cloudinary"
            >
              <Camera size={12} />
            </button>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-emerald-950 flex items-center gap-2 mb-1">
              Welcome, {currentUser.name}
              {currentUser.isVerified && <CheckCircle className="text-blue-500" size={20} />}
            </h2>
            
            <div className="flex flex-col gap-1.5">
               <div className="flex flex-wrap gap-3 text-gray-600 text-sm items-center">
                  <span className="flex items-center gap-1 text-gray-700 font-medium">
                    <MapPin size={14} className="text-red-500" /> {currentUser.village || 'Rampur'}
                  </span>
                  <span className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 text-yellow-800 font-bold text-xs">
                    <Star size={13} fill="currentColor" /> {currentUser.trustScore}/5 Trust Score
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <Cloud size={12} /> Cloudinary Media Active
                  </span>
               </div>
               
               {/* EDITABLE ADDRESS FIELD */}
               <div className="flex items-center gap-2 text-sm mt-1">
                  <Home size={14} className="text-emerald-600" />
                  {isEditingAddress ? (
                    <div className="flex items-center gap-2 w-full max-w-xs">
                      <input 
                        type="text" 
                        value={tempAddress}
                        onChange={(e) => setTempAddress(e.target.value)}
                        placeholder="Enter Farm/Delivery Address"
                        className="flex-1 p-1 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <button onClick={handleSaveAddress} className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700">
                        <Save size={14} />
                      </button>
                      <button onClick={() => setIsEditingAddress(false)} className="bg-gray-200 text-gray-600 p-1 rounded hover:bg-gray-300">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingAddress(true)}>
                      <span className={`font-medium ${currentUser.address ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                        {currentUser.address || 'Click to add Farm Address'}
                      </span>
                      <Pencil size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto items-center">
          <button 
             onClick={() => setShowFarmMediaModal(true)}
             className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
             <Cloud size={15} className="text-emerald-600" />
             Farm Assets ({farmPhotos.length})
          </button>

          <button 
             onClick={() => setShowAgentModal(true)}
             className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
             <Phone size={15} /> Help
          </button>

          <div className="bg-emerald-50 px-5 py-2.5 rounded-xl border border-emerald-200 text-center">
            <p className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Total Revenue</p>
            <p className="text-xl font-black text-emerald-800">₹ {totalEarnings}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COL: SCHEMES & FARM MEDIA */}
        <div className="space-y-6">
          {/* FARM PHOTOS & DOCUMENTS CARD (CLOUDINARY) */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                <ImageIcon size={16} className="text-emerald-600" /> Verified Farm Media
              </h3>
              <button
                type="button"
                onClick={() => setShowFarmMediaModal(true)}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add Media
              </button>
            </div>
            
            <p className="text-xs text-gray-500">
              Cloudinary CDN hosted farm landscapes & official soil certificates.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {farmPhotos.map((photo, pIdx) => (
                <div key={pIdx} className="relative h-20 rounded-lg overflow-hidden border border-gray-200 group">
                  <CloudinaryImage
                    src={photo}
                    alt={`Farm photo ${pIdx + 1}`}
                    transformations={{ width: 200, height: 160, crop: 'fill', quality: 'auto' }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    enableLightbox
                  />
                  <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">
                    Farm #{pIdx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GOVERNMENT SCHEMES WIDGET */}
          <div className="bg-orange-50/90 p-5 rounded-2xl border border-orange-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-orange-950 flex items-center gap-2">
                <Landmark size={18} className="text-orange-700" /> Gov. Schemes
              </h3>
              <div className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                Live Verification
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-white rounded-xl border border-orange-200 shadow-inner">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Land Profile</span>
                <span className="text-base font-black text-orange-600">{userLandSize} <span className="text-xs font-normal text-gray-400">Acres</span></span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full transition-all duration-1000" 
                  style={{ width: `${Math.min((userLandSize / 10) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              {GOVERNMENT_SCHEMES.map(scheme => {
                const isEligible = userLandSize >= scheme.minLandAcres;
                
                return (
                  <div key={scheme.id} className={`p-3.5 rounded-xl border transition-all ${isEligible ? 'bg-white border-emerald-200 shadow-xs' : 'bg-gray-50 border-gray-200 opacity-90'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-xs text-gray-900">{scheme.schemeName}</h4>
                      {isEligible ? (
                        <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                      ) : (
                        <ShieldCheck size={16} className="text-gray-300 flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-[11px] leading-relaxed text-gray-600 mb-2">{scheme.benefit}</p>
                    
                    <div className={`pt-2 border-t text-[10px] ${isEligible ? 'border-emerald-50' : 'border-gray-200'}`}>
                      {isEligible ? (
                        <span className="text-emerald-700 font-bold">✓ Land requirement satisfied</span>
                      ) : (
                        <span className="text-red-600 font-bold">✗ Needs {scheme.minLandAcres - userLandSize} more acres</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AGENT INFO BOX */}
          <div className="bg-blue-50/90 p-5 rounded-2xl border border-blue-200">
             <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2 mb-2">
              <Phone size={16} className="text-blue-700" /> Local Field Agent
            </h3>
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-200">
              <div className="bg-blue-100 p-2 rounded-full">
                <UserIcon size={18} className="text-blue-700" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-gray-900">{myAgent.name}</div>
                <div className="text-[11px] text-gray-500 font-mono">{myAgent.contactNumber}</div>
              </div>
              <button 
                onClick={() => setShowAgentModal(true)}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
              >
                <Phone size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE & RIGHT: PRODUCE LISTING & MANAGEMENT */}
        <div className="lg:col-span-2 space-y-6">
           {/* ADD PRODUCE FORM WITH CLOUDINARY UPLOADER */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-emerald-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> List New Produce
              </h3>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Cloud size={13} /> Cloudinary Direct Upload
              </span>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Vegetable/Crop</label>
                  <select 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    value={productName}
                    onChange={handleProduceChange}
                  >
                    {AVAILABLE_PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Harvest Date</label>
                  <input 
                    type="date" 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* INTEGRATED CLOUDINARY PRODUCE UPLOADER */}
              <CloudinaryUploader
                images={productImages}
                onChange={setProductImages}
                maxFiles={6}
                category="produce"
                label="Produce Photos (Cloudinary CDN)"
                helperText="Upload raw camera or field photos. Cloudinary automatically generates fast-loading thumbnails & WebP/AVIF images."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Farmer Price (₹/kg)</label>
                  <input 
                    type="number" 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    placeholder="20"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Available Quantity (kg)</label>
                  <input 
                    type="number" 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    placeholder="100"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-700 text-white py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors shadow-md text-sm">
                Submit Produce for Fair Price Approval
              </button>
            </form>
          </div>

          {/* LISTINGS */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center justify-between">
              <span>Your Produce Listings ({myProducts.length})</span>
              <span className="text-xs text-gray-500 font-normal">All media served via Cloudinary Edge CDN</span>
            </h3>

            {myProducts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl text-gray-400 border border-dashed border-gray-300">
                No products listed yet. Add your first crop above!
              </div>
            ) : (
              myProducts.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200 flex justify-between items-center hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                       <CloudinaryImage
                         src={product.images[0]} 
                         alt={product.productName}
                         transformations={{ width: 160, height: 160, crop: 'fill', quality: 'auto' }}
                         className="w-full h-full object-cover"
                         enableLightbox
                       />
                       {product.images.length > 1 && (
                         <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-tl-md font-bold">
                           +{product.images.length - 1}
                         </div>
                       )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-base text-gray-900">{product.productName}</h4>
                        {getStatusBadge(product.status)}
                      </div>
                      <div className="flex items-center text-xs text-gray-600 gap-2 font-medium">
                        <span>{product.quantityAvailable} kg</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">₹{product.pricePerKg}/kg</span>
                        {product.seasonTag === 'High Demand' && (
                          <span className="text-orange-700 font-bold bg-orange-50 px-1.5 py-0.5 rounded text-[10px]">
                            High Demand
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                          <Calendar size={11} className="text-emerald-600"/> Harvest: {product.harvestDate}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                          <MapPin size={11} className="text-red-500" /> {product.villageName}
                        </span>
                      </div>

                      {product.adminSuggestedPrice && (
                        <div className="text-xs text-blue-600 mt-1.5 font-medium">
                          * Admin adjusted price to market rate: ₹{product.adminSuggestedPrice}/kg
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-3">
                    <button 
                      onClick={() => handleShare(product)}
                      className="p-2 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                      title="Share Listing"
                    >
                      <Share2 size={16} />
                    </button>
                    
                    {product.status === 'pending' && (
                      <button 
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit Pending Listing"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* EDIT MODAL WITH CLOUDINARY UPLOADER */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Pencil size={18} className="text-blue-600" /> Edit Produce & Media
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Produce</label>
                <div className="p-2.5 bg-gray-100 rounded-lg text-gray-800 font-semibold text-sm">{editingProduct.productName}</div>
              </div>

              {/* Edit Cloudinary Photos */}
              <CloudinaryUploader
                images={editingProduct.images}
                onChange={(imgs) => setEditingProduct({ ...editingProduct, images: imgs })}
                maxFiles={6}
                category="produce"
                label="Update Produce Photos"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price (₹/kg)</label>
                   <input 
                     type="number" 
                     className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                     value={editingProduct.pricePerKg}
                     onChange={(e) => setEditingProduct({...editingProduct, pricePerKg: Number(e.target.value)})}
                     required
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Quantity (kg)</label>
                   <input 
                     type="number" 
                     className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                     value={editingProduct.quantityAvailable}
                     onChange={(e) => setEditingProduct({...editingProduct, quantityAvailable: Number(e.target.value)})}
                     required
                   />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Harvest Date</label>
                <input 
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  value={editingProduct.harvestDate}
                  onChange={(e) => setEditingProduct({...editingProduct, harvestDate: e.target.value})}
                  required 
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 flex justify-center items-center gap-2 shadow-md"
                >
                  <Save size={15} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AVATAR UPLOAD MODAL */}
      {showAvatarUpload && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Camera size={18} className="text-emerald-600" /> Update Farmer Avatar
              </h3>
              <button onClick={() => setShowAvatarUpload(false)}><X size={18} /></button>
            </div>
            
            <CloudinaryUploader
              images={currentUser.avatarUrl ? [currentUser.avatarUrl] : []}
              onChange={(imgs) => {
                onUpdateUser({ avatarUrl: imgs[0] || '' });
                setShowAvatarUpload(false);
              }}
              maxFiles={1}
              category="avatar"
              label="Select Profile Avatar"
              helperText="Auto face-centered by Cloudinary AI"
            />
          </div>
        </div>
      )}

      {/* FARM MEDIA & CERTIFICATES MODAL */}
      {showFarmMediaModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Cloud size={18} className="text-emerald-600" /> Manage Farm Photos & Documents
              </h3>
              <button onClick={() => setShowFarmMediaModal(false)}><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <CloudinaryUploader
                images={currentUser.farmPhotos || farmPhotos}
                onChange={(imgs) => onUpdateUser({ farmPhotos: imgs })}
                maxFiles={8}
                category="farm"
                label="Farm Landscape & Field Photos"
                helperText="Upload photos of your fields, crop rows, and irrigation setups for consumer trust."
              />

              <div className="pt-3 border-t flex justify-end">
                <button
                  onClick={() => setShowFarmMediaModal(false)}
                  className="px-5 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AGENT MODAL */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Phone className="text-blue-600" size={18} /> Call Agent {myAgent.name}?
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Your village agent is available for on-call assistance with scheme applications and listing your harvest.
            </p>
            <div className="bg-blue-50 p-4 rounded-xl font-mono text-center text-lg mb-4 font-bold text-blue-700 border border-blue-100">
              {myAgent.contactNumber}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowAgentModal(false)} 
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-200"
              >
                Close
              </button>
              <a 
                href={`tel:${myAgent.contactNumber}`}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 text-center"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


const TrendingUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);
