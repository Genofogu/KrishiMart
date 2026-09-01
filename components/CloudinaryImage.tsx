import React, { useState } from 'react';
import { getTransformedImageUrl } from '../services/cloudinaryService';
import { CloudinaryTransformationOptions } from '../types';
import { Image as ImageIcon, ZoomIn, X, Cloud } from 'lucide-react';

interface CloudinaryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  transformations?: CloudinaryTransformationOptions;
  fallbackSrc?: string;
  enableLightbox?: boolean;
  showCloudBadge?: boolean;
  className?: string;
}

export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  alt,
  transformations = { quality: 'auto' as const, format: 'auto' as const },
  fallbackSrc = 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&w=800&q=80',
  enableLightbox = false,
  showCloudBadge = false,
  className = '',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const optimizedUrl = hasError 
    ? fallbackSrc 
    : getTransformedImageUrl(src, transformations);

  const highResUrl = getTransformedImageUrl(src, { quality: 'auto:best', format: 'auto' as const });

  return (
    <>
      <div className={`relative overflow-hidden group ${className.includes('rounded') ? '' : 'rounded-lg'}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <ImageIcon className="text-gray-400 opacity-40 animate-bounce" size={24} />
          </div>
        )}

        <img
          src={optimizedUrl}
          alt={alt}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          {...rest}
        />

        {showCloudBadge && (
          <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <Cloud size={10} className="text-cyan-300" />
            <span>Cloudinary</span>
          </div>
        )}

        {enableLightbox && !isLoading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md backdrop-blur-xs"
            title="Inspect in Lightbox"
          >
            <ZoomIn size={14} />
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-gray-800/90 text-white flex justify-between items-center border-b border-gray-700">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Cloud size={16} className="text-cyan-400" />
                <span className="truncate max-w-md">{alt || 'Cloudinary Media Preview'}</span>
              </div>
              <button 
                onClick={() => setIsLightboxOpen(false)}
                className="p-1 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center bg-black/40 overflow-auto max-h-[70vh]">
              <img 
                src={highResUrl} 
                alt={alt} 
                className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="p-3 bg-gray-800 text-xs text-gray-300 flex justify-between items-center border-t border-gray-700">
              <span className="text-gray-400 font-mono truncate max-w-sm">{optimizedUrl}</span>
              <a 
                href={highResUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 hover:underline font-semibold"
              >
                Open Original
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
