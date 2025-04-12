"use strict";

/**
 * Blog post controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::blog-post.blog-post",
  ({ strapi }) => ({
    // Extend the default find method to include SEO data
    async find(ctx) {
      // Call the default find method
      const { data, meta } = await super.find(ctx);

      // Return the response
      return { data, meta };
    },

    // Extend the findOne method to include SEO data and update view count
    async findOne(ctx) {
      const { id } = ctx.params;

      // Call the default findOne method
      const response = await super.findOne(ctx);

      // If found, update view count (optional feature for analytics)
      if (response.data) {
        // You can add view counting logic here if needed
      }

      return response;
    },

    // Custom method to find related blog posts
    async findRelated(ctx) {
      const { id } = ctx.params;
      const { limit = 3 } = ctx.query;

      // Find the current blog post to get its categories
      const entity = await strapi.entityService.findOne(
        "api::blog-post.blog-post",
        id,
        {
          populate: ["categories"],
        }
      );

      if (!entity) {
        return ctx.notFound("Blog post not found");
      }

      // Extract category IDs
      const categoryIds = entity.categories.map((cat) => cat.id);

      // Find related posts that share categories but exclude the current post
      const relatedPosts = await strapi.entityService.findMany(
        "api::blog-post.blog-post",
        {
          filters: {
            id: { $ne: id },
            categories: {
              id: { $in: categoryIds },
            },
          },
          populate: ["featuredImage", "categories", "author"],
          sort: { createdAt: "desc" },
          limit: parseInt(limit),
        }
      );

      return this.transformResponse(relatedPosts);
    },

    // Custom method to get posts by category
    async findByCategory(ctx) {
      const { slug } = ctx.params;
      const { page = 1, pageSize = 10 } = ctx.query;

      // Find the category by slug
      const category = await strapi.db.query("api::category.category").findOne({
        where: { slug },
      });

      if (!category) {
        return ctx.notFound("Category not found");
      }

      // Find posts in this category
      const posts = await strapi.entityService.findMany(
        "api::blog-post.blog-post",
        {
          filters: {
            categories: {
              id: category.id,
            },
          },
          populate: ["featuredImage", "categories", "author"],
          sort: { createdAt: "desc" },
          start: (page - 1) * pageSize,
          limit: pageSize,
        }
      );

      // Get total count for pagination
      const count = await strapi.db.query("api::blog-post.blog-post").count({
        where: {
          categories: {
            id: category.id,
          },
        },
      });

      return {
        data: posts,
        meta: {
          category: {
            name: category.name,
            slug: category.slug,
            description: category.description,
          },
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            pageCount: Math.ceil(count / pageSize),
            total: count,
          },
        },
      };
    },
  })
);
