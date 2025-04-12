// scripts/setup-permissions.js
"use strict";

/**
 * This script sets up permissions for the Strapi application.
 * Run it with: node scripts/setup-permissions.js
 */

const strapiEnv = process.env.NODE_ENV || "development";
console.log(`Running in ${strapiEnv} environment`);

// Path to Strapi instance
const appDir = process.cwd();
console.log(`App directory: ${appDir}`);

// Direct permissions setup without using the service
async function setupPermissionsDirectly(strapi) {
  try {
    console.log("Setting up permissions directly...");

    // Find the public role
    const publicRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: "public" } });

    if (!publicRole) {
      console.error("Could not find public role");
      return { success: false, error: "Public role not found" };
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
        // Build the action string as it appears in the users-permissions plugin
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
    }

    // Create all missing permissions in a single batch operation
    if (permissionsToCreate.length > 0) {
      try {
        await strapi.query("plugin::users-permissions.permission").createMany({
          data: permissionsToCreate,
        });

        console.log(
          `Created ${permissionsToCreate.length} permissions for public role`
        );
      } catch (error) {
        console.error("Error creating permissions:", error);
        return { success: false, error: error.message };
      }
    } else {
      console.log("No new permissions needed to be created");
    }

    console.log("Public API permissions set up successfully");
    return {
      success: true,
      created: permissionsToCreate.length,
      permissions: permissionsToCreate.map((p) => p.action),
    };
  } catch (error) {
    console.error("Error in permissions setup:", error);
    return { success: false, error: error.message };
  }
}

// Main function to run Strapi and set up permissions
async function setupPermissions() {
  try {
    console.log("Starting Strapi to set up permissions...");

    // Import the Strapi factory
    const { createStrapi } = require("@strapi/strapi");

    // Create a new Strapi instance
    console.log("Creating Strapi instance...");
    const strapi = await createStrapi({
      appDir,
      autoReload: false,
    }).load();

    console.log("Strapi loaded successfully");

    // Run the permission setup
    const result = await setupPermissionsDirectly(strapi);

    // Log the results
    console.log("Permission setup complete!");
    console.log(JSON.stringify(result, null, 2));

    // Gracefully shut down Strapi
    console.log("Shutting down Strapi...");
    await strapi.destroy();
    console.log("Strapi shutdown complete");

    // Exit with success
    process.exit(0);
  } catch (error) {
    console.error("Error setting up permissions:", error);
    process.exit(1);
  }
}

// Run the setup
setupPermissions();
