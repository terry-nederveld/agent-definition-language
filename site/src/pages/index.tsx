import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/spec/introduction">
            Read the Specification
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/examples"
            style={{marginLeft: '1rem'}}>
            View Examples
          </Link>
        </div>
      </div>
    </header>
  );
}

function QuickExample() {
  return (
    <section className={styles.quickExample}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <Heading as="h2">Define AI Agents in JSON</Heading>
            <p>
              ADL provides a standardized way to describe AI agents, their capabilities,
              permissions, and security requirements. Like OpenAPI for REST APIs,
              ADL enables discovery, interoperability, and secure deployment of AI agents.
            </p>
            <Link
              className="button button--primary"
              to="/spec/introduction">
              Learn More
            </Link>
          </div>
          <div className="col col--6">
            <pre className={styles.codeBlock}>
{`{
  "adl": "0.1.0",
  "name": "Research Assistant",
  "description": "Helps find and analyze papers.",
  "version": "1.0.0",
  "tools": [
    {
      "name": "search_papers",
      "description": "Search academic papers"
    }
  ],
  "permissions": {
    "network": {
      "allowed_hosts": ["arxiv.org"]
    }
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Agent Definition Language"
      description="A vendor-neutral specification for describing AI agents">
      <HomepageHeader />
      <main>
        <QuickExample />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
