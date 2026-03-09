import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'doc',
      id: 'specification',
      label: 'Specification',
    },
    {
      type: 'link',
      label: 'Profiles',
      href: '/profiles',
    },
    {
      type: 'category',
      label: 'Examples',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'examples/index',
      },
      items: [
        'examples/minimal',
        'examples/with-tools',
        'examples/production',
      ],
    },
    {
      type: 'doc',
      id: 'standardization/roadmap',
      label: 'Standardization',
    },
    {
      type: 'doc',
      id: 'implementations',
      label: 'Implementations',
    },
  ],
};

export default sidebars;
