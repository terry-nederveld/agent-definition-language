/**
 * Remark plugin: Render profile metadata as a styled badge table.
 *
 * For profile specs (profile.md): reads badge data from profiles/manifest.yaml
 * using the `adl_profile_meta` frontmatter key to identify the profile.
 *
 * For companion specs (governance-record.md) and other pages: falls back to
 * pattern-matching bold text paragraphs starting with **Identifier:** or
 * **Companion to:**.
 *
 * Badge fields: Identifier, Status, ADL Compatibility, Schema, Dependencies.
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse as parseYaml } from 'yaml';
import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Table, TableRow, TableCell, PhrasingContent } from 'mdast';
import type { VFile } from 'vfile';

interface ProfileEntry {
  id: string;
  version: string;
  identifier: string;
  status: string;
  adl_compatibility: string;
  schema: string | null;
  dependencies: string[];
  companion_specs?: { id: string; title: string; source: string }[];
}

interface BadgeField {
  label: string;
  value: PhrasingContent[];
}

// Load manifest once at plugin initialization
let manifestProfiles: ProfileEntry[] | null = null;

function loadManifest(): ProfileEntry[] {
  if (manifestProfiles) return manifestProfiles;

  const manifestPath = path.resolve(__dirname, '..', '..', '..', 'profiles', 'manifest.yaml');
  try {
    const raw = fs.readFileSync(manifestPath, 'utf-8');
    const parsed = parseYaml(raw);
    manifestProfiles = parsed.profiles || [];
  } catch {
    manifestProfiles = [];
  }
  return manifestProfiles!;
}

function findProfile(filePath: string): ProfileEntry | null {
  const match = filePath.match(/profiles\/([^/]+)\/([\d.]+)\/profile\.md$/);
  if (!match) return null;

  const [, profileId, version] = match;
  const profiles = loadManifest();
  return profiles.find(p => p.id === profileId && p.version === version) || null;
}

function makeRow(label: string, valueNodes: PhrasingContent[]): TableRow {
  const labelCell: TableCell = {
    type: 'tableCell',
    children: [
      { type: 'strong', children: [{ type: 'text', value: label }] },
    ],
  };
  const valueCell: TableCell = {
    type: 'tableCell',
    children: valueNodes.length > 0 ? valueNodes : [{ type: 'text', value: '' }],
  };
  return { type: 'tableRow', children: [labelCell, valueCell] };
}

function makeBadgeTable(rows: TableRow[]): [any, Table, any] {
  const headerRow: TableRow = {
    type: 'tableRow',
    children: [
      { type: 'tableCell', children: [{ type: 'text', value: '' }] },
      { type: 'tableCell', children: [{ type: 'text', value: '' }] },
    ],
  };

  const table: Table = {
    type: 'table',
    align: [null, null],
    children: [headerRow, ...rows],
  };

  return [
    { type: 'html', value: '<div class="profile-badge">' },
    table,
    { type: 'html', value: '</div>' },
  ];
}

function buildManifestBadge(profile: ProfileEntry): any[] {
  const rows: TableRow[] = [
    makeRow('Identifier', [{ type: 'inlineCode', value: profile.identifier }]),
    makeRow('Status', [{ type: 'text', value: profile.status.charAt(0).toUpperCase() + profile.status.slice(1) }]),
    makeRow('ADL Compatibility', [{ type: 'text', value: profile.adl_compatibility }]),
  ];

  if (profile.schema) {
    rows.push(makeRow('Schema', [{ type: 'inlineCode', value: profile.schema }]));
  }

  const deps = profile.dependencies?.length
    ? profile.dependencies.join(', ')
    : 'None';
  rows.push(makeRow('Dependencies', [{ type: 'text', value: deps }]));

  return makeBadgeTable(rows);
}

// Fallback: extract badge fields from pattern-matched bold text paragraphs
function extractBadgeFields(node: Paragraph): BadgeField[] | null {
  const fields: BadgeField[] = [];
  let currentLabel: string | null = null;
  let currentValue: PhrasingContent[] = [];

  for (const child of node.children) {
    if (child.type === 'strong' && child.children?.[0]?.type === 'text') {
      if (currentLabel) {
        fields.push({ label: currentLabel, value: currentValue });
      }
      currentLabel = child.children[0].value;
      currentValue = [];
    } else if (currentLabel) {
      if (child.type === 'text') {
        const cleaned = child.value.replace(/^\s+/, '').replace(/\n$/, '').trim();
        if (cleaned) {
          currentValue.push({ type: 'text', value: cleaned });
        }
      } else {
        currentValue.push(child);
      }
    }
  }

  if (currentLabel) {
    fields.push({ label: currentLabel, value: currentValue });
  }

  return fields.length >= 3 ? fields : null;
}

export default function remarkProfileBadge() {
  return (tree: Root, file: VFile) => {
    const filePath = file.path || file.history?.[0] || '';
    const profile = findProfile(filePath);
    const replacements: Map<number, any[]> = new Map();

    visit(tree, 'paragraph', (node: Paragraph, index: number | undefined, parent) => {
      if (index === undefined || !parent) return;

      const firstChild = node.children[0];
      if (firstChild?.type !== 'strong') return;
      const strongText = firstChild.children?.[0];
      if (strongText?.type !== 'text') return;

      // For profile specs with manifest data: replace the Identifier paragraph
      // with manifest-driven badge (single source of truth)
      if (profile && strongText.value === 'Identifier:') {
        replacements.set(index, buildManifestBadge(profile));
        return;
      }

      // Fallback: pattern-match for companion specs and non-manifest pages
      const BADGE_STARTS = ['Identifier:', 'Companion to:'];
      if (!BADGE_STARTS.includes(strongText.value)) return;

      const fields = extractBadgeFields(node);
      if (!fields) return;

      const labelMap = new Map(fields.map(f => [f.label, f.value]));
      const status = labelMap.get('Status:');
      const compat = labelMap.get('ADL Compatibility:');
      if (!status || !compat) return;

      const rows: TableRow[] = [];
      for (const field of fields) {
        const label = field.label.replace(/:$/, '');
        rows.push(makeRow(label, field.value));
      }

      replacements.set(index, makeBadgeTable(rows));
    });

    // Apply in reverse order
    for (const [idx, nodes] of [...replacements.entries()].sort((a, b) => b[0] - a[0])) {
      tree.children.splice(idx, 1, ...nodes);
    }
  };
}
