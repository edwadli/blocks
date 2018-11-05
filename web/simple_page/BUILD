load("@io_bazel_rules_docker//python:image.bzl", "py_image")

py_image(
    name = "app",
    srcs = ["app.py"],
    data = [
        "resources/index.html",
        "resources/index.js",
    ],
    deps = [
    	"//env:flask",
    	"//utils:simple_pymongo_counter",
    ],
)
