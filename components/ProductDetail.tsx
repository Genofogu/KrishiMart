import React, { useState } from 'react';
import { ArrowLeft, MapPin, Star, ShieldCheck, Truck, ShoppingCart, User, MessageCircle, Calendar, ChevronLeft, ChevronRight, Package, CheckCircle2, ReceiptText, Home, Share2, Download, Timer, Cloud, Sparkles, Plus, Image as ImageIcon } from 'lucide-react';
import { Product, GeoLocation, Review } from '../types';
import { CloudinaryImage } from './CloudinaryImage';
import { CloudinaryUploader } from './CloudinaryUploader';

interface ProductDetailProps {
  product: Product;
  userLocation?: GeoLocation;
  onBack: () => void;
  onPlaceOrder: (productId: string, quantity: number) => string;
  similarProducts: Product[];
  onSelectProduct: (product: Product) => void;
}

const RatingBar: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-80">
      <span>{label}</span>
      <span>{score.toFixed(1)}</span>
    </div>
    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
      <div 
        className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${(score / 5) * 100}%` }}
      />
    </div>
  </div>
);

const Step = ({ title, desc, icon: Icon, active }: { title: string; desc: string; icon: any; active: boolean }) => (
  <div className={`flex items-start gap-4 ${active ? 'opacity-100' : 'opacity-40'}`}>
    <div className={`p-2 rounded-lg ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
      <Icon size={20} />
    </div>
    <div>
      <h4 className="font-bold text-sm text-gray-800">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  </div>
);

export const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  userLocation, 
  onBack, 
  onPlaceOrder, 
  similarProducts,
  onSelectProduct
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  // Review Form with Cloudinary Media
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [localReviews, setLocalReviews] = useState<Review[]>(product.reviews || []);

  const calculateDistance = (loc1: GeoLocation, loc2: GeoLocation) => {
    const R = 6371;
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const distance = userLocation ? calculateDistance(userLocation, product.location) : 0;

  const getDeliveryEstimate = (dist: number) => {
    if (!userLocation) return "Location not set";
    if (dist < 10) return "Same Day Delivery";
    if (dist < 50) return "Next Day Delivery";
    return "2-3 Days Delivery";
  };

  const deliveryInfo = getDeliveryEstimate(distance);
  const allReviews = localReviews;
  const avgRating = allReviews.length > 0 
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : "No ratings";

  const handleOrder = () => {
    setIsOrdering(true);
    setTimeout(() => {
      const id = onPlaceOrder(product.id, quantity);
      setConfirmedOrderId(id);
      setIsOrdering(false);
      setOrderComplete(true);
    }, 1500);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewComment) return;

    const newRev: Review = {
      id: Date.now().toString(),
      reviewerName,
      rating: reviewRating,
      comment: reviewComment,
      reviewDate: new Date().toISOString().split('T')[0],
      images: reviewImages
    };

    setLocalReviews([newRev, ...localReviews]);
    setReviewerName('');
    setReviewComment('');
    setReviewImages([]);
    setShowReviewForm(false);
  };

  const subRatings = product.seller.subRatings || {
    quality: product.seller.rating,
    delivery: Math.max(1, product.seller.rating - 0.5),
    communication: Math.min(5, product.seller.rating + 0.2)
  };

  if (orderComplete) {
    const totalPrice = (product.adminSuggestedPrice || product.pricePerKg) * quantity;
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in zoom-in-95 duration-500 text-gray-900">
        <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
          {/* Animated Header */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-10 text-center text-white relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-700" />
            </div>
            
            <div className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-xl backdrop-blur-md border border-white/30">
              <CheckCircle2 size={56} />
            </div>
            <h2 className="text-4xl font-black mb-2 tracking-tight">Success!</h2>
            <p className="text-emerald-100 font-medium">Your harvest order has been confirmed.</p>
          </div>
          
          <div className="p-10 space-y-8">
            {/* Receipt Summary */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <ReceiptText size={120} />
              </div>
              
              <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-6">
                <ReceiptText size={14} /> Order Receipt
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                  <span className="text-gray-500 font-medium text-sm">Order Reference</span>
                  <span className="font-mono font-black text-gray-900 bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100">
                    {confirmedOrderId}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                  <span className="text-gray-500 font-medium text-sm">Produce Details</span>
                  <span className="font-bold text-gray-900">{product.productName} × {quantity} {product.unit}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                  <span className="text-gray-500 font-medium text-sm">Estimated Delivery</span>
                  <span className="font-bold text-blue-600 flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-lg">
                    <Truck size={16} /> {deliveryInfo}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                  <span className="text-gray-500 font-medium text-sm">Delivery Village</span>
                  <span className="font-bold text-gray-900">{userLocation?.village || 'Rampur'}</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pb-1">Total Paid</span>
                  <span className="text-4xl font-black text-emerald-700">₹{totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={onBack}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-emerald-800 font-semibold py-2 transition-all"
      >
        <ArrowLeft size={20} /> Back to Marketplace
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* MEDIA SECTION POWERED BY CLOUDINARY */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-950 rounded-2xl overflow-hidden shadow-md group">
            <CloudinaryImage 
              src={product.images[activeImageIndex] || product.images[0]} 
              alt={product.productName}
              transformations={{
                width: 800,
                height: 800,
                crop: 'fill',
                quality: 'auto',
                format: 'auto'
              }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              enableLightbox
            />
            
            {/* Cloudinary CDN Indicator badge */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
              <Cloud size={12} className="text-cyan-300" />
              <span>Cloudinary WebP/AVIF</span>
            </div>

            {product.images.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                  className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white text-gray-800"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                  className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white text-gray-800"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {product.images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all ${idx === activeImageIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-white/60'}`}
                />
              ))}
            </div>
          </div>
          
          {/* Thumbnails strip with Cloudinary transformations */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${idx === activeImageIndex ? 'border-emerald-600 shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <CloudinaryImage
                  src={img}
                  alt={`thumbnail-${idx}`}
                  transformations={{ width: 160, height: 160, crop: 'fill', quality: 'auto' }}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-yellow-500 font-bold">
                <Star size={18} fill="currentColor" />
                <span>{avgRating}</span>
                <span className="text-gray-400 font-normal text-sm">({allReviews.length} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-2">{product.productName}</h1>
            
            <div className="flex flex-col gap-2 mb-6 text-gray-500">
               <div className="flex items-center gap-2">
                <MapPin size={16} className="text-red-500" />
                <span className="text-sm font-medium">{product.location.village}, {product.location.district || 'District'}</span>
                {userLocation && (
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-semibold">
                    {distance} km away
                  </span>
                )}
              </div>
              
              {/* DISPLAY SELLER ADDRESS */}
              {product.seller.address && (
                <div className="flex items-center gap-2 text-emerald-700">
                   <Home size={16} />
                   <span className="text-sm font-medium">{product.seller.address}</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-emerald-700">₹{product.adminSuggestedPrice || product.pricePerKg}</span>
              <span className="text-gray-400 font-medium">/ {product.unit}</span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8 border-l-4 border-emerald-500 pl-4 py-1 italic text-sm">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3 border border-gray-100">
                <Calendar className="text-emerald-600" size={24} />
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Harvested</div>
                  <div className="text-sm font-bold text-gray-800">{product.harvestDate}</div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3 border border-gray-100">
                <Truck className="text-blue-600" size={24} />
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Delivery</div>
                  <div className="text-sm font-bold text-gray-800">{deliveryInfo}</div>
                </div>
              </div>
            </div>

            {/* SELLER CARD WITH SUB-RATINGS */}
            <div className="bg-gradient-to-r from-emerald-950 to-teal-950 text-white p-6 rounded-2xl mb-8 shadow-xl border border-emerald-800/40">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-2 rounded-2xl border border-white/20 shadow-inner">
                    <User size={30} className="text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase opacity-70 font-black tracking-widest mb-0.5">Verified {product.seller.type}</div>
                    <div className="font-black text-xl flex items-center gap-1.5">
                      {product.seller.name}
                      <ShieldCheck size={20} className="text-yellow-400" />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase opacity-70 font-black tracking-widest mb-0.5">Trust Score</div>
                  <div className="font-black text-3xl text-yellow-400">{product.seller.rating}<span className="text-sm text-white/60 font-normal">/5</span></div>
                </div>
              </div>

              {/* SUB-RATINGS BREAKDOWN */}
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-5">
                <RatingBar label="Quality" score={subRatings.quality} />
                <RatingBar label="Delivery" score={subRatings.delivery} />
                <RatingBar label="Comm." score={subRatings.communication} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden h-12">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 hover:bg-gray-100 font-bold transition-colors"
                  >-</button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center font-bold outline-none text-gray-900"
                  />
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-4 hover:bg-gray-100 font-bold transition-colors"
                  >+</button>
                </div>
                <button 
                  onClick={handleOrder}
                  disabled={isOrdering}
                  className="flex-1 bg-emerald-700 text-white h-12 rounded-xl font-bold hover:bg-emerald-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:bg-gray-400"
                >
                  {isOrdering ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Placing Order...
                    </div>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Buy Now (₹{(product.adminSuggestedPrice || product.pricePerKg) * quantity})
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Package size={12} /> Stock Available: {product.quantityAvailable} {product.unit}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS & COMMUNITY FEEDBACK SECTION WITH CLOUDINARY UPLOADS */}
      <div className="mt-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <MessageCircle className="text-emerald-600" /> Customer Reviews ({allReviews.length})
            </h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
            >
              <Plus size={14} /> Write Review with Photo
            </button>
          </div>

          {/* Write Review Form */}
          {showReviewForm && (
            <form onSubmit={handleAddReview} className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 animate-in fade-in">
              <h3 className="font-bold text-sm text-gray-800">Share Your Experience & Product Photos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Your Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full p-2 border rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Rating (1-5)</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg text-xs"
                  >
                    <option value="5">5 Stars - Outstanding Quality</option>
                    <option value="4">4 Stars - Very Fresh</option>
                    <option value="3">3 Stars - Average</option>
                    <option value="2">2 Stars - Below Expectation</option>
                    <option value="1">1 Star - Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Review Comment</label>
                <textarea
                  rows={3}
                  placeholder="Describe the freshness, taste, and delivery condition..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs"
                  required
                />
              </div>

              {/* Cloudinary Review Photos Uploader */}
              <CloudinaryUploader
                images={reviewImages}
                onChange={setReviewImages}
                maxFiles={3}
                category="review"
                label="Attach Review Photos (Cloudinary)"
                helperText="Upload photos of unboxed produce or dishes prepared."
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 shadow-xs"
                >
                  Post Review
                </button>
              </div>
            </form>
          )}

          {allReviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
              No reviews yet. Be the first to buy and review!
            </div>
          ) : (
            <div className="space-y-6">
              {allReviews.map(review => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-800 text-xs">
                        {review.reviewerName.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-800 text-sm">{review.reviewerName}</span>
                    </div>
                    <span className="text-xs text-gray-400">{review.reviewDate}</span>
                  </div>
                  <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    "{review.comment}"
                  </p>

                  {/* Customer Attached Photos via Cloudinary */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2">
                      {review.images.map((rImg, rIdx) => (
                        <div key={rIdx} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <CloudinaryImage
                            src={rImg}
                            alt="review photo"
                            transformations={{ width: 140, height: 140, crop: 'fill', quality: 'auto' }}
                            className="w-full h-full object-cover"
                            enableLightbox
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MARKET INSIGHT CARD */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-2xl text-white shadow-xl h-fit">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          <h3 className="text-xl font-bold mb-4">Market Insight</h3>
          <p className="text-sm opacity-90 leading-relaxed mb-6">
            Prices for <strong>{product.productName}</strong> are verified daily against local APMC Mandi rates to ensure 100% fair pricing.
          </p>
          <div className="bg-white/20 p-4 rounded-xl border border-white/20">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold uppercase">Fair Index</span>
              <span className="text-2xl font-black">Fair Value</span>
            </div>
            <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden">
              <div className="bg-white h-full w-[85%]" />
            </div>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-black text-gray-900 mb-8">Similar Local Produce</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map(p => (
              <div 
                key={p.id} 
                onClick={() => onSelectProduct(p)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group border border-gray-100"
              >
                <div className="aspect-[4/3] relative bg-gray-900">
                  <CloudinaryImage
                    src={p.images[0]} 
                    alt={p.productName}
                    transformations={{ width: 320, height: 240, crop: 'fill', quality: 'auto' }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-black text-emerald-800">
                    ₹{p.pricePerKg}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 text-sm truncate">{p.productName}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                    <MapPin size={10} /> {p.villageName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
