import ReCAPTCHA from "react-google-recaptcha";

interface Props {
  onChange: (token: string | null) => void;
}

// Renders Google's reCAPTCHA v2 checkbox. If no site key is configured in
// .env, renders nothing (and the backend skips verification too), so the
// site still works end-to-end before the owner sets up reCAPTCHA keys.
export const Recaptcha = ({ onChange }: Props) => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  if (!siteKey) return null;

  return (
    <div className="my-1">
      <ReCAPTCHA sitekey={siteKey} onChange={onChange} />
    </div>
  );
};