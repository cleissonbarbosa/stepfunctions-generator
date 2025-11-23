import Editor from '@monaco-editor/react';
import { useStore } from '../store/useStore';

export const JsonEditor = () => {
  const { aslDefinition, setAslDefinition } = useStore();

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    try {
      const parsed = JSON.parse(value);
      setAslDefinition(parsed);
    } catch (e) {
      // Ignore parse errors while typing
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-b from-gray-950 via-gray-950/95 to-gray-950 border-l border-gray-900/80 shadow-[-18px_0_45px_rgba(0,0,0,0.85)]">
      <div className="px-3 py-2 border-b border-gray-800/80 flex items-center justify-between bg-gray-950/90 backdrop-blur">
        <div className="flex flex-col gap-0.5">
          <span className="section-title">ASL Definition</span>
          <span className="text-[11px] text-gray-500">JSON editor with live validation by asl-viewer.</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
          Synced
        </div>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={JSON.stringify(aslDefinition, null, 2)}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12 },
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>
    </div>
  );
};
