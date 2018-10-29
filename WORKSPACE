
# Pip dependencies
git_repository(
    name = "io_bazel_rules_python",
    remote = "https://github.com/bazelbuild/rules_python.git",
    commit = "bf4cd137edfd1dfc4d3b05069a8bf1ae1fa165e6",
)
# Only needed for PIP support:
load("@io_bazel_rules_python//python:pip.bzl", "pip_repositories")
pip_repositories()
load("@io_bazel_rules_python//python:pip.bzl", "pip_import")
pip_import(
    name = "pip_deps",
    requirements = "//env:pip_requirements.txt",
)
load("@pip_deps//:requirements.bzl", "pip_install")
pip_install()


# Docker dependencies
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
http_archive(
    name = "io_bazel_rules_docker",
    sha256 = "29d109605e0d6f9c892584f07275b8c9260803bf0c6fcb7de2623b2bedc910bd",
    strip_prefix = "rules_docker-0.5.1",
    urls = ["https://github.com/bazelbuild/rules_docker/archive/v0.5.1.tar.gz"],
)
load(
    "@io_bazel_rules_docker//container:container.bzl",
    "container_pull",
    container_repositories = "repositories",
)
# This is NOT needed when going through the language lang_image
# "repositories" function(s).
container_repositories()
container_pull(
  name = "java_base",
  registry = "gcr.io",
  repository = "distroless/java",
  # 'tag' is also supported, but digest is encouraged for reproducibility.
  digest = "sha256:deadbeef",
)

# Python docker
load(
    "@io_bazel_rules_docker//python:image.bzl",
    _py_image_repos = "repositories",
)
_py_image_repos()
