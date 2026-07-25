import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import api from "../../lib/axios";

interface Props {
  value: string;
  onChange: (url: string) => void;
  fallbackLabel?: string;
}

// A single-photo circular uploader for a seller's own profile picture.
// Entirely optional — the artisan profile works fine without one.
export const AvatarUploader = ({ value, onChange, fallbackLabel = "Photo" }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setError("");
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("images", file);

    setUploading(true);
    try {
      const { data } = await api.post("/upload", formData);
      onChange(data.urls[0]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Photo upload failed. Please try again.");
    } finally {
      setUploading(false);
      setPreview("");
    }
  };

  const displaySrc = preview || value;

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-terracotta/30 bg-sand/40 flex items-center justify-center hover:bg-sand/60 transition-colors"
          >
            {displaySrc ? (
              <img src={displaySrc} alt="Your photo" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-6 h-6 text-terracotta/50" />
            )}
            {uploading && (
              <div className="absolute inset-0 bg-charcoal/40 rounded-full flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-ivory animate-spin" />
              </div>
            )}
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove photo"
              className="absolute -top-1 -right-1 bg-charcoal text-ivory rounded-full w-5 h-5 flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files)} />
          <button type="button" onClick={() => inputRef.current?.click()} className="text-sm font-medium text-terracotta border-b border-terracotta/40 hover:border-terracotta">
            {value ? "Change photo" : `Add ${fallbackLabel.toLowerCase()}`}
          </button>
          <p className="text-xs text-charcoal/45 mt-1">Optional — buyers will see this on your artisan profile.</p>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
};