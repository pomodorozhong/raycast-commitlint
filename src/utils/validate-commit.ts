import { COMMIT_RULES } from "../data/commit-rules";
import { COMMIT_TYPE_VALUES } from "../data/commit-types";
import { buildHeader, CommitFormValues, normalizeCommitValues } from "./format-commit";

export type RuleSeverity = "error" | "warning" | "info";

export type RuleResult = {
  id: string;
  label: string;
  passed: boolean;
  severity: RuleSeverity;
  message: string;
};

const ACRONYM_PATTERN = /^[A-Z0-9]{2,}$/;

function isLowercase(value: string): boolean {
  return value === value.toLowerCase();
}

function detectSubjectCase(title: string): string | null {
  if (!title) {
    return null;
  }

  if (title === title.toUpperCase() && /[A-Z]/.test(title)) {
    return "upper-case";
  }

  if (/^[A-Z][a-z]+(?:[A-Z][a-z]+)+$/.test(title.replace(/[^A-Za-z]/g, ""))) {
    return "pascal-case";
  }

  if (/^[A-Z][a-z]/.test(title)) {
    return "start-case";
  }

  if (/^[A-Z]/.test(title)) {
    return "sentence-case";
  }

  const words = title.split(/\s+/).filter(Boolean);
  for (const word of words) {
    const cleaned = word.replace(/[^A-Za-z0-9]/g, "");
    if (!cleaned) {
      continue;
    }

    if (ACRONYM_PATTERN.test(cleaned)) {
      continue;
    }

    if (/^[A-Z]/.test(cleaned)) {
      return "start-case";
    }
  }

  return null;
}

function getSubjectCaseMessage(detectedCase: string): string {
  switch (detectedCase) {
    case "sentence-case":
      return 'Title should use imperative lowercase (e.g. "add login form", not "Add login form")';
    case "start-case":
      return "Title should not use Start Case words";
    case "pascal-case":
      return "Title should not use PascalCase";
    case "upper-case":
      return "Title should not be ALL CAPS";
    default:
      return "Title should use imperative lowercase";
  }
}

function createRule(id: string, label: string, passed: boolean, severity: RuleSeverity, message: string): RuleResult {
  return { id, label, passed, severity, message };
}

export function validateCommitRules(values: CommitFormValues): RuleResult[] {
  const normalized = normalizeCommitValues(values);
  const results: RuleResult[] = [];

  const typeRequiredPassed = Boolean(normalized.type);
  results.push(
    createRule(
      "type-required",
      "Type is selected",
      typeRequiredPassed,
      "error",
      typeRequiredPassed ? normalized.type : "Select a commit type",
    ),
  );

  const typeEnumPassed = !normalized.type || COMMIT_TYPE_VALUES.includes(normalized.type);
  results.push(
    createRule(
      "type-enum",
      "Type is allowed",
      typeEnumPassed,
      "error",
      typeEnumPassed ? normalized.type || "—" : `"${normalized.type}" is not a conventional type`,
    ),
  );

  const typeCasePassed = !normalized.type || isLowercase(normalized.type);
  results.push(
    createRule(
      "type-case",
      "Type is lowercase",
      typeCasePassed,
      "error",
      typeCasePassed ? normalized.type || "—" : "Type must be lowercase",
    ),
  );

  const scopeCasePassed = !normalized.scope || isLowercase(normalized.scope);
  results.push(
    createRule(
      "scope-case",
      "Scope is lowercase",
      scopeCasePassed,
      "error",
      scopeCasePassed ? normalized.scope || "optional" : "Scope must be lowercase",
    ),
  );

  const titleRequiredPassed = Boolean(normalized.title);
  results.push(
    createRule(
      "title-required",
      "Title is provided",
      titleRequiredPassed,
      "error",
      titleRequiredPassed ? "provided" : "Title is required",
    ),
  );

  const fullStopPassed = !normalized.title || !normalized.title.endsWith(".");
  results.push(
    createRule(
      "subject-full-stop",
      "Title has no trailing period",
      fullStopPassed,
      "error",
      fullStopPassed ? "no trailing period" : "Title must not end with a period",
    ),
  );

  const detectedCase = normalized.title ? detectSubjectCase(normalized.title) : null;
  const forbiddenCases = COMMIT_RULES.forbiddenSubjectCases as readonly string[];
  const subjectCasePassed = !detectedCase || !forbiddenCases.includes(detectedCase);
  results.push(
    createRule(
      "subject-case",
      "Title uses imperative lowercase",
      subjectCasePassed,
      "error",
      subjectCasePassed
        ? "lowercase"
        : detectedCase
          ? getSubjectCaseMessage(detectedCase)
          : "Title should use imperative lowercase",
    ),
  );

  const titleLength = normalized.title.length;
  const subjectLengthPassed = titleLength <= COMMIT_RULES.subjectMaxLength;
  results.push(
    createRule(
      "subject-max-length",
      "Title length within limit",
      subjectLengthPassed,
      "error",
      `${titleLength}/${COMMIT_RULES.subjectMaxLength} characters`,
    ),
  );

  const header = normalized.type && normalized.title ? buildHeader(normalized) : "";
  const headerLength = header.length;
  const headerLengthPassed = !header || headerLength <= COMMIT_RULES.headerMaxLength;
  results.push(
    createRule(
      "header-max-length",
      "Header length within limit",
      headerLengthPassed,
      "error",
      header ? `${headerLength}/${COMMIT_RULES.headerMaxLength} characters` : "—",
    ),
  );

  results.push(
    createRule(
      "body-leading-blank",
      "Body separated from header",
      true,
      "info",
      normalized.body ? "blank line added automatically" : "no body",
    ),
  );

  results.push(
    createRule(
      "footer-leading-blank",
      "Footer separated from body",
      true,
      "info",
      normalized.footer ? "blank line added automatically" : "no footer",
    ),
  );

  return results;
}

export function hasBlockingErrors(results: RuleResult[]): boolean {
  return results.some((result) => !result.passed && result.severity === "error");
}

export function formatRulesPanel(results: RuleResult[]): string {
  return results
    .map((result) => {
      const icon = result.passed ? "✓" : "✗";
      return `${icon} ${result.label} — ${result.message}`;
    })
    .join("\n");
}

export function getFieldValidationError(field: keyof CommitFormValues, values: CommitFormValues): string | undefined {
  const results = validateCommitRules(values);
  const fieldRuleMap: Record<keyof CommitFormValues, string[]> = {
    type: ["type-required", "type-enum", "type-case"],
    scope: ["scope-case"],
    title: ["title-required", "subject-full-stop", "subject-case", "subject-max-length"],
    body: [],
    footer: [],
  };

  const failedRule = results.find(
    (result) => fieldRuleMap[field].includes(result.id) && !result.passed && result.severity === "error",
  );

  return failedRule?.message;
}

export function getFailedRuleMessages(results: RuleResult[]): string[] {
  return results.filter((result) => !result.passed && result.severity === "error").map((result) => result.label);
}
