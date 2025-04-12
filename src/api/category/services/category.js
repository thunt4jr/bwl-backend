"use strict";

/**
 * Category service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::category.category", ({ strapi }) => ({
  // Get post counts for multiple categories
  async getPostCounts(categoryIds) {
    // Return empty object if no ids provided
    if (!categoryIds || !categoryIds.length) {
      return {};
    }

    // This implementation uses individual queries which is not ideal but works for a small number of categories
    // For a production implementation, consider using a more optimized query approach
    const counts = {};

    for (const categoryId of categoryIds) {
      const count = await strapi.db.query("api::blog-post.blog-post").count({
        where: {
          categories: {
            id: categoryId,
          },
          publishedAt: {
            $ne: null,
          },
        },
      });

      counts[categoryId] = count;
    }

    return counts;
  },

  // Get categories with post counts for menu display
  async getMenuCategories(limit = 10) {
    // Get published categories
    const categories = await strapi.entityService.findMany(
      "api::category.category",
      {
        filters: {
          publishedAt: {
            $ne: null,
          },
        },
        sort: { name: "asc" },
        limit: parseInt(limit),
      }
    );

    // Get post counts
    const categoryIds = categories.map((cat) => cat.id);
    const postCounts = await this.getPostCounts(categoryIds);

    // Add counts to categories
    return categories.map((category) => ({
      ...category,
      postCount: postCounts[category.id] || 0,
    }));
  },

  // Get sitemap data for categories
  async getSitemapData() {
    const categories = await strapi.entityService.findMany(
      "api::category.category",
      {
        filters: {
          publishedAt: {
            $ne: null,
          },
        },
        fields: ["slug", "updatedAt"],
      }
    );

    // Format for sitemap
    return categories.map((category) => ({
      url: `/blog/category/${category.slug}`,
      lastmod: category.updatedAt,
      priority: 0.7,
    }));
  },

  // Get active categories with at least one post
  async getActiveCategories() {
    // First, get all categories
    const categories = await strapi.entityService.findMany(
      "api::category.category",
      {
        filters: {
          publishedAt: {
            $ne: null,
          },
        },
      }
    );

    // Get counts to filter out empty categories
    const categoryIds = categories.map((cat) => cat.id);
    const postCounts = await this.getPostCounts(categoryIds);

    // Filter to keep only categories with at least one post
    return categories
      .filter((category) => (postCounts[category.id] || 0) > 0)
      .map((category) => ({
        ...category,
        postCount: postCounts[category.id] || 0,
      }));
  },
}));
