import React, { useMemo } from "react";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";
import { parse as parseYaml } from "yaml";

interface CodeTabsProps {
  /** YAML source code to display */
  yaml: string;
  /** Optional title for the code block */
  title?: string;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
}

/**
 * CodeTabs component displays YAML with auto-generated JSON in tabs.
 *
 * Usage in MDX:
 * ```mdx
 * import CodeTabs from '@site/src/components/CodeTabs';
 * import yamlContent from '@site/_yaml-sources/examples/production.yaml';
 *
 * <CodeTabs yaml={yamlContent} title="production.adl" />
 * ```
 *
 * Or with inline YAML (for simple, flat structures):
 * ```mdx
 * <CodeTabs yaml={`
 * name: example
 * version: "1.0.0"
 * `} />
 * ```
 */
export default function CodeTabs({
  yaml: yamlSource,
  title,
  showLineNumbers = false,
}: CodeTabsProps): React.ReactElement {
  const trimmedYaml = yamlSource.trim();

  const json = useMemo(() => {
    try {
      const data = parseYaml(trimmedYaml);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Failed to parse YAML:", error);
      return `// Error parsing YAML: ${error instanceof Error ? error.message : String(error)}`;
    }
  }, [trimmedYaml]);

  const yamlTitle = title ? `${title}.yaml` : undefined;
  const jsonTitle = title ? `${title}.json` : undefined;

  return (
    <Tabs groupId="code-format" defaultValue="yaml">
      <TabItem value="yaml" label="YAML">
        <CodeBlock
          language="yaml"
          title={yamlTitle}
          showLineNumbers={showLineNumbers}
        >
          {trimmedYaml}
        </CodeBlock>
      </TabItem>
      <TabItem value="json" label="JSON">
        <CodeBlock
          language="json"
          title={jsonTitle}
          showLineNumbers={showLineNumbers}
        >
          {json}
        </CodeBlock>
      </TabItem>
    </Tabs>
  );
}
