export type CommitFormValues = {
  type: string;
  scope?: string;
  title: string;
  body?: string;
  footer?: string;
};

function trimField(value?: string): string {
  return value?.trim() ?? "";
}

export function normalizeCommitValues(values: CommitFormValues): CommitFormValues {
  return {
    type: trimField(values.type),
    scope: trimField(values.scope),
    title: trimField(values.title),
    body: trimField(values.body),
    footer: trimField(values.footer),
  };
}

export function buildHeader(values: CommitFormValues): string {
  const normalized = normalizeCommitValues(values);
  const scope = normalized.scope ? `(${normalized.scope})` : "";

  return `${normalized.type}${scope}: ${normalized.title}`;
}

export function formatCommitMessage(values: CommitFormValues): string {
  const normalized = normalizeCommitValues(values);
  const parts = [buildHeader(normalized)];

  if (normalized.body) {
    parts.push(normalized.body);
  }

  if (normalized.footer) {
    parts.push(normalized.footer);
  }

  return parts.join("\n\n");
}
