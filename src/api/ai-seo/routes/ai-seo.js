// src/api/ai-seo/routes/ai-seo.js
"use strict";

/**
 * AI SEO router
 */

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/api/ai-seo/analyze",
      handler: "ai-seo.analyze",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/api/ai-seo/apply",
      handler: "ai-seo.apply",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
