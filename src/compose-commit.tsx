import {
  Action,
  ActionPanel,
  Clipboard,
  Form,
  Icon,
  closeMainWindow,
  pasteText,
  popToRoot,
  showHUD,
  showToast,
  Toast,
} from "@raycast/api";
import { useForm } from "@raycast/utils";
import { useMemo } from "react";

import { COMMIT_TYPES } from "./data/commit-types";
import { COMMIT_RULES } from "./data/commit-rules";
import { buildHeader, CommitFormValues, formatCommitMessage } from "./utils/format-commit";
import {
  formatRulesPanel,
  getFailedRuleMessages,
  hasBlockingErrors,
  validateCommitRules,
} from "./utils/validate-commit";

const DEFAULT_TYPE = "feat";

export default function Command() {
  const { handleSubmit, itemProps, values } = useForm<CommitFormValues>({
    initialValues: {
      type: DEFAULT_TYPE,
      scope: "",
      title: "",
      body: "",
      footer: "",
    },
    validation: {
      type: (value) => {
        const type = value?.toString() ?? "";
        if (!type) {
          return "Select a commit type";
        }
        const results = validateCommitRules({ ...values, type });
        const failed = results.find((result) => result.id.startsWith("type-") && !result.passed);
        return failed?.message;
      },
      scope: (value) => {
        const scope = value?.toString() ?? "";
        if (!scope) {
          return undefined;
        }
        const results = validateCommitRules({ ...values, scope });
        const failed = results.find((result) => result.id === "scope-case" && !result.passed);
        return failed?.message;
      },
      title: (value) => {
        const title = value?.toString() ?? "";
        const results = validateCommitRules({ ...values, title });
        const failed = results.find(
          (result) =>
            ["title-required", "subject-full-stop", "subject-case", "subject-max-length"].includes(result.id) &&
            !result.passed,
        );
        return failed?.message;
      },
    },
    onSubmit: async (formValues) => {
      await submitCommitMessage(formValues, "copy");
    },
  });

  const preview = useMemo(() => {
    if (!values.type || !values.title) {
      return "Fill in type and title to preview the commit message.";
    }

    return formatCommitMessage(values);
  }, [values]);

  const rulesPanel = useMemo(() => formatRulesPanel(validateCommitRules(values)), [values]);

  const titleLength = values.title?.length ?? 0;
  const headerPreview = values.type && values.title ? buildHeader(values) : "";
  const headerLength = headerPreview.length;
  const titleInfo = `${titleLength}/${COMMIT_RULES.subjectMaxLength} characters`;
  const headerInfo = headerPreview ? `Header: ${headerLength}/${COMMIT_RULES.headerMaxLength} characters` : undefined;

  return (
    <Form
      enableDrafts
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Copy Commit Message" icon={Icon.Clipboard} onSubmit={handleSubmit} />
          <Action
            title="Paste Commit Message"
            icon={Icon.Text}
            shortcut={{
              macOS: { modifiers: ["cmd", "shift"], key: "enter" },
              Windows: { modifiers: ["ctrl", "shift"], key: "enter" },
            }}
            onAction={async () => {
              await submitCommitMessage(values, "paste");
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown title="Type" {...itemProps.type}>
        {COMMIT_TYPES.map((type) => (
          <Form.Dropdown.Item key={type.value} value={type.value} title={`${type.title} — ${type.description}`} />
        ))}
      </Form.Dropdown>
      <Form.TextField title="Scope" placeholder="e.g. auth, api" {...itemProps.scope} />
      <Form.TextField
        title="Title"
        placeholder="short imperative summary"
        info={headerInfo ? `${titleInfo} · ${headerInfo}` : titleInfo}
        {...itemProps.title}
      />
      <Form.Separator />
      <Form.TextArea
        title="Body"
        enableMarkdown={false}
        placeholder="Detailed explanation (optional)"
        {...itemProps.body}
      />
      <Form.TextArea
        title="Footer"
        enableMarkdown={false}
        placeholder="BREAKING CHANGE: ... / Closes #123"
        {...itemProps.footer}
      />
      <Form.Separator />
      <Form.Description title="Preview" text={preview} />
      <Form.Description title="Rules" text={rulesPanel} />
    </Form>
  );
}

async function submitCommitMessage(values: CommitFormValues, mode: "copy" | "paste") {
  const results = validateCommitRules(values);

  if (hasBlockingErrors(results)) {
    const failedRules = getFailedRuleMessages(results).join(", ");
    await showToast({
      style: Toast.Style.Failure,
      title: "Commit message has rule errors",
      message: failedRules,
    });
    return;
  }

  const message = formatCommitMessage(values);
  const header = buildHeader(values);

  if (mode === "copy") {
    await Clipboard.copy(message);
    await showToast({
      style: Toast.Style.Success,
      title: "Copied commit message",
      message: header,
    });
  } else {
    await pasteText(message);
    await showHUD(header);
    await popToRoot();
    await closeMainWindow();
  }
}
