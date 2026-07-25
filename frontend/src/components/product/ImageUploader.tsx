import { useRef, useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import api from "../../lib/axios";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

// Lets a seller pick multiple images, preview them locally, then upload the
// batch to the backend (which streams them to Cloudinary) and store the
// returned URLs in the parent form's state.
export const ImageUploader = ({ images, onChange, max = 5 }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");

    const fileArray = Array.from(files).slice(0, max - images.length);
    const localPreviews = fileArray.map((f) => URL.createObjectURL(f));
    setPreviews(localPreviews);

    const formData = new FormData();
    fileArray.forEach((file) => formData.append("images", file));

    setUploading(true);
    try {
      const { data } = await api.post("/upload", formData);
      onChange([...images, ...data.urls]);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Image upload failed. Make sure your Cloudinary credentials are set in the backend .env file."
      );
    } finally {
      setUploading(false);
      setPreviews([]);
    }
  };

  const removeImage = (url: string) => {
    onChange(images.filter((i) => i !== url));
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-terracotta/30 rounded-clay p-8 text-center cursor-pointer hover:bg-sand/30 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <Loader2 className="w-8 h-8 mx-auto text-terracotta animate-spin" />
        ) : (
          <UploadCloud className="w-8 h-8 mx-auto text-terracotta/60" />
        )}
        <p className="text-sm text-charcoal/60 mt-2">
          {uploading ? "Uploading images..." : `Click to upload up to ${max} images`}
        </p>
      </div>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      {(images.length > 0 || previews.length > 0) && (
        <div className="flex flex-wrap gap-3 mt-4">
          {images.map((url) => (
            <div key={url} className="relative w-20 h-20">
              <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute -top-2 -right-2 bg-charcoal text-ivory rounded-full w-5 h-5 flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {previews.map((url, i) => (
            <div key={i} className="relative w-20 h-20 opacity-50">
              <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
