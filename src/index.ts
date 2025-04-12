// src/index.ts
import permissions from "./bootstrap/permissions";

export default {
  register(/* { strapi } */) {},

  bootstrap({ strapi }) {
    // Run the permissions bootstrap on startup
    permissions({ strapi });
  },
};
