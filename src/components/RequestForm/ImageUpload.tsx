import React, { useEffect, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        options: {
          cloudName: string;
          uploadPreset: string;
          sources: string[];
          multiple: boolean;
          maxFiles: number;
          folder: string;
        },
        callback: (error: any, result: any) => void
      ) => {
        open: () => void;
        close: () => void;
      };
    };
  }
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ images, onChange }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.cloudinary) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleUpload = () => {
    if (!isScriptLoaded || !window.cloudinary) {
      alert('Cloudinary widget is loading. Please try again in a moment.');
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert('Cloudinary configuration is missing. Please check your environment variables.');
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ['local', 'url', 'camera'],
        multiple: true,
        maxFiles: 10,
        folder: 'BoldCode',
      },
      (error, result) => {
        if (error) {
          console.error('Upload error:', error);
          alert('Failed to upload image. Please try again.');
          return;
        }

        if (result.event === 'success') {
          const newImages = [...images, result.info.secure_url];
          onChange(newImages);
        }
      }
    );

    widget.open();
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700">Images</h4>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!isScriptLoaded}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          Upload Images
        </button>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Uploaded image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
          <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
          <p className="text-sm text-slate-500 text-center">No images uploaded yet</p>
          <p className="text-xs text-slate-400 text-center mt-1">
            Click "Upload Images" to add images
          </p>
        </div>
      )}
    </div>
  );
};
