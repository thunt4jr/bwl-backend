"use strict";

/**
 * Blog post router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::blog-post.blog-post", {
  config: {
    find: {
      middlewares: [],
    },
    findOne: {
      middlewares: [],
    },
  },
});

// Export additional custom routes
module.exports = {
  routes: [
    // Standard routes that Strapi creates
    {
      method: "GET",
      path: "/blog-posts",
      handler: "blog-post.find",
      config: {
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/blog-posts/:id",
      handler: "blog-post.findOne",
      config: {
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/blog-posts",
      handler: "blog-post.create",
      config: {
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/blog-posts/:id",
      handler: "blog-post.update",
      config: {
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/blog-posts/:id",
      handler: "blog-post.delete",
      config: {
        middlewares: [],
      },
    },

    // Custom routes
    {
      method: "GET",
      path: "/blog-posts/:id/related",
      handler: "blog-post.findRelated",
      config: {
        auth: false,
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/blog-posts/category/:slug",
      handler: "blog-post.findByCategory",
      config: {
        auth: false,
        middlewares: [],
      },
    },
  ],
};
