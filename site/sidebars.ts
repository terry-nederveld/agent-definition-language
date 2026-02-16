import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  specSidebar: [
    {
      type: 'category',
      label: 'Specification v0.1.0',
      collapsed: false,
      collapsible: false,
      link: {
        type: 'doc',
        id: 'spec/introduction',
      },
      items: [
        {
          type: 'category',
          label: 'Fundamentals',
          collapsed: false,
          items: [
            'spec/requirements-language',
            'spec/terminology',
            'spec/document-structure',
            'spec/core-members',
          ],
        },
        {
          type: 'category',
          label: 'Agent Configuration',
          collapsed: false,
          items: [
            'spec/agent-identity',
            'spec/model-configuration',
            'spec/capabilities',
          ],
        },
        {
          type: 'category',
          label: 'Security & Permissions',
          collapsed: false,
          items: [
            'spec/permissions',
            'spec/security',
          ],
        },
        {
          type: 'category',
          label: 'Runtime & Metadata',
          collapsed: true,
          items: [
            'spec/runtime-behavior',
            'spec/metadata',
            'spec/profiles',
          ],
        },
        {
          type: 'category',
          label: 'Implementation',
          collapsed: true,
          items: [
            'spec/processing',
            'spec/interoperability',
            'spec/errors',
          ],
        },
        {
          type: 'category',
          label: 'Formal Sections',
          collapsed: true,
          items: [
            'spec/iana-considerations',
            'spec/security-considerations',
            'spec/references',
          ],
        },
        {
          type: 'category',
          label: 'Appendices',
          collapsed: true,
          items: [
            'spec/appendix-schema',
            'spec/appendix-examples',
            'spec/appendix-profiles',
          ],
        },
      ],
    },
  ],
  profilesSidebar: [
    'profiles/index',
    {
      type: 'category',
      label: 'Governance Profile',
      collapsed: false,
      items: [
        'profiles/governance/overview',
        'profiles/governance/specification',
      ],
    },
    {
      type: 'category',
      label: 'Healthcare Profile',
      collapsed: true,
      items: [
        'profiles/healthcare/overview',
      ],
    },
    {
      type: 'category',
      label: 'Financial Profile',
      collapsed: true,
      items: [
        'profiles/financial/overview',
      ],
    },
  ],
  examplesSidebar: [
    'examples/index',
    'examples/minimal',
    'examples/with-tools',
    'examples/production',
  ],
  standardizationSidebar: [
    'standardization/roadmap',
  ],
};

export default sidebars;
