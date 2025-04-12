"use strict";

/**
 * Contact controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::contact.contact", ({ strapi }) => ({
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
        .service("api::contact.contact")
        .sendNotification(response.data.id);
    } catch (error) {
      // Log error but don't block the response
      strapi.log.error("Failed to send contact form notification:", error);
    }

    return response;
  },

  // Method to update contact status
  async updateStatus(ctx) {
    const { id } = ctx.params;
    const { status } = ctx.request.body;

    if (!status) {
      return ctx.badRequest("Status is required");
    }

    // Validate status
    const validStatuses = ["new", "in-progress", "completed", "archived"];
    if (!validStatuses.includes(status)) {
      return ctx.badRequest(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    // Update the contact
    try {
      const updatedEntity = await strapi.entityService.update(
        "api::contact.contact",
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

  // Method to assign contact to staff member
  async assignContact(ctx) {
    const { id } = ctx.params;
    const { staffMemberId } = ctx.request.body;

    if (!staffMemberId) {
      return ctx.badRequest("Staff member ID is required");
    }

    // Validate staff member exists
    const staffMember = await strapi.entityService.findOne(
      "api::staff-member.staff-member",
      staffMemberId
    );
    if (!staffMember) {
      return ctx.badRequest("Staff member not found");
    }

    // Update the contact
    try {
      const updatedEntity = await strapi.entityService.update(
        "api::contact.contact",
        id,
        {
          data: {
            assignedTo: staffMemberId,
            status: "in-progress", // Automatically update status when assigned
          },
        }
      );

      // Send notification to assigned staff member (if email service is configured)
      try {
        await strapi
          .service("api::contact.contact")
          .sendAssignmentNotification(id);
      } catch (notificationError) {
        strapi.log.error(
          "Failed to send staff assignment notification:",
          notificationError
        );
      }

      return this.transformResponse(updatedEntity);
    } catch (error) {
      return ctx.badRequest(`Failed to assign contact: ${error.message}`);
    }
  },

  // Method to get contacts by date range
  async findByDateRange(ctx) {
    const { startDate, endDate } = ctx.query;

    if (!startDate || !endDate) {
      return ctx.badRequest("Both startDate and endDate are required");
    }

    try {
      return await strapi
        .service("api::contact.contact")
        .findByDateRange(startDate, endDate, ctx.query);
    } catch (error) {
      return ctx.badRequest(`Failed to retrieve contacts: ${error.message}`);
    }
  },

  // Get statistics on contact submissions
  async getStats(ctx) {
    try {
      return await strapi.service("api::contact.contact").getStatistics();
    } catch (error) {
      return ctx.badRequest(`Failed to retrieve statistics: ${error.message}`);
    }
  },
}));
