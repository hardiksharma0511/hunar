import https from "https";
import querystring from "querystring";

// Verifies a Google reCAPTCHA v2 token server-side. If RECAPTCHA_SECRET_KEY
// isn't configured, verification is skipped (treated as passing) so the
// site keeps working before the project owner sets up reCAPTCHA keys.
export const verifyRecaptcha = (token: string | undefined): Promise<boolean> => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) return Promise.resolve(true);
  if (!token) return Promise.resolve(false);

  const postData = querystring.stringify({ secret, response: token });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "www.google.com",
        path: "/recaptcha/api/siteverify",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            console.log(parsed);
resolve(!!parsed.success);
          } catch {
            resolve(false);
          }
        });
      }
    );
    req.on("error", () => resolve(false));
    req.write(postData);
    req.end();
  });
};