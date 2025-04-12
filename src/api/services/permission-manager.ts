// src/api/services/permission-manager.ts
"use strict";

/**
 * Enhanced permission management service for Strapi
 */

module.exports = () => ({
  /**
   * Get all permissions for a role
   * @param {string} roleName - Name of the role to get permissions for
   * @returns {Promise<Array>} - List of permission objects
   */
  async getRolePermissions(roleName) {
    try {
      // Find the role
      const role = await strapi
        .query("plugin::users-permissions.role")
        .findOne({
          where: { type: roleName },
          populate: ["permissions"],
        });

      if (!role) {
        console.error(`Role "${roleName}" not found`);
        return [];
      }

      return role.permissions || [];
    } catch (error) {
      console.error(`Error fetching permissions for ${roleName} role:`, error);
      throw error;
    }
  },

  /**
   * Set permissions for a role
   * @param {string} roleName - Name of the role to set permissions for
   * @param {Array} permissions - Array of permission strings to set
   * @returns {Promise<Object>} - Result object with success status and count
   */
  async setRolePermissions(roleName, permissions) {
    try {
      console.log(`Setting permissions for role: ${roleName}`);

      // Find the role
      const role = await strapi
        .query("plugin::users-permissions.role")
        .findOne({ where: { type: roleName } });

      if (!role) {
        console.error(`Role "${roleName}" not found`);
        return { success: false, error: "Role not found" };
      }

      console.log(`Found role: ${role.name} (ID: ${role.id})`);

      // Get all existing permissions
      const existingPermissions = await strapi
        .query("plugin::users-permissions.permission")
        .findMany({
          where: { role: role.id },
          select: ["id", "action"],
        });

      console.log(`Found ${existingPermissions.length} existing permissions`);

      // Create a map of existing permissions for easy lookup
      const existingPermissionsMap = existingPermissions.reduce(
        (acc, permission) => {
          acc[permission.action] = permission.id;
          return acc;
        },
        {}
      );

      // Prepare permissions to create
      const permissionsToCreate = [];

      for (const permission of permissions) {
        if (!existingPermissionsMap[permission]) {
          permissionsToCreate.push({
            action: permission,
            role: role.id,
            enabled: true,
          });
        }
      }

      console.log(`Creating ${permissionsToCreate.length} new permissions`);

      // Log all permissions that will be created
      if (permissionsToCreate.length > 0) {
        console.log("New permissions to create:");
        permissionsToCreate.forEach((p) => console.log(`- ${p.action}`));
      }

      // Create missing permissions
      if (permissionsToCreate.length > 0) {
        try {
          await strapi
            .query("plugin::users-permissions.permission")
            .createMany({
              data: permissionsToCreate,
            });

          console.log(
            `Created ${permissionsToCreate.length} permissions for ${roleName} role`
          );
        } catch (createError) {
          console.error(`Error creating permissions:`, createError);
          throw createError;
        }
      } else {
        console.log(`No new permissions needed for ${roleName} role`);
      }

      return {
        success: true,
        created: permissionsToCreate.length,
        permissions: permissionsToCreate.map((p) => p.action),
      };
    } catch (error) {
      console.error(`Error setting permissions for ${roleName} role:`, error);
      return {
        success: false,
        error: error.message || "Unknown error",
      };
    }
  },

  /**
   * Set up default permissions for public role
   */
  async setupPublicPermissions() {
    console.log("Setting up public permissions...");

    // Standard CRUD operations for content types
    const contentTypes = [
      "api::practice-area.practice-area",
      "api::blog-post.blog-post",
      "api::hero-slide.hero-slide",
      "api::staff-member.staff-member",
      "api::category.category",
    ];

    // Basic actions to enable
    const actions = ["find", "findOne"];

    // Build standard permission strings
    const standardPermissions = [];
    for (const contentType of contentTypes) {
      for (const action of actions) {
        standardPermissions.push(`${contentType}.${action}`);
      }
    }

    // Custom route permissions
    const customRoutePermissions = [
      "api::staff-member.staff-member.findBySlug",
      "api::staff-member.staff-member.findAttorneys",
      "api::staff-member.staff-member.findBlogPosts",
      "api::blog-post.blog-post.findRelated",
      "api::blog-post.blog-post.findByCategory",
      "api::category.category.findBySlug",
      "api::category.category.getMenuCategories",
      "api::practice-area.practice-area.findForHomepage",
      "api::practice-area.practice-area.count",
      "api::consultation-request.consultation-request.create",
      "api::contact.contact.create",
    ];

    // Combine all permissions
    const allPermissions = [...standardPermissions, ...customRoutePermissions];

    console.log(
      `Total permissions to set for public role: ${allPermissions.length}`
    );

    // Set permissions for public role
    return this.setRolePermissions("public", allPermissions);
  },

  /**
   * Set up default permissions for authenticated role
   */
  async setupAuthenticatedPermissions() {
    console.log("Setting up authenticated user permissions...");

    // Start with all public permissions
    const publicResult = await this.setupPublicPermissions();

    if (!publicResult.success) {
      console.error(
        "Failed to set up public permissions. Aborting authenticated permissions setup."
      );
      return publicResult;
    }

    // Additional permissions for authenticated users
    const additionalPermissions = [
      "api::consultation-request.consultation-request.find",
      "api::consultation-request.consultation-request.findOne",
      "api::contact.contact.find",
      "api::contact.contact.findOne",
    ];

    // Get existing public permissions
    const publicRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({
        where: { type: "public" },
        populate: ["permissions"],
      });

    // Extract permission actions from public role
    const publicPermissions =
      publicRole?.permissions?.map((p) => p.action) || [];

    // Combine with additional permissions
    const allPermissions = [...publicPermissions, ...additionalPermissions];

    console.log(
      `Total permissions to set for authenticated role: ${allPermissions.length}`
    );

    // Set permissions for authenticated role
    return this.setRolePermissions("authenticated", allPermissions);
  },

  /**
   * Set up all default role permissions
   */
  async setupAllRolePermissions() {
    console.log("Setting up all role permissions...");

    try {
      // Set up public role permissions
      const publicResult = await this.setupPublicPermissions();
      console.log("Public role permissions result:", publicResult);

      // Set up authenticated role permissions
      const authenticatedResult = await this.setupAuthenticatedPermissions();
      console.log(
        "Authenticated role permissions result:",
        authenticatedResult
      );

      return {
        success: publicResult.success && authenticatedResult.success,
        public: publicResult,
        authenticated: authenticatedResult,
      };
    } catch (error) {
      console.error("Error setting up role permissions:", error);
      return {
        success: false,
        error: error.message || "Unknown error",
      };
    }
  },

  /**
   * Create a permission-setup endpoint (for manual fixes if needed)
   */
  async setupPermissionsEndpoint(ctx) {
    try {
      const result = await this.setupAllRolePermissions();
      return result;
    } catch (error) {
      return ctx.badRequest(`Failed to set up permissions: ${error.message}`);
    }
  },
});
