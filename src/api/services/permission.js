"use strict";

/**
 * Permission service to manage roles and permissions
 */

module.exports = () => ({
  /**
   * Set permissions for a role
   * @param {string} roleName - Name of the role to set permissions for
   * @param {Array} permissions - Array of permissions to set
   */
  async setRolePermissions(roleName, permissions) {
    try {
      // Find the role
      const role = await strapi
        .query("plugin::users-permissions.role")
        .findOne({ where: { type: roleName } });

      if (!role) {
        throw new Error(`Role "${roleName}" not found`);
      }

      // Get all existing permissions
      const existingPermissions = await strapi
        .query("plugin::users-permissions.permission")
        .findMany({
          where: { role: role.id },
          select: ["id", "action"],
        });

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

      // Create missing permissions
      if (permissionsToCreate.length > 0) {
        await strapi.query("plugin::users-permissions.permission").createMany({
          data: permissionsToCreate,
        });

        console.log(
          `Created ${permissionsToCreate.length} permissions for ${roleName} role`
        );
      }

      return { success: true, created: permissionsToCreate.length };
    } catch (error) {
      console.error(`Error setting permissions for ${roleName} role:`, error);
      throw error;
    }
  },

  /**
   * Set up default permissions for the public role
   */
  async setupPublicPermissions() {
    const publicPermissions = [
      // Blog posts
      "api::blog-post.blog-post.find",
      "api::blog-post.blog-post.findOne",
      "api::blog-post.blog-post.findRelated",
      "api::blog-post.blog-post.findByCategory",

      // Categories
      "api::category.category.find",
      "api::category.category.findOne",

      // Staff members
      "api::staff-member.staff-member.find",
      "api::staff-member.staff-member.findOne",
      "api::staff-member.staff-member.findBySlug",
      "api::staff-member.staff-member.findAttorneys",
      "api::staff-member.staff-member.findBlogPosts",

      // Practice areas
      "api::practice-area.practice-area.find",
      "api::practice-area.practice-area.findOne",
      "api::practice-area.practice-area.findForHomepage",
      "api::practice-area.practice-area.count",

      // Hero slides
      "api::hero-slide.hero-slide.find",

      // Consultation requests
      "api::consulttation-request.consultation-request.create",

      // Contacts
      "api::contact.contact.create",
    ];

    return this.setRolePermissions("public", publicPermissions);
  },

  /**
   * Set up default permissions for the authenticated role
   */
  async setupAuthenticatedPermissions() {
    const authenticatedPermissions = [
      // Include all public permissions
      "api::blog-post.blog-post.find",
      "api::blog-post.blog-post.findOne",
      "api::blog-post.blog-post.findRelated",
      "api::blog-post.blog-post.findByCategory",
      "api::category.category.find",
      "api::category.category.findOne",
      "api::staff-member.staff-member.find",
      "api::staff-member.staff-member.findOne",
      "api::staff-member.staff-member.findBySlug",
      "api::staff-member.staff-member.findAttorneys",
      "api::staff-member.staff-member.findBlogPosts",
      "api::practice-area.practice-area.find",
      "api::practice-area.practice-area.findOne",
      "api::practice-area.practice-area.findForHomepage",
      "api::practice-area.practice-area.count",
      "api::hero-slide.hero-slide.find",
      "api::consulttation-request.consultation-request.create",
      "api::contact.contact.create",

      // Add authenticated-specific permissions
      "api::consulttation-request.consultation-request.find",
      "api::consulttation-request.consultation-request.findOne",
      "api::contact.contact.find",
      "api::contact.contact.findOne",
    ];

    return this.setRolePermissions("authenticated", authenticatedPermissions);
  },

  /**
   * Set up all default role permissions
   */
  async setupAllRolePermissions() {
    await this.setupPublicPermissions();
    await this.setupAuthenticatedPermissions();

    return { success: true };
  },
});
