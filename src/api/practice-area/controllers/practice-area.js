"use strict";

/**
 * Practice area controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::practice-area.practice-area",
  ({ strapi }) => ({
    // Customize the find method to filter by active status and sort by order
    async find(ctx) {
      // Get query parameters
      const { active } = ctx.query;

      // Apply active filter if specified
      if (active !== undefined) {
        ctx.query.filters = {
          ...(ctx.query.filters || {}),
          isActive: active === "true",
        };
      }

      // Set default sorting by order field
      ctx.query.sort = ctx.query.sort || "order:asc";

      // Call the default find method with the modified query
      const { data, meta } = await super.find(ctx);

      return { data, meta };
    },

    // Method to count practice areas
    async count(ctx) {
      const count = await strapi.db
        .query("api::practice-area.practice-area")
        .count();

      return { count };
    },

    // Method to get active practice areas for homepage display
    async findForHomepage(ctx) {
      const { limit = 6 } = ctx.query;

      // Get active practice areas sorted by order
      const entities = await strapi.entityService.findMany(
        "api::practice-area.practice-area",
        {
          filters: {
            isActive: true,
          },
          sort: { order: "asc" },
          limit: parseInt(limit),
        }
      );

      return this.transformResponse(entities);
    },
  })
);
