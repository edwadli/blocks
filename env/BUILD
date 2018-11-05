package(default_visibility = ["//:__subpackages__"])

# Python targets using pip.
load(
  "@io_bazel_rules_python//python:python.bzl",
  "py_binary", "py_library", "py_test",
)
load("@pip_deps//:requirements.bzl", "requirement")

py_library(
	name = "flask",
	deps = [
       requirement("flask"),
       requirement("werkzeug"),
       requirement("jinja2"),
       requirement("click"),
       requirement("itsdangerous"),
       requirement("markupsafe"),
    ],
)

py_library(
    name = "pymongo",
    deps = [
        requirement("pymongo"),
    ],
)

py_library(
    name = "pymongo_env",
    srcs = ["pymongo_env.py"],
    deps = [
        ":pymongo",
    ],
)
