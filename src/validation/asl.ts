export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  severity: ValidationSeverity;
  message: string;
  path: string;
  stateName?: string;
}

export interface ValidationResult {
  issues: ValidationIssue[];
}

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string";

const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

const joinPath = (base: string, segment: string) =>
  base ? `${base}.${segment}` : segment;

const addIssue = (
  issues: ValidationIssue[],
  issue: Omit<ValidationIssue, "path"> & { path?: string },
  defaultPath: string,
) => {
  issues.push({ path: issue.path ?? defaultPath, ...issue });
};

const getTransitionsForState = (state: JsonObject): string[] => {
  const transitions: string[] = [];

  const next = state.Next;
  if (isString(next)) transitions.push(next);

  const stateType = state.Type;
  if (stateType === "Choice") {
    const choices = state.Choices;
    if (Array.isArray(choices)) {
      for (const choice of choices) {
        if (isObject(choice) && isString(choice.Next)) transitions.push(choice.Next);
      }
    }
    const defaultTarget = state.Default;
    if (isString(defaultTarget)) transitions.push(defaultTarget);
  }

  if (stateType === "Parallel") {
    const branches = state.Branches;
    if (Array.isArray(branches)) {
      for (const branch of branches) {
        if (!isObject(branch)) continue;
        const branchStartAt = branch.StartAt;
        const branchStates = branch.States;
        if (!isString(branchStartAt) || !isObject(branchStates)) continue;
        transitions.push(branchStartAt);
      }
    }
  }

  if (stateType === "Map") {
    const iterator = state.Iterator;
    if (isObject(iterator) && isString(iterator.StartAt)) {
      transitions.push(iterator.StartAt);
    }
  }

  return transitions;
};

const validateStateMachineScope = (params: {
  issues: ValidationIssue[];
  definition: JsonObject;
  scopePath: string;
  scopeLabel?: string;
}) => {
  const { issues, definition, scopePath } = params;

  const startAt = definition.StartAt;
  const states = definition.States;

  if (!isString(startAt)) {
    addIssue(
      issues,
      {
        severity: "error",
        message: "`StartAt` must be a string.",
      },
      joinPath(scopePath, "StartAt"),
    );
  }

  if (!isObject(states)) {
    addIssue(
      issues,
      {
        severity: "error",
        message: "`States` must be an object.",
      },
      joinPath(scopePath, "States"),
    );
    return;
  }

  const stateNames = new Set(Object.keys(states));

  if (isString(startAt) && !stateNames.has(startAt)) {
    addIssue(
      issues,
      {
        severity: "error",
        message: `StartAt points to a missing state: ${startAt}.`,
      },
      joinPath(scopePath, "StartAt"),
    );
  }

  for (const [stateName, rawState] of Object.entries(states)) {
    const statePath = joinPath(joinPath(scopePath, "States"), stateName);

    if (!isObject(rawState)) {
      addIssue(
        issues,
        {
          severity: "error",
          message: "State definition must be an object.",
          stateName,
        },
        statePath,
      );
      continue;
    }

    const state = rawState;
    const stateType = state.Type;

    if (!isString(stateType) || stateType.trim().length === 0) {
      addIssue(
        issues,
        {
          severity: "error",
          message: "State is missing a valid `Type`.",
          stateName,
        },
        joinPath(statePath, "Type"),
      );
      continue;
    }

    const hasNext = isString(state.Next);
    const hasEnd = isBoolean(state.End) && state.End;

    if (hasNext && hasEnd) {
      addIssue(
        issues,
        {
          severity: "error",
          message: "A state cannot have `Next` and `End: true` at the same time.",
          stateName,
        },
        statePath,
      );
    }

    const isTerminalType = stateType === "Succeed" || stateType === "Fail";

    if (!isTerminalType && !hasNext && !hasEnd && stateType !== "Choice") {
      addIssue(
        issues,
        {
          severity: "error",
          message: "State must have `Next` or `End: true`.",
          stateName,
        },
        statePath,
      );
    }

    if (isTerminalType && (hasNext || isBoolean(state.End))) {
      addIssue(
        issues,
        {
          severity: "warning",
          message: `States of type ${stateType} typically do not use ` + "`Next`/`End`. ",
          stateName,
        },
        statePath,
      );
    }

    if (stateType === "Choice") {
      const choices = state.Choices;
      if (!Array.isArray(choices) || choices.length === 0) {
        addIssue(
          issues,
          {
            severity: "error",
            message: "Choice must have a non-empty `Choices` array.",
            stateName,
          },
          joinPath(statePath, "Choices"),
        );
      } else {
        choices.forEach((choice, idx) => {
          const choicePath = `${joinPath(statePath, "Choices")}[${idx}]`;
          if (!isObject(choice)) {
            addIssue(
              issues,
              {
                severity: "error",
                message: "Each item in `Choices` must be an object.",
                stateName,
              },
              choicePath,
            );
            return;
          }
          if (!isString(choice.Next)) {
            addIssue(
              issues,
              {
                severity: "error",
                message: "Each Choice must have `Next`.",
                stateName,
              },
              joinPath(choicePath, "Next"),
            );
          }
        });
      }

      if (isBoolean(state.End)) {
        addIssue(
          issues,
          {
            severity: "error",
            message: "Choice does not support `End`. ",
            stateName,
          },
          joinPath(statePath, "End"),
        );
      }

      if (hasNext) {
        addIssue(
          issues,
          {
            severity: "error",
            message: "Choice does not support `Next`; use `Default` and `Choices[].Next`.",
            stateName,
          },
          joinPath(statePath, "Next"),
        );
      }
    }

    if (stateType === "Parallel") {
      const branches = state.Branches;
      if (!Array.isArray(branches) || branches.length === 0) {
        addIssue(
          issues,
          {
            severity: "error",
            message: "Parallel must have a non-empty `Branches` array.",
            stateName,
          },
          joinPath(statePath, "Branches"),
        );
      } else {
        branches.forEach((branch, idx) => {
          const branchPath = `${joinPath(statePath, "Branches")}[${idx}]`;
          if (!isObject(branch)) {
            addIssue(
              issues,
              {
                severity: "error",
                message: "Each branch must be an object.",
                stateName,
              },
              branchPath,
            );
            return;
          }
          validateStateMachineScope({
            issues,
            definition: branch,
            scopePath: branchPath,
          });
        });
      }
    }

    if (stateType === "Map") {
      const iterator = state.Iterator;
      if (!isObject(iterator)) {
        addIssue(
          issues,
          {
            severity: "error",
            message: "Map must have an `Iterator` object.",
            stateName,
          },
          joinPath(statePath, "Iterator"),
        );
      } else {
        validateStateMachineScope({
          issues,
          definition: iterator,
          scopePath: joinPath(statePath, "Iterator"),
        });
      }
    }

    if (hasNext && isString(state.Next) && !stateNames.has(state.Next)) {
      addIssue(
        issues,
        {
          severity: "error",
          message: `Next points to a missing state: ${state.Next}.`,
          stateName,
        },
        joinPath(statePath, "Next"),
      );
    }

    if (stateType === "Choice" && isString(state.Default) && !stateNames.has(state.Default)) {
      addIssue(
        issues,
        {
          severity: "error",
          message: `Default points to a missing state: ${state.Default}.`,
          stateName,
        },
        joinPath(statePath, "Default"),
      );
    }

    if (stateType === "Choice" && Array.isArray(state.Choices)) {
      state.Choices.forEach((choice, idx) => {
        if (!isObject(choice) || !isString(choice.Next)) return;
        if (!stateNames.has(choice.Next)) {
          addIssue(
            issues,
            {
              severity: "error",
              message: `Choices[${idx}].Next points to a missing state: ${choice.Next}.`,
              stateName,
            },
            `${joinPath(statePath, "Choices")}[${idx}].Next`,
          );
        }
      });
    }
  }

  if (isString(startAt)) {
    const reachable = new Set<string>();
    const stack: string[] = [startAt];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;
      if (reachable.has(current)) continue;
      reachable.add(current);

      const currentState = states[current];
      if (!isObject(currentState)) continue;

      const nextStates = getTransitionsForState(currentState);
      for (const next of nextStates) {
        if (stateNames.has(next) && !reachable.has(next)) stack.push(next);
      }
    }

    for (const stateName of stateNames) {
      if (!reachable.has(stateName)) {
        addIssue(
          issues,
          {
            severity: "warning",
            message: "State is not reachable from `StartAt`. ",
            stateName,
          },
          joinPath(joinPath(scopePath, "States"), stateName),
        );
      }
    }
  }
};

export const validateAsl = (definition: unknown): ValidationResult => {
  const issues: ValidationIssue[] = [];

  if (!isObject(definition)) {
    addIssue(
      issues,
      {
        severity: "error",
        message: "ASL must be a JSON object.",
      },
      "<root>",
    );
    return { issues };
  }

  validateStateMachineScope({
    issues,
    definition,
    scopePath: "<root>",
  });

  return { issues };
};
