# Protobuf dependencies for py_proto_library().
git_repository(
    name = "com_google_protobuf",
    remote = "https://github.com/protocolbuffers/protobuf.git",
    commit = "ebfc0432c1e4b0b7202ebb00642dcfc2a13094be",
)
git_repository(
    name = "bazel_skylib",
    remote = "https://github.com/bazelbuild/bazel-skylib.git",
    tag = "0.6.0",
)
load("//env:protobuf.bzl", "check_protobuf_required_bazel_version")
check_protobuf_required_bazel_version()

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
# The patch_cmds workaround is needed for compatibility with protobuf.
# See: https://github.com/bazelbuild/rules_docker/issues/367
new_http_archive(
    name = "six_archive",
    build_file = "@com_google_protobuf//:six.BUILD",
    sha256 = "105f8d68616f8248e24bf0e9372ef04d3cc10104f1980f54d57b2ce73a5ad56a",
    url = "https://pypi.python.org/packages/source/s/six/six-1.10.0.tar.gz#md5=34eed507548117b2ab523ab14b2f8b55",
)
bind(
    name = "six",
    actual = "@six_archive//:six",
)
# Depending on your version of sed, you need either -i '' or just -i.
SEDI_CMD = (
  'sedi () {\n' +
  'sed --version >/dev/null 2>&1 && sed -i "$@" || sed -i "" "$@"\n' +
  '}\n')
SED_CMD = SEDI_CMD + "sedi " + " ".join(["-e '%s'" % e for e in [
    's~name = "six"~name = "six_hacked"~',
    's~"@six//:six"~"@six_hacked//:six_hacked"~',
    's~\"@six\"~\"@six_hacked\"~',
    's~if "six" not in excludes~if "six_hacked" not in excludes~',]])
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
http_archive(
    name = "containerregistry",
    url = "https://github.com/google/containerregistry/archive/v0.0.25.tar.gz",
    sha256 = "64886684c60bb6f19f73b0e802cdbbf051d10c3803cd11e9ab06d7da8d011ce4",
    strip_prefix = "containerregistry-0.0.25",
    patch_cmds = [SED_CMD + " def.bzl BUILD.bazel"],
)
http_archive(
    name = "io_bazel_rules_docker",
    sha256 = "29d109605e0d6f9c892584f07275b8c9260803bf0c6fcb7de2623b2bedc910bd",
    strip_prefix = "rules_docker-0.5.1",
    urls = ["https://github.com/bazelbuild/rules_docker/archive/v0.5.1.tar.gz"],
    patch_cmds = [SED_CMD + " container/container.bzl"],
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
