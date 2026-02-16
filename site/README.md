# ADL Specification Documentation Site

This is the official documentation site for the Agent Definition Language (ADL) specification. Built with [Docusaurus](https://docusaurus.io/) and deployable to [Vercel](https://vercel.com/).

## Local Development

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

### Installation

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

This starts a local development server at `http://localhost:3000`. Most changes are reflected live without having to restart the server.

Alternatively:

```bash
npm start
```

### Build for Production

```bash
npm run build
```

This generates static content into the `build` directory.

### Preview Production Build

```bash
npm run serve
```

This serves the production build locally for testing before deployment.

## Deployment to Vercel

### Automatic Deployment

1. Connect your repository to Vercel
2. Vercel will automatically detect Docusaurus and configure the build
3. Every push to main will trigger a deployment

### Manual Configuration

The `vercel.json` file is included with the following settings:

- Framework: Docusaurus 2
- Build command: `npm run build`
- Output directory: `build`
- Install command: `npm install`

### Environment Variables

No environment variables are required for basic deployment.

## Project Structure

```
site/
├── docs/                    # Documentation content
│   ├── spec/               # ADL specification sections
│   ├── profiles/           # Profile documentation
│   ├── examples/           # Example documentation
│   └── standardization/    # Standardization roadmap
├── _yaml-sources/           # Version-scoped YAML/JSON sources
│   └── {versionId}/        # e.g., 0.1.0/
│       ├── examples/       # Complete ADL examples
│       └── snippets/       # Code snippets for docs
├── scripts/
│   ├── sync-spec.ts        # Syncs versions/ → _yaml-sources/
│   └── prebuild.ts         # Converts YAML → JSON
├── src/
│   ├── components/         # React components
│   ├── css/               # Custom styles
│   └── pages/             # Custom pages
├── static/                 # Static assets
├── docusaurus.config.ts    # Docusaurus configuration
├── sidebars.ts            # Sidebar navigation
└── vercel.json            # Vercel deployment config
```

## Build Pipeline

The build process has three stages:

```
1. sync-spec    →  Copies YAML from versions/{id}/ to _yaml-sources/{id}/
2. prebuild     →  Converts YAML files to JSON for CodeTabs component
3. docusaurus   →  Builds the static site
```

Run the full build:
```bash
npm run build
```

This executes: `sync-spec` → `prebuild` → `docusaurus build`

## Versioning Workflow

### How Version-Scoped Sources Work

YAML sources are stored under `_yaml-sources/{versionId}/` to enable proper documentation snapshots:

```
_yaml-sources/
├── 0.1.0/                  # v0.1.0 sources (frozen when released)
│   ├── examples/
│   └── snippets/
└── 0.2.0/                  # v0.2.0 sources (next version)
    ├── examples/
    └── snippets/
```

MDX files import from version-specific paths:
```tsx
import yamlContent from '@site/_yaml-sources/0.1.0/snippets/metadata/authors.yaml';
```

When you run `docusaurus docs:version 0.1.0`, the versioned docs keep their imports pointing to `0.1.0/`, so they remain frozen even when `0.2.0` content exists.

### Releasing a New Version

1. **Update manifest.yaml** - Change the version status from `draft` to `released`:
   ```yaml
   versions:
     - id: "0.1.0"
       status: released
       released_at: "2024-03-15"
   ```

2. **Create Docusaurus version snapshot**:
   ```bash
   npm run docusaurus docs:version 0.1.0
   ```

3. **Start working on next version** - Add new version to manifest:
   ```yaml
   next: "0.2.0"
   versions:
     - id: "0.2.0"
       status: draft
     - id: "0.1.0"
       status: released
   ```

4. **Update MDX imports** - Change docs/ imports to use new version path:
   ```tsx
   // Before (0.1.0)
   import yaml from '@site/_yaml-sources/0.1.0/snippets/...';
   // After (0.2.0)
   import yaml from '@site/_yaml-sources/0.2.0/snippets/...';
   ```

5. **Run sync and build**:
   ```bash
   npm run build
   ```

The version dropdown will now show both versions, each with their own frozen content.

## Contributing

See the [Contributing Guide](/docs/contributing.md) for information on how to contribute to the documentation.

## License

This project is licensed under the Apache License 2.0, consistent with the ADL specification license.
