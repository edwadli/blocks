load("@io_bazel_rules_docker//python:image.bzl", "py_image")

py_image(
    name = "app",
    srcs = ["app.py"],
    deps = [
    	"//env:flask",
    ],
)
