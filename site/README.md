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
├── src/
│   ├── components/         # React components
│   ├── css/               # Custom styles
│   └── pages/             # Custom pages
├── static/                 # Static assets
├── docusaurus.config.ts    # Docusaurus configuration
├── sidebars.ts            # Sidebar navigation
└── vercel.json            # Vercel deployment config
```

## Contributing

See the [Contributing Guide](/docs/contributing.md) for information on how to contribute to the documentation.

## License

This project is licensed under the Apache License 2.0, consistent with the ADL specification license.
