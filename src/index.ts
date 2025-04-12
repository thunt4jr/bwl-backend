export default {
  register({ strapi }) {
    strapi.middlewares[
      "security-headers"
    ] = require("./middlewares/security-headers");
  },
  bootstrap({ strapi }) {
    console.log("Using direct DB script for permissions instead of bootstrap");
  },
};
