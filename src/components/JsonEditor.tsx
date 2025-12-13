import Editor from '@monaco-editor/react';
import { useEffect, useMemo, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Braces } from 'lucide-react';
import { createMarkersFromIssues } from '../validation/monacoMarkers';

export const JsonEditor = () => {
  const { aslText, setAslText, commitAslText, parseError, validation, formatAslText } = useStore();
  const commitTimerRef = useRef<number | null>(null);
  const monacoRef = useRef<Parameters<NonNullable<import('@monaco-editor/react').OnMount>>[1] | null>(null);
  const editorRef = useRef<Parameters<NonNullable<import('@monaco-editor/react').OnMount>>[0] | null>(null);

  const { errorCount, warningCount, topIssues } = useMemo(() => {
    const errorCountInner = validation.issues.filter((i) => i.severity === 'error').length;
    const warningCountInner = validation.issues.filter((i) => i.severity === 'warning').length;
    return {
      errorCount: errorCountInner,
      warningCount: warningCountInner,
      topIssues: validation.issues.slice(0, 6),
    };
  }, [validation]);

  useEffect(() => {
    return () => {
      if (commitTimerRef.current) window.clearTimeout(commitTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;

    const model = editor.getModel();
    if (!model) return;

    const markers = createMarkersFromIssues({
      monaco,
      text: aslText,
      issues: validation.issues,
      parseError,
    });

    monaco.editor.setModelMarkers(model, 'asl-validation', markers);
  }, [aslText, parseError, validation]);

  const handleEditorChange = (value: string | undefined) => {
    const next = value ?? '';
    setAslText(next);

    if (commitTimerRef.current) window.clearTimeout(commitTimerRef.current);
    commitTimerRef.current = window.setTimeout(() => {
      commitAslText();
    }, 450);
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-b from-gray-950 via-gray-950/95 to-gray-950 border-l border-gray-900/80 shadow-[-18px_0_45px_rgba(0,0,0,0.85)]">
      <div className="px-3 py-2 border-b border-gray-800/80 flex items-center justify-between bg-gray-950/90 backdrop-blur">
        <div className="flex flex-col gap-0.5">
          <span className="section-title">ASL Definition</span>
          <span className="text-[11px] text-gray-500">JSON + ASL semantic validation.</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <button
            onClick={formatAslText}
            className="btn-ghost"
            style={{ cursor: 'pointer' }}
            title="Format JSON"
          >
            <Braces size={18} />
          </button>

          {parseError ? (
            <>
              <span className="h-2 w-2 rounded-full bg-rose-400/90" />
              <span className="text-rose-300">Invalid JSON</span>
            </>
          ) : errorCount > 0 ? (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-400/90" />
              <span className="text-amber-300">{errorCount} error(s)</span>
              {warningCount > 0 && <span className="text-gray-500">• {warningCount} warning(s)</span>}
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
              <span className="text-emerald-300">OK</span>
              {warningCount > 0 && <span className="text-gray-500">• {warningCount} warning(s)</span>}
            </>
          )}
        </div>
      </div>

      {(parseError || topIssues.length > 0) && (
        <div className="border-b border-gray-800/80 bg-gray-950/70 px-3 py-2">
          {parseError ? (
            <div className="text-[11px] text-rose-300 truncate" title={parseError}>
              {parseError}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {topIssues.map((issue, idx) => (
                <div
                  key={`${issue.path}-${idx}`}
                  className={
                    issue.severity === 'error'
                      ? 'text-[11px] text-amber-200/90'
                      : 'text-[11px] text-gray-400'
                  }
                  title={issue.path}
                >
                  <span className="text-gray-500">{issue.stateName ? `[${issue.stateName}] ` : ''}</span>
                  {issue.message}
                  <span className="ml-2 text-[10px] text-gray-600">{issue.path}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={aslText}
          onChange={handleEditorChange}
          onMount={(editor, monaco) => {
            editorRef.current = editor;
            monacoRef.current = monaco;

            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
              commitAslText();
            });
          }}
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
