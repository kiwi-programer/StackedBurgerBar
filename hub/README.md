# Rua Hub integration

The public website remains static HTML, its own stylesheets and original content loaders. No framework conversion or CSS replacement is required.

Six template pages load public/rua-hub.js. It requests only published documents from the configured public Hub API, validates the registry identity and overlays registered text nodes/attributes. Original source content is the fallback when the API or publication is unavailable. Headings with nested spans keep that markup. No private credential belongs in this code.

build-registry.mjs serves the original site locally, renders its original content scripts in Playwright, and exports manifest.json, templates.json and public/rua-bindings.json. It deliberately blocks the Hub delivery script during capture. Run with Node 22 and the Hub dashboard's installed Playwright dependency available. Review generated selectors and validate all bindings after template structure changes. Bump registry/package versions when the schema, bindings or defaults change, then vendor the reviewed package into Hub. Do not silently change an existing registry version.

The editor previews the captured template and original CSS inside an opaque sandbox. Only registered text, image attributes, link destinations and metadata can change. Click-to-select runs in draft preview; full arbitrary HTML/script editing and layout insertion are unavailable for this adapter. Image edits use existing same-origin asset URLs; uploads are not implemented.

The contact/venue workflow remains the site's original mailto behavior. There is no Hub submission storage for this site. Availability and published-content probes are supported; server CPU and deployment-provider logs are unavailable. Maintenance/access restriction is a client-side gate, not a server shutdown.

Deployment: Vercel still serves templates and existing static paths. /rua-registry.json announces stacked-burger-bar@1.0.0. Deploy this bridge before enabling registration in Hub. Registration creates private drafts; an authenticated human administrator publishes them. Public content overlays do not require a rebuild. Source/template changes still require the normal site deployment.

Rollback: revert delivery-script additions while retaining original templates/assets/content and all Hub drafts/revisions. Do not delete the old imported pages.
