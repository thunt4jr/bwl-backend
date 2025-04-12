"use strict";

/**
 * Staff member controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::staff-member.staff-member",
  ({ strapi }) => ({
    // Find all staff members with optional filtering for featured members
    async find(ctx) {
      // Get query parameters
      const { featured } = ctx.query;

      // If featured parameter is provided, add it to the filters
      if (featured !== undefined) {
        ctx.query.filters = {
          ...(ctx.query.filters || {}),
          featured: featured === "true",
        };
      }

      // Sort by order field and then by name
      ctx.query.sort = ctx.query.sort || "order:asc,name:asc";

      // Call the default find method
      const { data, meta } = await super.find(ctx);

      return { data, meta };
    },

    // Find a specific staff member by slug
    async findBySlug(ctx) {
      const { slug } = ctx.params;

      // Find the staff member
      const entity = await strapi.db
        .query("api::staff-member.staff-member")
        .findOne({
          where: { slug },
          populate: [
            "avatar",
            "education",
            "experience",
            "socialMedia",
            "blog_posts",
            "blog_posts.featuredImage",
            "blog_posts.categories",
          ],
        });

      if (!entity) {
        return ctx.notFound("Staff member not found");
      }

      return this.transformResponse(entity);
    },

    // Get attorney team (filtered by title containing "Attorney" or specific roles)
    async findAttorneys(ctx) {
      const { page = 1, pageSize = 10 } = ctx.query;

      // Find attorneys (staff members with titles containing "Attorney", "Lawyer", "Partner", etc.)
      const attorneys = await strapi.entityService.findMany(
        "api::staff-member.staff-member",
        {
          filters: {
            $or: [
              { title: { $containsi: "attorney" } },
              { title: { $containsi: "lawyer" } },
              { title: { $containsi: "partner" } },
              { title: { $containsi: "counsel" } },
              { title: { $containsi: "associate" } },
            ],
          },
          populate: ["avatar", "socialMedia"],
          sort: ["order:asc", "name:asc"],
          start: (page - 1) * pageSize,
          limit: pageSize,
        }
      );

      // Get total count for pagination
      const count = await strapi.db
        .query("api::staff-member.staff-member")
        .count({
          where: {
            $or: [
              { title: { $containsi: "attorney" } },
              { title: { $containsi: "lawyer" } },
              { title: { $containsi: "partner" } },
              { title: { $containsi: "counsel" } },
              { title: { $containsi: "associate" } },
            ],
          },
        });

      return {
        data: attorneys,
        meta: {
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            pageCount: Math.ceil(count / pageSize),
            total: count,
          },
        },
      };
    },

    // Get staff member's blog posts
    async findBlogPosts(ctx) {
      const { id } = ctx.params;
      const { page = 1, pageSize = 5 } = ctx.query;

      // Find the staff member to verify existence
      const staffMember = await strapi.entityService.findOne(
        "api::staff-member.staff-member",
        id
      );

      if (!staffMember) {
        return ctx.notFound("Staff member not found");
      }

      // Get blog posts by this author
      const blogPostsService = strapi.service("api::blog-post.blog-post");
      return await blogPostsService.findByAuthor(id, { page, pageSize });
    },
  })
);
