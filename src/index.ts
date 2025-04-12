// src/index.ts
export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // Custom sitemap routes
    strapi.server.routes([
      {
        method: "GET",
        path: "/api/sitemap-data",
        handler: async (ctx) => {
          try {
            // Get all publishable content
            const projects = await strapi.entityService.findMany(
              "api::project.project",
              {
                fields: ["slug", "updatedAt"],
                publicationState: "live",
              }
            );

            const blogPosts = await strapi.entityService.findMany(
              "api::blog.blog",
              {
                fields: ["slug", "updatedAt"],
                publicationState: "live",
              }
            );

            // Format for sitemap
            const projectUrls = projects.map((project) => ({
              url: `/projects/${project.slug}`,
              lastmod: project.updatedAt,
              priority: 0.8,
              changefreq: "monthly",
            }));

            const blogUrls = blogPosts.map((post) => ({
              url: `/blog/${post.slug}`,
              lastmod: post.updatedAt,
              priority: 0.7,
              changefreq: "weekly",
            }));

            // Static pages
            const staticPages = [
              { url: "/", priority: 1.0, changefreq: "weekly" },
              { url: "/resume", priority: 0.9, changefreq: "monthly" },
              { url: "/blog", priority: 0.8, changefreq: "weekly" },
              { url: "/projects", priority: 0.8, changefreq: "monthly" },
              { url: "/contact", priority: 0.6, changefreq: "monthly" },
            ];

            ctx.body = {
              data: [...staticPages, ...projectUrls, ...blogUrls],
            };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        config: {
          auth: false,
        },
      },
      {
        method: "GET",
        path: "/sitemap.xml",
        handler: async (ctx) => {
          try {
            // Get all publishable content
            const projects = await strapi.entityService.findMany(
              "api::project.project",
              {
                fields: ["slug", "updatedAt"],
                publicationState: "live",
              }
            );

            const blogPosts = await strapi.entityService.findMany(
              "api::blog.blog",
              {
                fields: ["slug", "updatedAt"],
                publicationState: "live",
              }
            );

            // Format for sitemap
            const projectUrls = projects.map((project) => ({
              url: `/projects/${project.slug}`,
              lastmod: project.updatedAt,
              priority: 0.8,
              changefreq: "monthly",
            }));

            const blogUrls = blogPosts.map((post) => ({
              url: `/blog/${post.slug}`,
              lastmod: post.updatedAt,
              priority: 0.7,
              changefreq: "weekly",
            }));

            // Static pages
            const staticPages = [
              { url: "/", priority: 1.0, changefreq: "weekly" },
              { url: "/resume", priority: 0.9, changefreq: "monthly" },
              { url: "/blog", priority: 0.8, changefreq: "weekly" },
              { url: "/projects", priority: 0.8, changefreq: "monthly" },
              { url: "/contact", priority: 0.6, changefreq: "monthly" },
            ];

            const data = [...staticPages, ...projectUrls, ...blogUrls];

            // Generate XML
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            xml +=
              '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

            data.forEach((item) => {
              xml += "  <url>\n";
              xml += `    <loc>${process.env.FRONTEND_URL || "http://localhost:3000"}${item.url}</loc>\n`;
              if (item.lastmod) {
                xml += `    <lastmod>${new Date(item.lastmod).toISOString().split("T")[0]}</lastmod>\n`;
              }
              if (item.changefreq) {
                xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
              }
              if (item.priority) {
                xml += `    <priority>${item.priority}</priority>\n`;
              }
              xml += "  </url>\n";
            });

            xml += "</urlset>";

            ctx.type = "application/xml";
            ctx.body = xml;
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        config: {
          auth: false,
        },
      },
    ]);

    // Add URL redirect middleware if needed
    try {
      const {
        redirectMiddleware,
      } = require("./api/url-management/controllers/url-management");
      if (redirectMiddleware) {
        strapi.server.use(redirectMiddleware);
      }
    } catch (error) {
      // If the middleware doesn't exist, just log a warning and continue
      console.warn("URL redirect middleware not found, skipping...");
    }
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap() {},
};
