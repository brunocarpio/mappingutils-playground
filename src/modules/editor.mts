import { EditorView, basicSetup } from "codemirror";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { esLint, javascript } from "@codemirror/lang-javascript";
import { scrollPastEnd, ViewUpdate } from "@codemirror/view";
import { githubLight } from "@ddietr/codemirror-themes/theme/github-light";
import { githubDark } from "@ddietr/codemirror-themes/theme/github-dark";
import ScriptEvaluator from "./ScriptEvaluator.mts";
import { type Mapping } from "../main.mts";
import { getDarkModeLocal, upsertMappingLocal } from "./localStorage.mts";
import {
  diagnosticCount,
  forEachDiagnostic,
  linter,
  lintGutter,
  setDiagnosticsEffect,
} from "@codemirror/lint";

import globals from "globals";
import * as eslint from "eslint-linter-browserify";
import {
  customScrollbar,
  fixedHeightEditorExtension,
  hiddenRangesField,
  hideTextEffect,
} from "./customExtensions.mts";

let leftPaneUp = document.getElementById("pane-left-up")!;
let leftPaneDown = document.getElementById("pane-left-down")!;
let centerPane = document.getElementById("pane-center")!;
let rightPane = document.getElementById("pane-right")!;

let leftUpEditorView: EditorView;
let leftDownEditorView: EditorView;
let centerEditorView: EditorView;
let rightEditorView: EditorView;

let lightTheme: Extension = githubLight;
let darkTheme: Extension = githubDark;
let theme: Compartment = new Compartment();

let scrollBar: Compartment = new Compartment();
let lightScrollBar = customScrollbar(false);
let darkScrollBar = customScrollbar(true);

let evaluator = new ScriptEvaluator();
let currentMapping: Mapping;

let inOverwrite = false;

function createEditorState(readOnly: boolean, lang: string) {
  let langExtension;
  let linterExtension;
  if (lang === "json") {
    langExtension = json();
    linterExtension = linter(jsonParseLinter(), { delay: 350 });
  } else {
    langExtension = javascript();
    let lintConfig = {
      languageOptions: {
        globals: {
          ...globals.node,
        },
        parserOptions: {
          ecmaVersion: 2023,
          sourceType: "module",
        },
      },
      rules: {
        semi: ["error", "never"],
      },
    };
    linterExtension = linter(esLint(new eslint.Linter(), lintConfig), {
      delay: 350,
    });
  }
  let extensions: Extension[] = [
    basicSetup,
    langExtension,
    scrollPastEnd(),
    fixedHeightEditorExtension(),
    updateListenerExtension(),
    EditorView.lineWrapping,
    theme.of(darkTheme),
    scrollBar.of(darkScrollBar),
  ];
  if (readOnly) {
    extensions.push(EditorState.readOnly.of(true));
  } else {
    if (lang === "javascript") {
      extensions.push(hiddenRangesField);
    }
    extensions.push(linterExtension, lintGutter());
  }
  return EditorState.create({ extensions });
}

function makeEditorView(parent: Element, readOnly: boolean, lang: string) {
  let state = createEditorState(readOnly, lang);
  return new EditorView({
    state,
    parent,
  });
}

function updateListenerExtension() {
  let leftDownChanged = false;
  let centerChanged = false;
  return EditorView.updateListener.of(async (update: ViewUpdate) => {
    if (update.view === leftDownEditorView) {
      let sourceErrorSpan = document.getElementById("source-error")!;
      if (
        diagnosticCount(update.state) > 0 &&
        sourceErrorSpan.style.display === "none"
      ) {
        sourceErrorSpan.textContent = "Syntax errors";
        sourceErrorSpan.style.display = "inline";
        overwriteEditorContent(rightEditorView, "[]");
      } else if (diagnosticCount(update.state) === 0 && leftDownChanged) {
        sourceErrorSpan.style.display = "none";
        leftDownChanged = false;
        let computed = await computeMapping(
          currentMapping.source,
          currentMapping.mapping,
        );
        overwriteEditorContent(rightEditorView, computed);
      }
    }
    if (update.view === centerEditorView) {
      let mappingErrorSpan = document.getElementById("mapping-error")!;
      if (
        diagnosticCount(update.state) > 0 &&
        mappingErrorSpan.style.display === "none"
      ) {
        mappingErrorSpan.textContent = "Syntax errors";
        mappingErrorSpan.style.display = "inline";
        overwriteEditorContent(rightEditorView, "[]");
      } else if (diagnosticCount(update.state) === 0 && centerChanged) {
        mappingErrorSpan.style.display = "none";
        centerChanged = false;
        let computed = await computeMapping(
          currentMapping.source,
          currentMapping.mapping,
        );
        overwriteEditorContent(rightEditorView, computed);
      }
    }
    if (update.docChanged && !inOverwrite) {
      if (update.view === leftDownEditorView) {
        leftDownChanged =
          currentMapping.source.replace(/\s+/g, "") !==
          update.view.state.doc.toString().replace(/\s+/g, "");
        currentMapping.source = update.view.state.doc.toString();
        upsertMappingLocal(currentMapping);
      } else if (update.view === leftUpEditorView) {
        currentMapping.schema = update.view.state.doc.toString();
        upsertMappingLocal(currentMapping);
      } else if (update.view === centerEditorView) {
        centerChanged =
          currentMapping.mapping.replace(/\s+/g, "") !==
          update.view.state.doc.toString().replace(/\s+/g, "");
        currentMapping.mapping = update.view.state.doc.toString();
        upsertMappingLocal(currentMapping);
      }
    }
  });
}

export function makeEditorViews() {
  leftUpEditorView = makeEditorView(leftPaneUp, false, "json");
  leftDownEditorView = makeEditorView(leftPaneDown, false, "json");
  centerEditorView = makeEditorView(centerPane, false, "javascript");
  rightEditorView = makeEditorView(rightPane, true, "json");
}

export function setEditorTheme() {
  let darkMode = getDarkModeLocal();
  let transaction = {
    effects: [
      theme.reconfigure(darkMode ? darkTheme : lightTheme),
      scrollBar.reconfigure(darkMode ? darkScrollBar : lightScrollBar),
    ],
  };
  leftUpEditorView.dispatch(transaction);
  leftDownEditorView.dispatch(transaction);
  centerEditorView.dispatch(transaction);
  rightEditorView.dispatch(transaction);
}

function overwriteEditorContent(editorView: EditorView, content: string) {
  inOverwrite = true;
  editorView?.dispatch({
    changes: {
      from: 0,
      to: editorView.state.doc.length,
      insert: content,
    },
  });
  inOverwrite = false;
}

export async function setEditorContent(mapping: Mapping) {
  currentMapping = mapping;
  overwriteEditorContent(leftDownEditorView, mapping.source);
  overwriteEditorContent(leftUpEditorView, mapping.schema);
  overwriteEditorContent(centerEditorView, mapping.mapping);
  centerEditorView.dispatch({
    effects: hideTextEffect.of({ from: 0, to: 8 }),
  });
  let computed = await computeMapping(mapping.source, mapping.mapping);
  overwriteEditorContent(rightEditorView, computed);
}

async function computeMapping(
  source: string,
  mapping: string,
): Promise<string> {
  try {
    return JSON.stringify(
      await evaluator.evalAsync({ source, mapping }),
      null,
      2,
    );
  } catch (err: any) {
    return err.toString();
  }
}

export function addPrettyButtonsListener() {
  document
    .getElementById("pretty-print-source")
    ?.addEventListener("click", () => {
      leftDownEditorView?.dispatch({
        changes: {
          from: 0,
          to: leftDownEditorView.state.doc.length,
          insert: JSON.stringify(JSON.parse(currentMapping.source), null, 2),
        },
      });
    });

  document
    .getElementById("pretty-print-schema")
    ?.addEventListener("click", () => {
      leftUpEditorView?.dispatch({
        changes: {
          from: 0,
          to: leftUpEditorView.state.doc.length,
          insert: JSON.stringify(JSON.parse(currentMapping.schema), null, 2),
        },
      });
    });
}
