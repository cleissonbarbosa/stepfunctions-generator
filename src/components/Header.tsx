import { useEffect, useRef, useState, type ChangeEventHandler } from "react";
import {
  Download,
  Settings,
  Bolt,
  Copy,
  Upload,
  Undo2,
  Redo2,
  RotateCcw,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { SettingsModal } from "./SettingsModal";

export const Header = () => {
  const {
    aslDefinition,
    importAslText,
    undo,
    redo,
    canUndo,
    canRedo,
    parseError,
    resetToInitial,
  } = useStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(aslDefinition, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "workflow.asl.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(JSON.stringify(aslDefinition, null, 2));
    alert("Workflow JSON copied to clipboard!");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    importAslText(text);
    e.target.value = "";
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const modKey = isMac ? event.metaKey : event.ctrlKey;
      if (!modKey) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest(".monaco-editor")) return;

      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, undo]);

  const handleSettings = () => {
    setIsSettingsOpen(true);
  };

  return (
    <>
      <header className="h-16 border-b border-gray-800/80 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950/95 flex items-center justify-between px-4 shadow-[0_18px_40px_rgba(0,0,0,0.55)] relative z-20">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 shadow-[0_0_25px_rgba(16,185,129,0.55)]">
            <Bolt size={18} className="text-white" />
            <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white tracking-tight">
                Step Functions Studio
              </h1>
              <span className="badge-pill">ASL Viewer Demo</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Visual builder for AWS Step Functions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live Graph Preview
          </span>

          {parseError && (
            <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300 border border-rose-500/30">
              Invalid JSON
            </span>
          )}

          <button
            onClick={undo}
            className="btn-ghost"
            style={{
              cursor: canUndo ? "pointer" : "not-allowed",
              opacity: canUndo ? 1 : 0.45,
            }}
            title="Undo (Ctrl/Cmd+Z)"
            disabled={!canUndo}
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={redo}
            className="btn-ghost"
            style={{
              cursor: canRedo ? "pointer" : "not-allowed",
              opacity: canRedo ? 1 : 0.45,
            }}
            title="Redo (Ctrl+Y / Shift+Ctrl/Cmd+Z)"
            disabled={!canRedo}
          >
            <Redo2 size={18} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            onClick={handleImportClick}
            className="btn-ghost"
            style={{ cursor: "pointer" }}
            title="Import JSON"
          >
            <Upload size={18} />
          </button>

          <button
            onClick={() => {
              const ok = window.confirm(
                "Reset to the initial example? This will overwrite the current workflow."
              );
              if (ok) resetToInitial();
            }}
            className="btn-ghost"
            style={{ cursor: "pointer" }}
            title="Reset workflow"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={handleExport}
            className="btn-primary"
            style={{
              cursor: "pointer",
            }}
          >
            <Download size={16} />
            Export JSON
          </button>
          <button
            onClick={handleShare}
            className="btn-ghost"
            style={{ cursor: "pointer" }}
            title="Copy JSON"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={handleSettings}
            className="btn-ghost"
            style={{ cursor: "pointer" }}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};
