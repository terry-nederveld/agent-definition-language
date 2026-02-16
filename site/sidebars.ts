import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  specSidebar: [
    {
      type: 'category',
      label: 'ADL Specification 0.1.0',
      collapsed: false,
      items: [
        'spec/introduction',
        'spec/requirements-language',
        'spec/terminology',
        'spec/document-structure',
        'spec/core-members',
        'spec/agent-identity',
        'spec/model-configuration',
        'spec/capabilities',
        'spec/permissions',
        'spec/security',
        'spec/runtime-behavior',
        'spec/metadata',
        'spec/profiles',
        'spec/processing',
        'spec/interoperability',
        'spec/errors',
        'spec/iana-considerations',
        'spec/security-considerations',
        'spec/references',
        'spec/appendix-schema',
        'spec/appendix-examples',
        'spec/appendix-profiles',
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
    {
      type: 'category',
      label: 'Standards Bodies',
      collapsed: false,
      items: [
        'standardization/bodies/linux-foundation',
        'standardization/bodies/ietf',
        'standardization/bodies/iso',
      ],
    },
  ],
};

export default sidebars;
