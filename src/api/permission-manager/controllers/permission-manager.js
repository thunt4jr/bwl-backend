// src/api/permission-manager/controllers/permission-manager.js
"use strict";

/**
 * Permission manager controller
 * Provides API endpoints to manage permissions
 */

module.exports = {
  /**
   * Set up all permissions
   * @param {object} ctx - Koa context
   */
  async setupPermissions(ctx) {
    try {
      // Get the service
      const permissionManagerService = strapi.service(
        "api::permission-manager.permission-manager"
      );

      if (!permissionManagerService) {
        return ctx.badRequest("Permission manager service not found");
      }

      // Run the permissions setup
      const result = await permissionManagerService.setupAllRolePermissions();

      // Return the result
      return result;
    } catch (error) {
      return ctx.badRequest(`Failed to set up permissions: ${error.message}`);
    }
  },

  /**
   * Get current permission status
   * @param {object} ctx - Koa context
   */
  async getPermissionStatus(ctx) {
    try {
      // Get all roles
      const roles = await strapi
        .query("plugin::users-permissions.role")
        .findMany({
          populate: ["permissions"],
        });

      // Create a status report
      const status = roles.map((role) => {
        // Group permissions by controller
        const permissionsByController = {};

        role.permissions.forEach((permission) => {
          const parts = permission.action.split(".");
          const controller = parts.length > 1 ? parts[0] : "other";

          if (!permissionsByController[controller]) {
            permissionsByController[controller] = [];
          }

          permissionsByController[controller].push(permission.action);
        });

        return {
          role: {
            id: role.id,
            name: role.name,
            type: role.type,
            description: role.description,
          },
          permissionCount: role.permissions.length,
          permissions: permissionsByController,
        };
      });

      return {
        timestamp: new Date().toISOString(),
        roles: status,
      };
    } catch (error) {
      return ctx.badRequest(
        `Failed to get permission status: ${error.message}`
      );
    }
  },
};
