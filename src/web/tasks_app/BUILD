load("@io_bazel_rules_docker//python:image.bzl", "py_image")
load("@com_google_protobuf//:protobuf.bzl", "py_proto_library")

py_image(
    name = "app",
    srcs = ["app.py"],
    data = glob(["resources/*"]),
    deps = [
      ":task_py_proto",
      ":user_py_proto",
    	"//env:flask",
      "//env:flask-dance",
      "//env:secret_keeper",
    	"//src/utils:proto_utils",
    	"//src/utils:single_pymongo_document",
    ],
)

py_proto_library(
    name = "task_py_proto",
    srcs = ["task.proto"],
)

py_proto_library(
    name = "user_py_proto",
    srcs = ["user.proto"],
)

