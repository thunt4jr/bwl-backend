// src/bootstrap/permissions.ts

/**
 * A simplified implementation of permissions setup that focuses on reliability
 */
export default async ({ strapi }) => {
  try {
    console.log("Starting permissions bootstrap process...");

    // Find the public role
    const publicRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: "public" } });

    if (!publicRole) {
      console.error("Could not find public role");
      return;
    }

    console.log(`Found public role with ID: ${publicRole.id}`);

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

    // Custom route permissions
    const customRoutesPermissions = [
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

    // Prepare permissions to create
    const permissionsToCreate = [];

    // Add standard CRUD permissions
    for (const contentType of contentTypes) {
      for (const action of actions) {
        // Build the action string
        const actionString = `${contentType}.${action}`;

        // Check if permission already exists
        const existingPermission = await strapi
          .query("plugin::users-permissions.permission")
          .findOne({
            where: {
              action: actionString,
              role: publicRole.id,
            },
          });

        if (!existingPermission) {
          permissionsToCreate.push({
            action: actionString,
            role: publicRole.id,
            enabled: true,
          });
        }
      }
    }

    // Add custom route permissions
    for (const permission of customRoutesPermissions) {
      const existingPermission = await strapi
        .query("plugin::users-permissions.permission")
        .findOne({
          where: {
            action: permission,
            role: publicRole.id,
          },
        });

      if (!existingPermission) {
        permissionsToCreate.push({
          action: permission,
          role: publicRole.id,
          enabled: true,
        });
      }
    }

    // Log all permissions that will be created
    console.log(`Found ${permissionsToCreate.length} permissions to create`);
    if (permissionsToCreate.length > 0) {
      console.log("Permissions to create:");
      permissionsToCreate.forEach((p) => console.log(`- ${p.action}`));

      // Create all missing permissions
      await strapi.query("plugin::users-permissions.permission").createMany({
        data: permissionsToCreate,
      });

      console.log(
        `Created ${permissionsToCreate.length} permissions for public role`
      );
    } else {
      console.log("No new permissions needed to be created");
    }

    console.log("Public API permissions set up successfully");
  } catch (error) {
    console.error("Error in permissions bootstrap:", error);
  }
};
