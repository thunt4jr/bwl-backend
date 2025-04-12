"use strict";

/**
 * Staff member router
 */

module.exports = {
  routes: [
    // Standard routes
    {
      method: "GET",
      path: "/staff-members",
      handler: "staff-member.find",
      config: {
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/staff-members/:id",
      handler: "staff-member.findOne",
      config: {
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/staff-members",
      handler: "staff-member.create",
      config: {
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/staff-members/:id",
      handler: "staff-member.update",
      config: {
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/staff-members/:id",
      handler: "staff-member.delete",
      config: {
        middlewares: [],
      },
    },

    // Custom routes
    {
      method: "GET",
      path: "/staff-members/slug/:slug",
      handler: "staff-member.findBySlug",
      config: {
        auth: false,
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/attorneys",
      handler: "staff-member.findAttorneys",
      config: {
        auth: false,
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/staff-members/:id/blog-posts",
      handler: "staff-member.findBlogPosts",
      config: {
        auth: false,
        middlewares: [],
      },
    },
  ],
};
