"use strict";

/**
 * Staff member service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::staff-member.staff-member",
  ({ strapi }) => ({
    // Find featured staff members
    async findFeatured(limit = 4) {
      const featuredStaff = await strapi.entityService.findMany(
        "api::staff-member.staff-member",
        {
          filters: {
            featured: true,
          },
          populate: ["avatar", "socialMedia"],
          sort: ["order:asc", "name:asc"],
          limit,
        }
      );

      return featuredStaff;
    },

    // Format staff experience data for display
    async formatExperienceData(staffMember) {
      if (
        !staffMember ||
        !staffMember.experience ||
        staffMember.experience.length === 0
      ) {
        return staffMember;
      }

      // Add calculated fields for experience display
      const enhancedExperience = staffMember.experience.map((exp) => {
        // Calculate duration
        let duration = "";

        if (exp.startDate) {
          const startYear = new Date(exp.startDate).getFullYear();
          const endYear = exp.current
            ? "Present"
            : exp.endDate
              ? new Date(exp.endDate).getFullYear()
              : "Present";
          duration = `${startYear} - ${endYear}`;
        }

        return {
          ...exp,
          duration,
        };
      });

      // Sort by start date (most recent first)
      enhancedExperience.sort((a, b) => {
        // Current positions come first
        if (a.current && !b.current) return -1;
        if (!a.current && b.current) return 1;

        // Otherwise sort by start date (descending)
        const aDate = a.startDate ? new Date(a.startDate) : new Date(0);
        const bDate = b.startDate ? new Date(b.startDate) : new Date(0);
        return bDate - aDate;
      });

      // Return enhanced staff member data
      return {
        ...staffMember,
        experience: enhancedExperience,
      };
    },

    // Override findOne to include formatted experience data
    async findOne(entityId, params = {}) {
      const result = await super.findOne(entityId, params);

      if (result) {
        return this.formatExperienceData(result);
      }

      return result;
    },

    // Get practice area specialization counts
    async getSpecializationStats() {
      // This would typically use a more sophisticated approach with database aggregation
      // For now, this is a simplified implementation

      const staffMembers = await strapi.entityService.findMany(
        "api::staff-member.staff-member",
        {
          fields: ["specialties"],
        }
      );

      // Extract and count specialties
      const specialtiesCount = {};

      staffMembers.forEach((member) => {
        if (member.specialties) {
          // Split specialties by commas, semicolons, or newlines
          const specialtiesList = member.specialties
            .split(/[,;\n]+/)
            .map((s) => s.trim());

          specialtiesList.forEach((specialty) => {
            if (specialty) {
              specialtiesCount[specialty] =
                (specialtiesCount[specialty] || 0) + 1;
            }
          });
        }
      });

      // Convert to array and sort by count (descending)
      const result = Object.entries(specialtiesCount)
        .map(([name, count]) => ({
          name,
          count,
        }))
        .sort((a, b) => b.count - a.count);

      return result;
    },
  })
);
