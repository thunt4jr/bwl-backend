"use strict";

/**
 * Category router
 */

module.exports = {
  routes: [
    // Standard routes
    {
      method: "GET",
      path: "/categories",
      handler: "category.find",
      config: {
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/categories/:id",
      handler: "category.findOne",
      config: {
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/categories",
      handler: "category.create",
      config: {
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/categories/:id",
      handler: "category.update",
      config: {
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/categories/:id",
      handler: "category.delete",
      config: {
        middlewares: [],
      },
    },

    // Custom routes
    {
      method: "GET",
      path: "/categories/slug/:slug",
      handler: "category.findBySlug",
      config: {
        auth: false,
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/categories/menu",
      handler: "category.getMenuCategories",
      config: {
        auth: false,
        middlewares: [],
      },
    },
  ],
};
