import permissions from "./bootstrap/permissions";

export default {
  register(/* { strapi } */) {},

  bootstrap({ strapi }) {
    permissions({ strapi });
  },
};
