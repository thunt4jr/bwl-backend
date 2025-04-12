// src/api/middlewares/security-headers.ts (or .js if you're not using TypeScript)

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Set security headers
    ctx.set("X-XSS-Protection", "1; mode=block");
    ctx.set("X-Content-Type-Options", "nosniff");
    ctx.set("X-Frame-Options", "SAMEORIGIN");
    ctx.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // Content Security Policy (CSP)
    ctx.set(
      "Content-Security-Policy",
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob:; " +
        "font-src 'self'; " +
        "connect-src 'self'; " +
        "media-src 'self'; " +
        "object-src 'none'; " +
        "frame-src 'self'; " +
        "base-uri 'self'; " +
        "form-action 'self';"
    );

    // Permissions Policy (formerly Feature-Policy)
    ctx.set(
      "Permissions-Policy",
      "camera=(), " +
        "microphone=(), " +
        "geolocation=(), " +
        "interest-cohort=()"
    );

    // Strict Transport Security (HSTS)
    // Only enable in production
    if (process.env.NODE_ENV === "production") {
      ctx.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
    }

    // Continue to next middleware
    await next();
  };
};
