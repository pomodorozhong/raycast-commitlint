import { Clipboard, LaunchProps, closeMainWindow, showToast, Toast } from "@raycast/api";

import { CommitFormValues, buildHeader, formatCommitMessage, normalizeCommitValues } from "./utils/format-commit";
import { getFailedRuleMessages, hasBlockingErrors, validateCommitRules } from "./utils/validate-commit";

type QuickCommitArguments = {
  type: string;
  scope?: string;
  title: string;
};

export default async function Command(props: LaunchProps<{ arguments: QuickCommitArguments }>) {
  const values: CommitFormValues = normalizeCommitValues({
    type: props.arguments.type,
    scope: props.arguments.scope,
    title: props.arguments.title,
    body: "",
    footer: "",
  });

  const results = validateCommitRules(values);
  if (hasBlockingErrors(results)) {
    const failedRules = getFailedRuleMessages(results).join(", ");
    await showToast({
      style: Toast.Style.Failure,
      title: "Commit message has rule errors",
      message: failedRules,
    });
    throw new Error("Commit message has rule errors");
  }

  const message = formatCommitMessage(values);
  const header = buildHeader(values);
  await Clipboard.copy(message);
  await showToast({
    style: Toast.Style.Success,
    title: "Copied commit message",
    message: header,
  });
  await closeMainWindow();
}
