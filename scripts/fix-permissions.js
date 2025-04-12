// scripts/fix-permissions.js
"use strict";

const { Knex } = require("knex");
const path = require("path");
const fs = require("fs");

// Get database configuration
let dbConfig;
try {
  // Try to read database config from .env file
  require("dotenv").config();

  // Default to sqlite if no specific config found
  const dbClient = process.env.DATABASE_CLIENT || "sqlite";

  if (dbClient === "sqlite") {
    const dbFile = process.env.DATABASE_FILENAME || ".tmp/data.db";
    const dbPath = path.resolve(process.cwd(), dbFile);

    if (!fs.existsSync(dbPath)) {
      console.error(`Database file not found: ${dbPath}`);
      process.exit(1);
    }

    dbConfig = {
      client: "sqlite3",
      connection: {
        filename: dbPath,
      },
      useNullAsDefault: true,
    };

    console.log(`Using SQLite database at: ${dbPath}`);
  } else {
    console.error(`Unsupported database client: ${dbClient}`);
    process.exit(1);
  }
} catch (error) {
  console.error("Error reading database configuration:", error);
  process.exit(1);
}

// Connect to the database
const knex = require("knex")(dbConfig);

async function setupPermissions() {
  try {
    console.log("Setting up permissions...");

    // Get the public role
    const publicRole = await knex("up_roles").where({ type: "public" }).first();

    if (!publicRole) {
      console.error("Public role not found");
      return;
    }

    console.log(`Found public role with ID: ${publicRole.id}`);

    // Define permissions to set up
    const routePermissions = [
      // Standard content type operations
      "api::practice-area.practice-area.find",
      "api::practice-area.practice-area.findOne",
      "api::blog-post.blog-post.find",
      "api::blog-post.blog-post.findOne",
      "api::hero-slide.hero-slide.find",
      "api::hero-slide.hero-slide.findOne",
      "api::staff-member.staff-member.find",
      "api::staff-member.staff-member.findOne",
      "api::category.category.find",
      "api::category.category.findOne",

      // Custom routes
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

    // Get existing permissions
    const existingPermissions = await knex("up_permissions")
      .where({ role: publicRole.id })
      .select("id", "action");

    console.log(`Found ${existingPermissions.length} existing permissions`);

    // Create a map of existing permissions
    const existingPermissionsMap = {};
    existingPermissions.forEach((p) => {
      existingPermissionsMap[p.action] = p.id;
    });

    // Prepare permissions to create
    const permissionsToCreate = [];

    for (const permission of routePermissions) {
      if (!existingPermissionsMap[permission]) {
        permissionsToCreate.push({
          action: permission,
          role: publicRole.id,
          created_at: new Date(),
          updated_at: new Date(),
          enabled: true,
        });
      }
    }

    console.log(`Found ${permissionsToCreate.length} permissions to create`);

    if (permissionsToCreate.length > 0) {
      // Insert new permissions
      await knex("up_permissions").insert(permissionsToCreate);
      console.log(`Created ${permissionsToCreate.length} new permissions`);
    } else {
      console.log("No new permissions needed");
    }

    console.log("Permissions setup complete!");
  } catch (error) {
    console.error("Error setting up permissions:", error);
  } finally {
    // Close database connection
    await knex.destroy();
  }
}

// Run the setup
setupPermissions();
