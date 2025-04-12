"use strict";

/**
 * Practice area router
 */

module.exports = {
  routes: [
    // Standard routes
    {
      method: "GET",
      path: "/practice-areas",
      handler: "practice-area.find",
      config: {
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/practice-areas/:id",
      handler: "practice-area.findOne",
      config: {
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/practice-areas",
      handler: "practice-area.create",
      config: {
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/practice-areas/:id",
      handler: "practice-area.update",
      config: {
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/practice-areas/:id",
      handler: "practice-area.delete",
      config: {
        middlewares: [],
      },
    },

    // Custom routes
    {
      method: "GET",
      path: "/practice-areas/count",
      handler: "practice-area.count",
      config: {
        auth: false,
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/practice-areas/homepage",
      handler: "practice-area.findForHomepage",
      config: {
        auth: false,
        middlewares: [],
      },
    },
  ],
};
