export type CommitType = {
  value: string;
  title: string;
  description: string;
};

export const COMMIT_TYPES: CommitType[] = [
  { value: "feat", title: "feat", description: "A new feature" },
  { value: "fix", title: "fix", description: "A bug fix" },
  { value: "docs", title: "docs", description: "Documentation only changes" },
  { value: "refactor", title: "refactor", description: "Code change that neither fixes a bug nor adds a feature" },
  { value: "test", title: "test", description: "Adding or updating tests" },
  { value: "style", title: "style", description: "Changes that do not affect code meaning (formatting, etc.)" },
  { value: "perf", title: "perf", description: "A code change that improves performance" },
  { value: "build", title: "build", description: "Changes that affect the build system or dependencies" },
  { value: "ci", title: "ci", description: "Changes to CI configuration files and scripts" },
  { value: "chore", title: "chore", description: "Other changes that don't modify src or test files" },
  { value: "revert", title: "revert", description: "Reverts a previous commit" },
];

export const COMMIT_TYPE_VALUES = COMMIT_TYPES.map((type) => type.value);
