if (
  process.env.NODE_ENV === "production" ||
  window.__excalidraw_env__ === "production"
) {
  module.exports = require("./dist/excalidraw.production.min.js");
} else {
  module.exports = require("./dist/excalidraw.development.js");
}
