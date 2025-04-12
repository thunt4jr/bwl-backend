"use strict";

/**
 * Category controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::category.category",
  ({ strapi }) => ({
    // Find all categories with optional filtering and blog post counts
    async find(ctx) {
      // Add count of related blog posts
      const withCounts = ctx.query.withCounts === "true";

      // Call the default find method first
      const { data, meta } = await super.find(ctx);

      // If counts are requested, enhance the response with blog post counts
      if (withCounts && data) {
        // Get IDs of all retrieved categories
        const categoryIds = data.map((category) => category.id);

        // Get counts for each category
        const categoryCounts = await strapi
          .service("api::category.category")
          .getPostCounts(categoryIds);

        // Add counts to the response data
        const enhancedData = data.map((category) => {
          return {
            ...category,
            attributes: {
              ...category.attributes,
              postCount: categoryCounts[category.id] || 0,
            },
          };
        });

        return {
          data: enhancedData,
          meta,
        };
      }

      return { data, meta };
    },

    // Get all categories with post counts for sidebar/menu display
    async getMenuCategories(ctx) {
      const { limit } = ctx.query;

      // Get categories with post counts
      const categories = await strapi
        .service("api::category.category")
        .getMenuCategories(limit);

      return this.transformResponse(categories);
    },

    // Find a specific category by slug
    async findBySlug(ctx) {
      const { slug } = ctx.params;

      // Find the category
      const entity = await strapi.db.query("api::category.category").findOne({
        where: { slug },
      });

      if (!entity) {
        return ctx.notFound("Category not found");
      }

      // Get count of posts in this category
      const postCount = await strapi.db
        .query("api::blog-post.blog-post")
        .count({
          where: {
            categories: {
              id: entity.id,
            },
          },
        });

      // Add post count
      const enhancedEntity = {
        ...entity,
        postCount,
      };

      return this.transformResponse(enhancedEntity);
    },
  })
);
