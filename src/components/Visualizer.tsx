import { WorkflowViewer } from "asl-viewer";
import "asl-viewer/dist/index.css";
import { useStore } from "../store/useStore";
import { useDrop } from "react-dnd";

export const Visualizer = () => {
  const { aslDefinition, addState, viewSettings, parseError, validation } = useStore();

  const errorCount = validation.issues.filter((i) => i.severity === "error").length;
  const warningCount = validation.issues.filter((i) => i.severity === "warning").length;

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "STATE",
    drop: (item: { type: string }) => {
      if (parseError) return;
      const stateName = `${item.type}-${Date.now()}`;
      addState(stateName, item.type);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop as any}
      className={`h-full w-full relative overflow-hidden bg-[radial-gradient(circle_at_top,_#1f2937,_#020617_60%)]`}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 0 0, rgba(56,189,248,0.18), transparent 55%), radial-gradient(circle at 100% 0, rgba(129,140,248,0.16), transparent 55%)",
        }}
      />

      <div className="absolute inset-4 flex flex-col gap-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="section-title">Workflow Preview</span>
            {parseError ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-300 border border-rose-500/40">
                Fix JSON to enable drag & drop
              </span>
            ) : isOver ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300 border border-emerald-500/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Drop to add state
              </span>
            ) : null}

            {!parseError && (errorCount > 0 || warningCount > 0) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300 border border-amber-500/40">
                {errorCount > 0 ? `${errorCount} error(s)` : "0 errors"}
                {warningCount > 0 ? ` • ${warningCount} warning(s)` : null}
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-400 hidden md:inline">
            Author{" "}
            <span className="font-medium text-sky-300">keumasterpiece</span>
          </span>
        </div>

        <div className="flex-1 rounded-2xl glass-surface gradient-border overflow-hidden flex items-center justify-center">
          <WorkflowViewer
            {...viewSettings}
            definition={aslDefinition as any}
            height={620}
            width={980}
            theme={viewSettings.graphTheme}
            useMiniMap={viewSettings.showMinimap}
            useControls={viewSettings.showControls}
            showToolbar={viewSettings.showToolbar}
            hideComment
            isDraggable
          />
        </div>
      </div>
    </div>
  );
};
