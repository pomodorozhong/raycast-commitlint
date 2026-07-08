export const COMMIT_RULES = {
  subjectMaxLength: 72,
  headerMaxLength: 100,
  forbiddenSubjectCases: ["sentence-case", "start-case", "pascal-case", "upper-case"] as const,
};

export type ForbiddenSubjectCase = (typeof COMMIT_RULES.forbiddenSubjectCases)[number];
