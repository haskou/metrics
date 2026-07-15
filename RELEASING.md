# Releasing

CI publishes npm versions from pull requests merged into `main` or `master`.
The source branch controls the semantic version bump:

| Branch prefix | Version bump |
| ------------- | ------------ |
| `fix/*`       | Patch        |
| `feat/*`      | Minor        |
| `break/*`     | Major        |

Renovate runtime-dependency pull requests whose title starts with `fix:` or
`fix(...):` publish a patch. Other branches run validation without publishing.

Publishing uses npm trusted publishing, records the resulting version in
`package.json`, creates a `vX.Y.Z` tag, and generates GitHub release notes.
