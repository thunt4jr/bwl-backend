"use strict";

/**
 * Practice area service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::practice-area.practice-area",
  ({ strapi }) => ({
    // Get all active practice areas (ordered)
    async findActive() {
      const activePracticeAreas = await strapi.entityService.findMany(
        "api::practice-area.practice-area",
        {
          filters: {
            isActive: true,
          },
          sort: { order: "asc" },
        }
      );

      return activePracticeAreas;
    },

    // Get sitemap data for practice areas
    async getSitemapData() {
      const practiceAreas = await strapi.entityService.findMany(
        "api::practice-area.practice-area",
        {
          filters: {
            isActive: true,
          },
          fields: ["title", "link", "updatedAt"],
        }
      );

      // Format data for sitemap
      return practiceAreas.map((area) => ({
        url: area.link,
        lastmod: area.updatedAt,
        priority: 0.8, // High priority for practice areas
      }));
    },

    // Method to update display order in batch
    async updateOrder(orderData) {
      // orderData should be an array of objects with id and order fields
      if (!Array.isArray(orderData)) {
        throw new Error("Order data must be an array");
      }

      // Process updates in sequence
      const results = [];

      for (const item of orderData) {
        if (!item.id || typeof item.order !== "number") {
          continue; // Skip invalid items
        }

        // Update the practice area order
        const result = await strapi.entityService.update(
          "api::practice-area.practice-area",
          item.id,
          {
            data: {
              order: item.order,
            },
          }
        );

        results.push({
          id: item.id,
          order: result.order,
        });
      }

      return results;
    },

    // Method to toggle active status
    async toggleActive(id) {
      // Get current status
      const practiceArea = await strapi.entityService.findOne(
        "api::practice-area.practice-area",
        id
      );

      if (!practiceArea) {
        throw new Error("Practice area not found");
      }

      // Toggle the status
      const updatedPracticeArea = await strapi.entityService.update(
        "api::practice-area.practice-area",
        id,
        {
          data: {
            isActive: !practiceArea.isActive,
          },
        }
      );

      return updatedPracticeArea;
    },
  })
);
