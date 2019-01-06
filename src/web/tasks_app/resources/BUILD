load("@org_dropbox_rules_node//node:defs.bzl", "webpack_build")

package(default_visibility = ["//src/web/tasks_app:__subpackages__"])

webpack_build(
    name = "bundle_jsx",
    srcs = [
      "index_body.jsx",
    ],
    outs = ["bundle.jsx"],
    config = "webpack.config.js",
    deps = [
        '@org_dropbox_rules_node//node/dbx-bazel-utils',
    ],
)

exports_files([
  "index.html",
  "index.css",
  "navbar.jsx",
])
