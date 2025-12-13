import { create } from "zustand";
import type { WorkflowViewerProps } from "asl-viewer";
import { validateAsl, type ValidationResult } from "../validation/asl";
import { persist } from "zustand/middleware";

interface ViewSettings extends WorkflowViewerProps {
  showMinimap: boolean;
  showControls: boolean;
  graphTheme: WorkflowViewerProps["theme"];
}

interface State {
  aslDefinition: object;
  aslText: string;
  parseError: string | null;
  validation: ValidationResult;
  canUndo: boolean;
  canRedo: boolean;
  viewSettings: ViewSettings;
  setAslDefinition: (definition: object) => void;
  setAslText: (text: string) => void;
  commitAslText: () => void;
  importAslText: (text: string) => void;
  resetToInitial: () => void;
  formatAslText: () => void;
  undo: () => void;
  redo: () => void;
  addState: (stateName: string, stateType: string) => void;
  updateViewSettings: (settings: Partial<ViewSettings>) => void;
}

type History = {
  past: object[];
  future: object[];
};

const initialASL = {
  Comment:
    "A Hello World example of the Amazon States Language using Pass states",
  StartAt: "Hello",
  States: {
    Hello: {
      Type: "Pass",
      Result: "Hello",
      Next: "World",
    },
    World: {
      Type: "Pass",
      Result: "World",
      End: true,
    },
  },
};

const HISTORY_LIMIT = 50;

const safeClone = (value: object): object => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as object;
};

const updateHistoryFlags = (history: History) => ({
  canUndo: history.past.length > 0,
  canRedo: history.future.length > 0,
});

const commitDefinition = (params: {
  prev: {
    aslDefinition: object;
    history: History;
  };
  nextDefinition: object;
  replaceText: boolean;
  keepText?: string;
}) => {
  const { prev, nextDefinition, replaceText, keepText } = params;

  const nextHistory: History = {
    past: [...prev.history.past, safeClone(prev.aslDefinition)].slice(-HISTORY_LIMIT),
    future: [],
  };

  const nextText =
    keepText ?? (replaceText ? JSON.stringify(nextDefinition, null, 2) : "");

  return {
    aslDefinition: nextDefinition,
    aslText: nextText,
    parseError: null,
    validation: validateAsl(nextDefinition),
    history: nextHistory,
    ...updateHistoryFlags(nextHistory),
  } as const;
};

export const useStore = create<State & { history: History }>()(
  persist(
    (set, get) => ({
      aslDefinition: initialASL,
      aslText: JSON.stringify(initialASL, null, 2),
      parseError: null,
      validation: validateAsl(initialASL),
      history: { past: [], future: [] },
      canUndo: false,
      canRedo: false,
      viewSettings: {
        showToolbar: true,
        showMinimap: true,
        showControls: true,
        graphTheme: "dark",
      },
      setAslDefinition: (definition) =>
        set((state) =>
          commitDefinition({
            prev: { aslDefinition: state.aslDefinition, history: state.history },
            nextDefinition: definition,
            replaceText: true,
          }),
        ),
      setAslText: (text) => {
        let parseError: string | null = null;
        try {
          JSON.parse(text);
        } catch (e) {
          parseError = e instanceof Error ? e.message : "Invalid JSON";
        }
        set({ aslText: text, parseError });
      },
      commitAslText: () => {
        const { aslText } = get();
        try {
          const parsed = JSON.parse(aslText) as unknown;
          if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            set({ parseError: "ASL must be a JSON object." });
            return;
          }
          set((state) =>
            commitDefinition({
              prev: { aslDefinition: state.aslDefinition, history: state.history },
              nextDefinition: parsed as object,
              replaceText: false,
              keepText: state.aslText,
            }),
          );
        } catch (e) {
          set({ parseError: e instanceof Error ? e.message : "Invalid JSON" });
        }
      },
      importAslText: (text) => {
        try {
          const parsed = JSON.parse(text) as unknown;
          if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            set({ aslText: text, parseError: "ASL must be a JSON object." });
            return;
          }
          set((state) => ({
            ...commitDefinition({
              prev: { aslDefinition: state.aslDefinition, history: state.history },
              nextDefinition: parsed as object,
              replaceText: true,
            }),
          }));
        } catch (e) {
          set({ aslText: text, parseError: e instanceof Error ? e.message : "Invalid JSON" });
        }
      },
      resetToInitial: () =>
        set((state) =>
          commitDefinition({
            prev: { aslDefinition: state.aslDefinition, history: state.history },
            nextDefinition: safeClone(initialASL),
            replaceText: true,
          }),
        ),
      formatAslText: () => {
        const { aslText } = get();
        try {
          const parsed = JSON.parse(aslText) as unknown;
          if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            set({ parseError: "ASL must be a JSON object." });
            return;
          }
          const formatted = JSON.stringify(parsed, null, 2);
          set({ aslText: formatted, parseError: null });
          get().commitAslText();
        } catch (e) {
          set({ parseError: e instanceof Error ? e.message : "Invalid JSON" });
        }
      },
      undo: () => {
        set((state) => {
          if (state.history.past.length === 0) return state;
          const previous = state.history.past[state.history.past.length - 1];
          const nextPast = state.history.past.slice(0, -1);
          const nextFuture = [safeClone(state.aslDefinition), ...state.history.future].slice(
            0,
            HISTORY_LIMIT,
          );
          const nextHistory: History = { past: nextPast, future: nextFuture };
          return {
            aslDefinition: previous,
            aslText: JSON.stringify(previous, null, 2),
            parseError: null,
            validation: validateAsl(previous),
            history: nextHistory,
            ...updateHistoryFlags(nextHistory),
          };
        });
      },
      redo: () => {
        set((state) => {
          if (state.history.future.length === 0) return state;
          const next = state.history.future[0];
          const nextFuture = state.history.future.slice(1);
          const nextPast = [...state.history.past, safeClone(state.aslDefinition)].slice(
            -HISTORY_LIMIT,
          );
          const nextHistory: History = { past: nextPast, future: nextFuture };
          return {
            aslDefinition: next,
            aslText: JSON.stringify(next, null, 2),
            parseError: null,
            validation: validateAsl(next),
            history: nextHistory,
            ...updateHistoryFlags(nextHistory),
          };
        });
      },
      updateViewSettings: (settings) =>
        set((state) => ({
          viewSettings: { ...state.viewSettings, ...settings },
        })),
      addState: (stateName, stateType) =>
        set((state) => {
          const newDefinition = { ...state.aslDefinition } as any;
          if (!newDefinition.States) {
            newDefinition.States = {};
          }

      // Simple logic to add a new state
      // In a real app, we'd need more complex logic to handle connections
      let stateDefinition: any = {
        Type: stateType,
        End: true,
      };

      switch (stateType) {
        case "Wait":
          stateDefinition = { ...stateDefinition, Seconds: 5 };
          break;
        case "Task":
          stateDefinition = {
            ...stateDefinition,
            Resource:
              "arn:aws:lambda:us-east-1:123456789012:function:MyFunction",
          };
          break;
        case "Choice":
          stateDefinition = {
            Type: "Choice",
            Choices: [
              {
                Variable: "$.MyVariable",
                StringEquals: "MyValue",
              },
            ],
            Default:
              newDefinition.StartAt || Object.keys(newDefinition.States)[0],
          };
          break;
        case "Fail":
          stateDefinition = {
            Type: "Fail",
            Error: "GenericError",
            Cause: "An error occurred",
          };
          break;
        case "Parallel":
          stateDefinition = {
            ...stateDefinition,
            Branches: [
              {
                StartAt: "ParallelState",
                States: {
                  ParallelState: {
                    Type: "Pass",
                    End: true,
                  },
                },
              },
            ],
          };
          break;
        case "Map":
          stateDefinition = {
            ...stateDefinition,
            ItemsPath: "$.items",
            Iterator: {
              StartAt: "MapState",
              States: {
                MapState: {
                  Type: "Pass",
                  End: true,
                },
              },
            },
          };
          break;
      }

      newDefinition.States[stateName] = stateDefinition;

          return commitDefinition({
            prev: { aslDefinition: state.aslDefinition, history: state.history },
            nextDefinition: newDefinition,
            replaceText: true,
          });
        }),
    }),
    {
      name: "sfs-studio-store",
      version: 1,
      partialize: (state) => ({
        aslDefinition: state.aslDefinition,
        aslText: state.aslText,
        viewSettings: state.viewSettings,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return;

        // Recompute derived fields (not persisted)
        const definition = state.aslDefinition ?? initialASL;
        state.validation = validateAsl(definition);
        state.parseError = null;
        state.history = { past: [], future: [] };
        state.canUndo = false;
        state.canRedo = false;

        // Ensure text exists and is consistent
        if (!state.aslText || typeof state.aslText !== "string") {
          state.aslText = JSON.stringify(definition, null, 2);
        }
      },
    },
  ),
);
