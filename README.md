# Roarly Marketing Site

Standalone frontend prototype for the public Roarly marketing website.

## Current scope

- Landing page and product positioning
- Workflow, use-case, FAQ, and pricing sections
- Register/login and Subscribe button placeholders
- Black and gold visual system aligned with the app reference

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

## Publish to GitHub

After creating an empty GitHub repository, connect and push this local repository:

```bash
git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-MARKETING-REPO.git
git branch -M main
git push -u origin main
```
