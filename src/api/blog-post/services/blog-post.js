"use strict";

/**
 * Blog post service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::blog-post.blog-post",
  ({ strapi }) => ({
    // Method to find popular blog posts
    async findPopular(limit = 5) {
      // This is a placeholder implementation - in a real application, you might
      // determine popularity based on view count, comments, or other metrics
      const popularPosts = await strapi.entityService.findMany(
        "api::blog-post.blog-post",
        {
          sort: { publishedAt: "desc" }, // Sort by publication date as a simple proxy for popularity
          limit,
          populate: ["featuredImage", "categories", "author"],
        }
      );

      return popularPosts;
    },

    // Method to generate reading time estimate
    async calculateReadingTime(content) {
      if (!content) return 5; // Default reading time if no content

      // Average reading speed (words per minute)
      const wordsPerMinute = 225;

      // Count words (simplistic approach)
      const textContent = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
      const wordCount = textContent.split(/\s+/).length;

      // Calculate reading time in minutes
      let readingTime = Math.ceil(wordCount / wordsPerMinute);

      // Ensure minimum reading time of 1 minute
      return readingTime > 0 ? readingTime : 1;
    },

    // Override the create method to automatically calculate reading time
    async create(data) {
      // If reading time is not provided, calculate it
      if (!data.readingTime && data.content) {
        data.readingTime = await this.calculateReadingTime(data.content);
      }

      // Call the parent create method
      return await super.create(data);
    },

    // Override the update method to recalculate reading time if content changes
    async update(entityId, data) {
      // If content is provided, recalculate reading time
      if (data.content) {
        data.readingTime = await this.calculateReadingTime(data.content);
      }

      // Call the parent update method
      return await super.update(entityId, data);
    },

    // Method to find blog posts by author
    async findByAuthor(authorId, options = {}) {
      const { page = 1, pageSize = 10 } = options;

      const posts = await strapi.entityService.findMany(
        "api::blog-post.blog-post",
        {
          filters: {
            author: {
              id: authorId,
            },
          },
          populate: ["featuredImage", "categories", "author"],
          sort: { publishedAt: "desc" },
          start: (page - 1) * pageSize,
          limit: pageSize,
        }
      );

      // Get total count for pagination
      const count = await strapi.db.query("api::blog-post.blog-post").count({
        where: {
          author: {
            id: authorId,
          },
        },
      });

      return {
        data: posts,
        meta: {
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
