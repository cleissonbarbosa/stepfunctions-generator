import { create } from "zustand";
import type { WorkflowViewerProps } from "asl-viewer";

interface ViewSettings extends WorkflowViewerProps {
  showMinimap: boolean;
  showControls: boolean;
  graphTheme: WorkflowViewerProps["theme"];
}

interface State {
  aslDefinition: object;
  viewSettings: ViewSettings;
  setAslDefinition: (definition: object) => void;
  addState: (stateName: string, stateType: string) => void;
  updateViewSettings: (settings: Partial<ViewSettings>) => void;
}

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

export const useStore = create<State>((set) => ({
  aslDefinition: initialASL,
  viewSettings: {
    showToolbar: true,
    showMinimap: true,
    showControls: true,
    graphTheme: "dark",
  },
  setAslDefinition: (definition) => set({ aslDefinition: definition }),
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

      return { aslDefinition: newDefinition };
    }),
}));
