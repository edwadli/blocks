package(default_visibility = ["//:__subpackages__"])

py_library(
    name = "simple_pymongo_counter",
    srcs = ["simple_pymongo_counter.py"],
    deps = [
        ":single_pymongo_document",
    ],
)

py_library(
    name = "single_pymongo_document",
    srcs = ["single_pymongo_document.py"],
    deps = [
        "//env:pymongo_env",
    ],
)

py_library(
  name = "proto_utils",
  srcs = ["proto_utils.py"],
  deps = [],
)

py_library(
  name = "pymongo_utils",
  srcs = ["pymongo_utils.py"],
  deps = [
    ":proto_utils",
  ],
)