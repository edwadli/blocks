package(default_visibility = ["//:__subpackages__"])

# Python targets using pip.
load(
  "@io_bazel_rules_python//python:python.bzl",
  "py_binary", "py_library", "py_test",
)
load("@pip_deps//:requirements.bzl", "requirement")

py_library(
    name = "absl",
    deps = [
        requirement("absl-py"),
    ],
)

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
    name = "flask-dance",
    deps = [
        requirement("flask-dance"),
        requirement("lazy"),
        requirement("requests-oauthlib"),
        requirement("oauthlib"),
        requirement("requests"),
        requirement("urllib3"),
        requirement("chardet"),
        requirement("certifi"),
        requirement("idna"),
        requirement("six"),
        requirement("URLObject"),
    ]
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

py_library(
    name = "secret_keeper",
    srcs = ["secret_keeper.py"],
    deps = [
        ":pymongo_env",
    ],
)

py_binary(
    name = "write_secret",
    srcs = ["write_secret.py"],
    deps = [
        ":secret_keeper",
        ":absl",
    ]
)
