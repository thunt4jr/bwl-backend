// src/api/ai-seo/controllers/ai-seo.js
"use strict";

/**
 * Simplified AI SEO controller
 */

const { optimizeSeoContent } = require("../../../lib/ai-seo");

module.exports = {
  /**
   * Analyze content and generate SEO recommendations
   */
  async analyze(ctx) {
    try {
      const { contentType, contentId, content, seo, aiSettings } =
        ctx.request.body;

      // Validate request
      if (!content || !contentType) {
        return ctx.badRequest("Content and contentType are required");
      }

      // Perform AI analysis
      const analysis = await optimizeSeoContent(content, seo, aiSettings);

      // Return results
      return analysis;
    } catch (error) {
      strapi.log.error("AI SEO analysis error:", error);
      return ctx.badRequest(`AI SEO analysis failed: ${error.message}`);
    }
  },

  /**
   * Apply AI recommendations to content
   */
  async apply(ctx) {
    try {
      const { contentType, contentId, recommendations } = ctx.request.body;

      // Validate request
      if (!contentId || !contentType || !recommendations) {
        return ctx.badRequest(
          "ContentId, contentType, and recommendations are required"
        );
      }

      // Get the content item
      const contentItem = await strapi.entityService.findOne(
        `api::${contentType}.${contentType}`,
        contentId,
        { populate: ["seo", "seo.aiOptimization"] }
      );

      if (!contentItem) {
        return ctx.notFound("Content not found");
      }

      // Apply recommendations
      const updatedData = {
        seo: {
          ...(contentItem.seo || {}),
          metaTitle: recommendations.metaTitle || contentItem.seo?.metaTitle,
          metaDescription:
            recommendations.metaDescription || contentItem.seo?.metaDescription,
          focusKeyword:
            recommendations.focusKeyword || contentItem.seo?.focusKeyword,
          aiOptimization: {
            ...(contentItem.seo?.aiOptimization || {}),
            lastOptimizationRun: new Date().toISOString(),
            optimizationScore: recommendations.optimizationScore || 0,
            targetKeywords:
              recommendations.targetKeywords ||
              contentItem.seo?.aiOptimization?.targetKeywords,
          },
        },
      };

      // Update the content
      const updatedContent = await strapi.entityService.update(
        `api::${contentType}.${contentType}`,
        contentId,
        { data: updatedData }
      );

      // Return updated content
      return {
        contentId,
        updated: true,
        appliedAt: new Date().toISOString(),
      };
    } catch (error) {
      strapi.log.error("Error applying AI SEO recommendations:", error);
      return ctx.badRequest(
        `Failed to apply SEO recommendations: ${error.message}`
      );
    }
  },
};
