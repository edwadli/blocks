load("@io_bazel_rules_docker//python:image.bzl", "py_image")

py_image(
    name = "debug_backend",
    srcs = ["debug_backend.py"],
    deps = [
    	"//env:flask",
    ],
)
