import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ images, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `request-images/${fileName}`;

        const { data, error } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error:', error);
          alert(`Failed to upload ${file.name}. Please try again.`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700">Images</h4>
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Images
            </>
          )}
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
