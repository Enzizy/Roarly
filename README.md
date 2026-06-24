# Roarly Marketing Site

Standalone frontend prototype for the public Roarly marketing website.

## Current scope

- Landing page and product positioning
- Workflow, use-case, FAQ, and pricing sections
- Register/login and Subscribe button placeholders
- White and gold visual system aligned with the current app direction

## Run locally

Open `index.html` in a browser. No build tooling is required for the current prototype.

## Later integration

This is intentionally separate from the Laravel web app for now. When the products are connected, this design will be migrated into Laravel + Vue + Inertia public pages.

The integration boundary is:

```text
Website pricing UI -> sign in/register -> hosted payment checkout
-> payment webhook in web app -> subscription and credits available in dashboard
```

The marketing site must not grant subscription access based only on a browser redirect. The authenticated web app will own checkout creation, payment-webhook verification, subscriptions, and credits.

## Publishing

The repository is published at `https://github.com/Enzizy/Roarly`. GitHub Pages deployment is defined in `.github/workflows/deploy-pages.yml`.
