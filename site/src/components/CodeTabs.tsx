import React from "react";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";
import { parse, stringify } from 'yaml';

interface CodeTabsProps {
  /** YAML source code to display (primary when provided) */
  yaml?: string;
  /** JSON source; derived from YAML when omitted, or primary when yaml is omitted */
  json?: string | object;
  /** Optional title for the code block */
  title?: string;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
}

/**
 * CodeTabs component displays YAML and JSON in tabs.
 *
 * - When only `yaml` is provided, JSON is derived from YAML.
 * - When only `json` is provided, YAML is derived from JSON.
 * - When both are provided, both are used as-is.
 */
export default function CodeTabs({
  yaml: yamlSource,
  json: jsonSource,
  title,
  showLineNumbers = false,
}: CodeTabsProps): React.ReactElement {
  let trimmedYaml: string;
  let trimmedJson: string;

  if (yamlSource != null) {
    trimmedYaml = yamlSource.trim();
    if (jsonSource != null) {
      trimmedJson = typeof jsonSource === 'string'
        ? jsonSource.trim()
        : JSON.stringify(jsonSource, null, 2);
    } else {
      trimmedJson = JSON.stringify(parse(trimmedYaml), null, 2);
    }
  } else if (jsonSource != null) {
    const parsed = typeof jsonSource === 'string'
      ? JSON.parse(jsonSource)
      : jsonSource;
    trimmedJson = typeof jsonSource === 'string'
      ? jsonSource.trim()
      : JSON.stringify(parsed, null, 2);
    trimmedYaml = stringify(parsed, { lineWidth: 120 }).trim();
  } else {
    trimmedYaml = '';
    trimmedJson = '';
  }

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
          {trimmedJson}
        </CodeBlock>
      </TabItem>
    </Tabs>
  );
}
