import { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  onImagesUploaded: (urls: string[]) => void;
  existingImages?: string[];
}

export default function ImageUploader({ onImagesUploaded, existingImages = [] }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'request-images');

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const updatedImages = [...existingImages, ...uploadedUrls];
      onImagesUploaded(updatedImages);

      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images. Please check your Cloudinary configuration and try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = existingImages.filter((_, i) => i !== index);
    onImagesUploaded(updatedImages);
  };

  return (
    <div className="mb-4">
      <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex disabled:bg-gray-400">
        <Upload size={18} />
        {uploading ? 'Uploading...' : 'Upload Images'}
        <input
          type="file"
          multiple
          accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
      </label>

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
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
