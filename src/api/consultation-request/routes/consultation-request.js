"use strict";

/**
 * Consultation request router
 */

module.exports = {
  routes: [
    // Standard routes
    {
      method: "GET",
      path: "/consultation-requests",
      handler: "consultation-request.find",
      config: {
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/consultation-requests/:id",
      handler: "consultation-request.findOne",
      config: {
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/consultation-requests",
      handler: "consultation-request.create",
      config: {
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/consultation-requests/:id",
      handler: "consultation-request.update",
      config: {
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/consultation-requests/:id",
      handler: "consultation-request.delete",
      config: {
        middlewares: [],
      },
    },

    // Custom routes
    {
      method: "PUT",
      path: "/consultation-requests/:id/status",
      handler: "consultation-request.updateStatus",
      config: {
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/consultation-requests/:id/assign",
      handler: "consultation-request.assignAttorney",
      config: {
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/consultation-requests/:id/convert",
      handler: "consultation-request.markAsConverted",
      config: {
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/consultation-requests/stats",
      handler: "consultation-request.getStats",
      config: {
        middlewares: [],
      },
    },
  ],
};
