import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImagesUploaded: (urls: string[]) => void;
  existingImages?: string[];
}

export default function ImageUploader({ onImagesUploaded, existingImages = [] }: ImageUploaderProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const checkCloudinary = setInterval(() => {
      if ((window as any).cloudinary) {
        setIsScriptLoaded(true);
        clearInterval(checkCloudinary);
      }
    }, 100);

    return () => clearInterval(checkCloudinary);
  }, []);

  const handleOpenWidget = () => {
    if (!isScriptLoaded || !(window as any).cloudinary) {
      alert('Cloudinary widget is still loading. Please try again in a moment.');
      return;
    }

    const widget = (window as any).cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        multiple: true,
        maxFiles: 10,
        clientAllowedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
        maxFileSize: 10000000,
        folder: 'request-images',
      },
      (error: any, result: any) => {
        if (error) {
          console.error('Upload error:', error);
          return;
        }

        if (result && result.event === 'success') {
          const newImageUrl = result.info.secure_url;
          const updatedImages = [...existingImages, newImageUrl];
          onImagesUploaded(updatedImages);
        }
      }
    );

    widget.open();
  };

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={handleOpenWidget}
        disabled={!isScriptLoaded}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <Upload size={18} />
        {isScriptLoaded ? 'Upload Images' : 'Loading...'}
      </button>

      {existingImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {existingImages.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => {
                  const updatedImages = existingImages.filter((_, i) => i !== index);
                  onImagesUploaded(updatedImages);
                }}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
