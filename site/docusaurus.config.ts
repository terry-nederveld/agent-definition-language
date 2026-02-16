import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Agent Definition Language',
  tagline: 'A vendor-neutral specification for describing AI agents',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://adl-spec.org',
  baseUrl: '/',

  organizationName: 'adl-spec',
  projectName: 'agent-definition-language',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/adl-spec/agent-definition-language/tree/main/',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  headTags: [
    // Preconnect to Google Fonts for faster loading
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
    // Open Graph metadata
    {
      tagName: 'meta',
      attributes: {
        property: 'og:type',
        content: 'website',
      },
    },
  ],

  themeConfig: {
    image: 'img/adl-social-card.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    metadata: [
      {name: 'theme-color', content: '#6366f1'},
      {name: 'apple-mobile-web-app-capable', content: 'yes'},
      {name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent'},
    ],
    navbar: {
      title: 'ADL',
      logo: {
        alt: 'ADL Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'specSidebar',
          position: 'left',
          label: 'Specification',
        },
        {
          type: 'docSidebar',
          sidebarId: 'profilesSidebar',
          position: 'left',
          label: 'Profiles',
        },
        {
          type: 'docSidebar',
          sidebarId: 'examplesSidebar',
          position: 'left',
          label: 'Examples',
        },
        {
          type: 'docSidebar',
          sidebarId: 'standardizationSidebar',
          position: 'left',
          label: 'Standardization',
        },
        {
          href: 'https://github.com/adl-spec/agent-definition-language',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Specification',
          items: [
            {
              label: 'ADL 0.1.0 (Draft)',
              to: '/spec/introduction',
            },
            {
              label: 'JSON Schema',
              to: '/spec/appendix-schema',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Profiles',
              to: '/profiles',
            },
            {
              label: 'Examples',
              to: '/examples',
            },
            {
              label: 'Implementations',
              to: '/implementations',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Contributing',
              to: '/contributing',
            },
            {
              label: 'Governance',
              to: '/governance',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/adl-spec/agent-definition-language',
            },
          ],
        },
        {
          title: 'Standardization',
          items: [
            {
              label: 'Roadmap',
              to: '/standardization/roadmap',
            },
            {
              label: 'Linux Foundation',
              to: '/standardization/bodies/linux-foundation',
            },
            {
              label: 'IETF',
              to: '/standardization/bodies/ietf',
            },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} ADL Specification Authors. Licensed under Apache 2.0.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['json', 'yaml', 'bash', 'typescript', 'python'],
      magicComments: [
        {
          className: 'theme-code-block-highlighted-line',
          line: 'highlight-next-line',
          block: {start: 'highlight-start', end: 'highlight-end'},
        },
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
