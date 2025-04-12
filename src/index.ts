// src/index.ts (simplified)
export default {
  register(/* { strapi } */) {},
  bootstrap({ strapi }) {
    console.log("Using direct DB script for permissions instead of bootstrap");
  },
};
