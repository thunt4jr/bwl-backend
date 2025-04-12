"use strict";

/**
 * Consultation request service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::consulttation-request.consultation-request",
  ({ strapi }) => ({
    // Send notification email about new consultation request
    async sendNotification(requestId) {
      // Get the consultation request with practice area
      const consultationRequest = await strapi.entityService.findOne(
        "api::consulttation-request.consultation-request",
        requestId,
        {
          populate: ["attorneyAssigned"],
        }
      );

      if (!consultationRequest) {
        throw new Error("Consultation request not found");
      }

      // Prepare email content
      const emailTemplate = {
        subject: `New Consultation Request: ${consultationRequest.practiceArea}`,
        text: `
        A new consultation request has been received:
        
        Name: ${consultationRequest.firstName} ${consultationRequest.lastName}
        Email: ${consultationRequest.email}
        Phone: ${consultationRequest.phone}
        Practice Area: ${consultationRequest.practiceArea}
        Preferred Date: ${new Date(consultationRequest.preferredDate).toLocaleDateString()}
        Preferred Time: ${consultationRequest.preferredTime}
        
        Description:
        ${consultationRequest.description}
        
        Please log in to the admin dashboard to process this request.
      `,
      };

      // This is a placeholder - you would integrate with your preferred email provider
      // For example, using Strapi email plugin:
      try {
        // Assume there's an email configuration
        if (strapi.plugins["email"]) {
          await strapi.plugins["email"].services.email.send({
            to: "office@lawfirm.com", // Replace with actual recipient
            ...emailTemplate,
          });

          return { success: true };
        } else {
          throw new Error("Email plugin is not configured");
        }
      } catch (error) {
        console.error("Failed to send email notification:", error);
        throw error;
      }
    },

    // Send notification to attorney about assignment
    async sendAttorneyAssignmentNotification(requestId) {
      // Get the consultation request with attorney information
      const consultationRequest = await strapi.entityService.findOne(
        "api::consulttation-request.consultation-request",
        requestId,
        {
          populate: ["attorneyAssigned"],
        }
      );

      if (!consultationRequest || !consultationRequest.attorneyAssigned) {
        throw new Error("Consultation request or assigned attorney not found");
      }

      const attorney = consultationRequest.attorneyAssigned;

      // Prepare email content
      const emailTemplate = {
        subject: `New Consultation Assignment: ${consultationRequest.firstName} ${consultationRequest.lastName}`,
        text: `
        Dear ${attorney.name},
        
        You have been assigned to a consultation with:
        
        Name: ${consultationRequest.firstName} ${consultationRequest.lastName}
        Practice Area: ${consultationRequest.practiceArea}
        ${
          consultationRequest.scheduledTime
            ? `Scheduled Time: ${new Date(consultationRequest.scheduledTime).toLocaleString()}`
            : `Preferred Date: ${new Date(consultationRequest.preferredDate).toLocaleDateString()}
           Preferred Time: ${consultationRequest.preferredTime}`
        }
        
        Details:
        ${consultationRequest.description}
        
        Please log in to the system to review the full details.
      `,
      };

      // This is a placeholder - you would integrate with your preferred email provider
      try {
        // Assume there's an email configuration
        if (strapi.plugins["email"] && attorney.email) {
          await strapi.plugins["email"].services.email.send({
            to: attorney.email,
            ...emailTemplate,
          });

          return { success: true };
        } else {
          throw new Error(
            "Email plugin is not configured or attorney email is missing"
          );
        }
      } catch (error) {
        console.error(
          "Failed to send attorney assignment notification:",
          error
        );
        throw error;
      }
    },

    // Get statistics on consultation requests
    async getStatistics() {
      // Get counts by status
      const statusCounts = {};
      const statuses = [
        "new",
        "scheduled",
        "completed",
        "cancelled",
        "no-show",
      ];

      for (const status of statuses) {
        const count = await strapi.db
          .query("api::consulttation-request.consultation-request")
          .count({
            where: { status },
          });

        statusCounts[status] = count;
      }

      // Get conversion count
      const conversionCount = await strapi.db
        .query("api::consulttation-request.consultation-request")
        .count({
          where: { clientConvertedToCase: true },
        });

      // Get recent trends (last 30 days vs previous 30 days)
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const sixtyDaysAgo = new Date(today);
      sixtyDaysAgo.setDate(today.getDate() - 60);

      // Recent requests (last 30 days)
      const recentCount = await strapi.db
        .query("api::consulttation-request.consultation-request")
        .count({
          where: {
            createdAt: {
              $gte: thirtyDaysAgo.toISOString(),
            },
          },
        });

      // Previous period (30-60 days ago)
      const previousCount = await strapi.db
        .query("api::consulttation-request.consultation-request")
        .count({
          where: {
            createdAt: {
              $gte: sixtyDaysAgo.toISOString(),
              $lt: thirtyDaysAgo.toISOString(),
            },
          },
        });

      // Calculate growth rate
      const growthRate =
        previousCount > 0
          ? ((recentCount - previousCount) / previousCount) * 100
          : 0;

      // Get practice area distribution
      const practiceAreaQuery = await strapi.db.connection.raw(`
      SELECT "practiceArea", COUNT(*) as count 
      FROM consultation_requests 
      GROUP BY "practiceArea" 
      ORDER BY count DESC
    `);

      // Format practice area data (this might need adjustment based on your database)
      const practiceAreaDistribution = Array.isArray(practiceAreaQuery.rows)
        ? practiceAreaQuery.rows
        : [];

      return {
        statusCounts,
        conversionCount,
        conversionRate:
          statusCounts.completed > 0
            ? (conversionCount / statusCounts.completed) * 100
            : 0,
        total: Object.values(statusCounts).reduce(
          (sum, count) => sum + count,
          0
        ),
        recentTrends: {
          current: recentCount,
          previous: previousCount,
          growthRate: parseFloat(growthRate.toFixed(2)),
        },
        practiceAreaDistribution,
      };
    },

    // Method to find consultation requests by date range
    async findByDateRange(startDate, endDate, options = {}) {
      const { status, practiceArea, page = 1, pageSize = 25 } = options;

      // Build filter
      const filters = {
        createdAt: {
          $gte: new Date(startDate).toISOString(),
          $lte: new Date(endDate).toISOString(),
        },
      };

      // Add status filter if provided
      if (status) {
        filters.status = status;
      }

      // Add practice area filter if provided
      if (practiceArea) {
        filters.practiceArea = practiceArea;
      }

      // Get consultation requests
      const consultations = await strapi.entityService.findMany(
        "api::consulttation-request.consultation-request",
        {
          filters,
          populate: ["attorneyAssigned"],
          sort: { createdAt: "desc" },
          start: (page - 1) * pageSize,
          limit: pageSize,
        }
      );

      // Get total count for pagination
      const count = await strapi.db
        .query("api::consulttation-request.consultation-request")
        .count({
          where: filters,
        });

      return {
        data: consultations,
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
