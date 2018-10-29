
py_binary(
    name = "debug_backend",
    srcs = ["debug_backend.py"],
    deps = [
       "//env:flask",
    ],
)


# Python image for docker.
load("@io_bazel_rules_docker//python:image.bzl", "py_image")

py_image(
    name = "debug_backend_image",
    srcs = ["debug_backend.py"],
    deps = [
    	"//env:flask",
    ],
    main = "debug_backend.py",
)
