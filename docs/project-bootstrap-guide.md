# Project Bootstrap Guide

Use this guide when starting a new project from this template.

## Step 1 — Create repo from template

On GitHub:
- Click "Use this template"
- Give your new repo a name
- Clone it locally

## Step 2 — Activate rules in Copilot

Open the project in VS Code and send this message to Copilot Chat:

```
Use the repository rules automatically from now on.
Preserve the central architecture:
- backend only provides services
- frontend only consumes backend services
- UI must follow the central standard
- React/Next.js and Angular must follow the same UI philosophy
- avoid unnecessary dependencies
Start by analyzing the repository structure and follow the instructions files.
```

## Step 3 — Build shared UI components first

Before building any feature screens, generate shared components:

```
Create shared UI components according to repository rules:
PageContainer, PageHeader, FilterPanel, SummaryCard, FormSection,
DataTable, ActionBar, ConfirmDialog, EmptyState, ErrorState, LoadingState.
Keep the project lightweight.
```

## Step 4 — Build features on top of shared components

Every feature screen must:
- Import from shared components
- Support loading, empty, error, and responsive states
- Call backend through a service layer — never directly

## Step 5 — Backend structure

Backend must follow:
- Controllers: routing only, thin
- Services: business logic
- Repositories / data access: persistence
- DTOs: clean request/response models

## Step 6 — Review with UI Guardian agent

Use the `UI Guardian` agent in Copilot to review any new screen for consistency.

## Step 7 — Configure environment variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Never commit `.env` to git. Add `RAILWAY_TOKEN` to GitHub repository secrets for CI/CD.

## Step 8 — Set up GitHub branch protection

On GitHub → Settings → Branches → Add rule for `master`:
- Require a pull request before merging
- Require status checks to pass (PR Validation workflow)
- Do not allow direct pushes to master
