"use strict";

/**
 * Consultation request controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::consulttation-request.consultation-request",
  ({ strapi }) => ({
    // Custom create method to capture IP and user agent info
    async create(ctx) {
      // Get client IP and user agent
      const ipAddress = ctx.request.ip;
      const userAgent = ctx.request.headers["user-agent"];
      const referrer =
        ctx.request.headers["referer"] || ctx.request.headers["referrer"];

      // Add these to the request body
      ctx.request.body.data = {
        ...ctx.request.body.data,
        ipAddress,
        userAgent,
        referrer,
      };

      // Use the default create method
      const response = await super.create(ctx);

      // Optionally send notification email to staff
      try {
        await strapi
          .service("api::consulttation-request.consultation-request")
          .sendNotification(response.data.id);
      } catch (error) {
        // Log error but don't block the response
        strapi.log.error(
          "Failed to send consultation request notification:",
          error
        );
      }

      return response;
    },

    // Method to update consultation status
    async updateStatus(ctx) {
      const { id } = ctx.params;
      const { status } = ctx.request.body;

      if (!status) {
        return ctx.badRequest("Status is required");
      }

      // Validate status
      const validStatuses = [
        "new",
        "scheduled",
        "completed",
        "cancelled",
        "no-show",
      ];
      if (!validStatuses.includes(status)) {
        return ctx.badRequest(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      // Update the consultation request
      try {
        const updatedEntity = await strapi.entityService.update(
          "api::consulttation-request.consultation-request",
          id,
          {
            data: { status },
          }
        );

        return this.transformResponse(updatedEntity);
      } catch (error) {
        return ctx.badRequest(`Failed to update status: ${error.message}`);
      }
    },

    // Method to assign attorney to consultation
    async assignAttorney(ctx) {
      const { id } = ctx.params;
      const { attorneyId, scheduledTime } = ctx.request.body;

      if (!attorneyId) {
        return ctx.badRequest("Attorney ID is required");
      }

      // Validate attorney exists
      const attorney = await strapi.entityService.findOne(
        "api::staff-member.staff-member",
        attorneyId
      );
      if (!attorney) {
        return ctx.badRequest("Attorney not found");
      }

      // Update the consultation request
      try {
        const updateData = {
          attorneyAssigned: attorneyId,
        };

        // Add scheduled time if provided
        if (scheduledTime) {
          updateData.scheduledTime = scheduledTime;
          updateData.status = "scheduled";
        }

        const updatedEntity = await strapi.entityService.update(
          "api::consulttation-request.consultation-request",
          id,
          {
            data: updateData,
          }
        );

        // Send notification to attorney about assignment
        try {
          await strapi
            .service("api::consulttation-request.consultation-request")
            .sendAttorneyAssignmentNotification(id);
        } catch (notificationError) {
          strapi.log.error(
            "Failed to send attorney assignment notification:",
            notificationError
          );
        }

        return this.transformResponse(updatedEntity);
      } catch (error) {
        return ctx.badRequest(`Failed to assign attorney: ${error.message}`);
      }
    },

    // Method to mark consultation as converted to case
    async markAsConverted(ctx) {
      const { id } = ctx.params;

      try {
        const updatedEntity = await strapi.entityService.update(
          "api::consulttation-request.consultation-request",
          id,
          {
            data: {
              clientConvertedToCase: true,
              status: "completed",
            },
          }
        );

        return this.transformResponse(updatedEntity);
      } catch (error) {
        return ctx.badRequest(
          `Failed to mark consultation as converted: ${error.message}`
        );
      }
    },

    // Dashboard stats - Consultation requests by status
    async getStats(ctx) {
      try {
        return await strapi
          .service("api::consulttation-request.consultation-request")
          .getStatistics();
      } catch (error) {
        return ctx.badRequest(
          `Failed to retrieve statistics: ${error.message}`
        );
      }
    },
  })
);
