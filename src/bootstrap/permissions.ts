// src/bootstrap/permissions.js
export default async ({ strapi }) => {
  // Find the public role in the users-permissions plugin
  const publicRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" } });

  if (!publicRole) {
    console.error("Could not find public role");
    return;
  }

  const allPermissions = await strapi
    .query("plugin::users-permissions.permission")
    .findMany();

  console.log("Existing permissions:");
  console.log(allPermissions.map((p) => p.action));

  // List of content types to make public
  const contentTypes = [
    "api::practice-area.practice-area",
    "api::blog-post.blog-post",
    "api::hero-slide.hero-slide",
    "api::staff-member.staff-member",
    "api::category.category",
  ];

  // Actions to enable for public role
  const actions = ["find", "findOne"];

  // Prepare permission objects for batch creation
  const permissionsToCreate = [];

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
          role: publicRole,
          enabled: true,
        });
      }
    }
  }

  // Create all missing permissions
  if (permissionsToCreate.length > 0) {
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
};
