// src/api/permission-manager/routes/permission-manager.js
"use strict";

/**
 * Permission manager routes
 * Provides an API endpoint to manually run permission setup if needed
 */

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/permission-manager/setup",
      handler: "permission-manager.setupPermissions",
      config: {
        policies: [
          // Only allow admin users to access this endpoint
          "admin::isAuthenticatedAdmin",
        ],
        description: "Setup permissions for the application",
        tags: ["Admin", "Permissions"],
      },
    },
    {
      method: "GET",
      path: "/permission-manager/status",
      handler: "permission-manager.getPermissionStatus",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
        description: "Get current permission status",
        tags: ["Admin", "Permissions"],
      },
    },
  ],
};
