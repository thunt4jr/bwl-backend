"use strict";

/**
 * Contact router
 */

module.exports = {
  routes: [
    // Standard routes
    {
      method: "GET",
      path: "/contacts",
      handler: "contact.find",
      config: {
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/contacts/:id",
      handler: "contact.findOne",
      config: {
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/contacts",
      handler: "contact.create",
      config: {
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/contacts/:id",
      handler: "contact.update",
      config: {
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/contacts/:id",
      handler: "contact.delete",
      config: {
        middlewares: [],
      },
    },

    // Custom routes
    {
      method: "PUT",
      path: "/contacts/:id/status",
      handler: "contact.updateStatus",
      config: {
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/contacts/:id/assign",
      handler: "contact.assignContact",
      config: {
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/contacts/date-range",
      handler: "contact.findByDateRange",
      config: {
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/contacts/stats",
      handler: "contact.getStats",
      config: {
        middlewares: [],
      },
    },
  ],
};
