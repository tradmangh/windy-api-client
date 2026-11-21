## Documentation
- Docs live in `docs/modules/<module>/pages/*.adoc` (AsciiDoc, Antora). Never add `.md` under `docs/modules/`.
- Link pages with `xref:<module>:<page>.adoc[]`, never relative Markdown links.
- Every page starts with `= Title` and `:page-visibility: internal` (or `public` only if it is safe for the internet).
- Add new pages to the module's `nav.adoc`.
