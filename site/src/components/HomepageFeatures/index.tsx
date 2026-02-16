import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
  icon: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Vendor-Neutral',
    icon: '🔓',
    description: (
      <>
        Describe agents without binding to a specific provider or runtime.
        ADL documents are portable across platforms and ecosystems.
      </>
    ),
  },
  {
    title: 'Machine-Readable',
    icon: '🤖',
    description: (
      <>
        Enable tooling for validation, code generation, and orchestration.
        ADL documents are validated against JSON Schema.
      </>
    ),
  },
  {
    title: 'Security-First',
    icon: '🔒',
    description: (
      <>
        Permission boundaries, authentication, and security constraints are
        first-class concepts with deny-by-default permissions.
      </>
    ),
  },
  {
    title: 'Interoperable',
    icon: '🔗',
    description: (
      <>
        Generate A2A Agent Cards, MCP configurations, and integrate with
        OpenAPI specifications. Built to work with existing standards.
      </>
    ),
  },
  {
    title: 'Extensible Profiles',
    icon: '📋',
    description: (
      <>
        Domain-specific profiles for governance, healthcare, financial services,
        and more. Extend ADL without modifying the core spec.
      </>
    ),
  },
  {
    title: 'Standards-Ready',
    icon: '📜',
    description: (
      <>
        Structured for submission to standards bodies including Linux Foundation,
        IETF, and ISO/IEC. Built for long-term stability.
      </>
    ),
  },
];

function Feature({title, description, icon}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <div className={styles.featureIcon}>{icon}</div>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <Heading as="h2">Why ADL?</Heading>
          <p className={styles.subtitle}>
            A standard format for the next generation of AI agents
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
