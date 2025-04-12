"use strict";

/**
 * Contact service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::contact.contact", ({ strapi }) => ({
  // Send notification email about new contact submission
  async sendNotification(contactId) {
    // Get the contact with details
    const contactEntry = await strapi.entityService.findOne(
      "api::contact.contact",
      contactId
    );

    if (!contactEntry) {
      throw new Error("Contact entry not found");
    }

    // Prepare email content
    const emailTemplate = {
      subject: `New Contact Form Submission: ${contactEntry.firstName} ${contactEntry.lastName}`,
      text: `
        A new contact form submission has been received:
        
        Name: ${contactEntry.firstName} ${contactEntry.lastName}
        Email: ${contactEntry.email}
        Phone: ${contactEntry.phone || "Not provided"}
        
        Message:
        ${contactEntry.message}
        
        Please log in to the admin dashboard to process this contact.
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

  // Send notification to staff member about assignment
  async sendAssignmentNotification(contactId) {
    // Get the contact with assigned staff member
    const contactEntry = await strapi.entityService.findOne(
      "api::contact.contact",
      contactId,
      {
        populate: ["assignedTo"],
      }
    );

    if (!contactEntry || !contactEntry.assignedTo) {
      throw new Error("Contact or assigned staff member not found");
    }

    const staffMember = contactEntry.assignedTo;

    // Prepare email content
    const emailTemplate = {
      subject: `New Contact Assignment: ${contactEntry.firstName} ${contactEntry.lastName}`,
      text: `
        Dear ${staffMember.name},
        
        You have been assigned to respond to a contact form submission from:
        
        Name: ${contactEntry.firstName} ${contactEntry.lastName}
        Email: ${contactEntry.email}
        Phone: ${contactEntry.phone || "Not provided"}
        
        Message:
        ${contactEntry.message}
        
        Please log in to the system to review the full details.
      `,
    };

    // This is a placeholder - you would integrate with your preferred email provider
    try {
      // Assume there's an email configuration
      if (strapi.plugins["email"] && staffMember.email) {
        await strapi.plugins["email"].services.email.send({
          to: staffMember.email,
          ...emailTemplate,
        });

        return { success: true };
      } else {
        throw new Error(
          "Email plugin is not configured or staff member email is missing"
        );
      }
    } catch (error) {
      console.error("Failed to send staff assignment notification:", error);
      throw error;
    }
  },

  // Get statistics on contact submissions
  async getStatistics() {
    // Get counts by status
    const statusCounts = {};
    const statuses = ["new", "in-progress", "completed", "archived"];

    for (const status of statuses) {
      const count = await strapi.db.query("api::contact.contact").count({
        where: { status },
      });

      statusCounts[status] = count;
    }

    // Get recent trends (last 30 days vs previous 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    // Recent contacts (last 30 days)
    const recentCount = await strapi.db.query("api::contact.contact").count({
      where: {
        createdAt: {
          $gte: thirtyDaysAgo.toISOString(),
        },
      },
    });

    // Previous period (30-60 days ago)
    const previousCount = await strapi.db.query("api::contact.contact").count({
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

    // Get most common contact topics (based on message text analysis)
    // This is a simplified approach - in production, you might use NLP or a more sophisticated solution
    // For now, we'll skip this

    return {
      statusCounts,
      total: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
      recentTrends: {
        current: recentCount,
        previous: previousCount,
        growthRate: parseFloat(growthRate.toFixed(2)),
      },
    };
  },

  // Method to find contacts by date range
  async findByDateRange(startDate, endDate, options = {}) {
    const { status, page = 1, pageSize = 25 } = options;

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

    // Get contacts
    const contacts = await strapi.entityService.findMany(
      "api::contact.contact",
      {
        filters,
        populate: ["assignedTo"],
        sort: { createdAt: "desc" },
        start: (page - 1) * pageSize,
        limit: pageSize,
      }
    );

    // Get total count for pagination
    const count = await strapi.db.query("api::contact.contact").count({
      where: filters,
    });

    return {
      data: contacts,
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

  // Process pending contacts (e.g., for a cron job)
  async processPendingContacts() {
    // Get all new contacts that haven't been processed yet
    const pendingContacts = await strapi.entityService.findMany(
      "api::contact.contact",
      {
        filters: {
          status: "new",
          createdAt: {
            // Older than 1 hour but younger than 7 days (to avoid very old ones)
            $lt: new Date(Date.now() - 3600 * 1000).toISOString(),
            $gt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
          },
        },
        sort: { createdAt: "asc" }, // Process oldest first
        limit: 50, // Process in batches
      }
    );

    // Process results
    const results = {
      processed: 0,
      errors: 0,
    };

    for (const contact of pendingContacts) {
      try {
        // This is where you'd implement your contact processing logic
        // For example:
        // 1. Analyze content to determine urgency
        // 2. Auto-assign to staff members based on availability or topic
        // 3. Send reminder emails about unprocessed contacts

        // For now, we'll just mark them as in-progress
        await strapi.entityService.update("api::contact.contact", contact.id, {
          data: {
            // You could add autoprocess flag or notes here
            notes: contact.notes
              ? contact.notes +
                "\n\nAuto-processed on " +
                new Date().toISOString()
              : "Auto-processed on " + new Date().toISOString(),
          },
        });

        results.processed++;
      } catch (error) {
        console.error(`Error processing contact ID ${contact.id}:`, error);
        results.errors++;
      }
    }

    return results;
  },
}));
