import type { editor as MonacoEditor } from "monaco-editor";
import { findNodeAtLocation, parseTree } from "jsonc-parser";
import type { ValidationIssue } from "./asl";

type Monaco = typeof import("monaco-editor");

type Marker = MonacoEditor.IMarkerData;

type Range = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

const offsetToPosition = (text: string, offset: number) => {
  let line = 1;
  let column = 1;

  for (let i = 0; i < offset && i < text.length; i++) {
    const ch = text.charCodeAt(i);
    if (ch === 10) {
      line++;
      column = 1;
    } else {
      column++;
    }
  }

  return { lineNumber: line, column };
};

const rangeFromOffsets = (text: string, startOffset: number, endOffset: number): Range => {
  const start = offsetToPosition(text, Math.max(0, startOffset));
  const end = offsetToPosition(text, Math.max(startOffset, endOffset));
  return {
    startLineNumber: start.lineNumber,
    startColumn: start.column,
    endLineNumber: end.lineNumber,
    endColumn: end.column,
  };
};

const severityToMonaco = (monaco: Monaco, severity: ValidationIssue["severity"]) => {
  return severity === "error"
    ? monaco.MarkerSeverity.Error
    : monaco.MarkerSeverity.Warning;
};

const guessRangeForStateName = (text: string, stateName: string): Range | null => {
  const needle = `"${stateName}"`;
  const idx = text.indexOf(needle);
  if (idx < 0) return null;
  return rangeFromOffsets(text, idx + 1, idx + needle.length - 1);
};

const pathToJsoncLocation = (text: string, path: string): Range | null => {
  // Aceita "<root>.States.Hello.Next" etc.
  const normalized = path.replace(/^<root>\.?/, "");
  if (!normalized) return null;

  const tokens: (string | number)[] = [];

  // Tokenize dot notation and support indices like "Choices[0]"
  for (const part of normalized.split(".")) {
    if (!part) continue;
    const match = /^([^[\]]+)(\[(\d+)\])?$/.exec(part);
    if (!match) {
      tokens.push(part);
      continue;
    }
    const key = match[1];
    tokens.push(key);
    if (match[3]) tokens.push(Number(match[3]));
  }

  const errors: import("jsonc-parser").ParseError[] = [];
  const root = parseTree(text, errors, { allowTrailingComma: true });
  if (!root) return null;
  // findNodeAtLocation trabalha com path em forma de array (keys/indices)
  const node = findNodeAtLocation(root, tokens);
  if (!node) return null;

  // Se for propriedade, tenta expandir um pouco
  const start = node.offset;
  const end = node.offset + node.length;
  if (end <= start) return null;

  return rangeFromOffsets(text, start, end);
};

export const createMarkersFromIssues = (params: {
  monaco: Monaco;
  text: string;
  issues: ValidationIssue[];
  parseError?: string | null;
}): Marker[] => {
  const { monaco, text, issues, parseError } = params;

  const markers: Marker[] = [];

  if (parseError) {
    markers.push({
      ...rangeFromOffsets(text, 0, Math.min(text.length, 1)),
      message: parseError,
      severity: monaco.MarkerSeverity.Error,
    });
    return markers;
  }

  for (const issue of issues) {
    let range: Range | null = null;

    if (issue.path && issue.path !== "<root>") {
      range = pathToJsoncLocation(text, issue.path);
    }

    if (!range && issue.stateName) {
      range = guessRangeForStateName(text, issue.stateName);
    }

    if (!range) {
      range = rangeFromOffsets(text, 0, Math.min(text.length, 1));
    }

    markers.push({
      ...range,
      message: issue.message,
      severity: severityToMonaco(monaco, issue.severity),
    });
  }

  return markers;
};
