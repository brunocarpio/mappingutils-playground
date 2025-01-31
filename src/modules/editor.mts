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
import { diagnosticCount, linter, lintGutter } from "@codemirror/lint";

import globals from "globals";
import * as eslint from "eslint-linter-browserify";
import {
  customScrollbar,
  fixedHeightEditorExtension,
  hiddenRangesField,
  hideTextEffect,
} from "./customExtensions.mts";
import { replacer, isValidFromJTD } from "./lib.mts";

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
let leftDownChanged = false;
let centerChanged = false;
let syntaxErrorSource = false;
let syntaxErrorMapping = false;
let sourceErrorSpan = document.getElementById("source-error")!;
let mappingErrorSpan = document.getElementById("mapping-error")!;

function createEditorState(readOnly: boolean, lang: string) {
  let langExtension;
  let linterExtension;
  if (lang === "json") {
    langExtension = json();
    linterExtension = linter(jsonParseLinter(), { delay: 250 });
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
      delay: 250,
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
  return EditorView.updateListener.of(async (update: ViewUpdate) => {
    if (
      update.view === leftDownEditorView &&
      diagnosticCount(update.state) > 0 &&
      !syntaxErrorSource
    ) {
      console.log("SYNTAX ERROR");
      syntaxErrorSource = true;
      sourceErrorSpan.textContent = "Syntax Error";
      sourceErrorSpan.classList.replace("success", "error");
      sourceErrorSpan.style.display = "inline";
      overwriteEditorContent(rightEditorView, "[]");
    }
    if (
      update.view === leftDownEditorView &&
      diagnosticCount(update.state) === 0 &&
      syntaxErrorSource
    ) {
      console.log("NO SYNTAX ERROR");
      syntaxErrorSource = false;
      sourceErrorSpan.style.display = "none";
    }
    if (
      update.view === centerEditorView &&
      diagnosticCount(update.state) > 0 &&
      !syntaxErrorMapping
    ) {
      console.log("SYNTAX ERROR MAPPING");
      syntaxErrorMapping = true;
      mappingErrorSpan.textContent = "Syntax Error";
      mappingErrorSpan.classList.replace("success", "error");
      mappingErrorSpan.style.display = "inline";
      overwriteEditorContent(rightEditorView, "[]");
    }
    if (
      update.view === centerEditorView &&
      diagnosticCount(update.state) === 0 &&
      syntaxErrorMapping
    ) {
      console.log("NO SYNTAX ERROR");
      syntaxErrorMapping = false;
      mappingErrorSpan.style.display = "none";
    }
    if (update.docChanged && !inOverwrite) {
      if (update.view === leftDownEditorView) {
        leftDownChanged =
          currentMapping.source.replace(/("[^"]*")|(\s+)/g, replacer) !==
          update.view.state.doc
            .toString()
            .replace(/("[^"]*")|(\s+)/g, replacer);
        currentMapping.source = update.view.state.doc.toString();
        upsertMappingLocal(currentMapping);
        if (leftDownChanged) {
          console.log("IN LEFTDOWN CHANGED");
          let computed = await computeMapping(
            currentMapping.source,
            currentMapping.mapping,
          );
          overwriteEditorContent(rightEditorView, computed);
        }
      } else if (update.view === leftUpEditorView) {
        currentMapping.schema = update.view.state.doc.toString();
        upsertMappingLocal(currentMapping);
      } else if (update.view === centerEditorView) {
        centerChanged =
          currentMapping.mapping.replace(/("[^"]*")|(\s+)/g, replacer) !==
          update.view.state.doc
            .toString()
            .replace(/("[^"]*")|(\s+)/g, replacer);
        currentMapping.mapping = update.view.state.doc.toString();
        upsertMappingLocal(currentMapping);
        if (centerChanged) {
          console.log("IN CENTER CHANGED");
          let computed = await computeMapping(
            currentMapping.source,
            currentMapping.mapping,
          );
          overwriteEditorContent(rightEditorView, computed);
        }
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
    let computed = await evaluator.evalAsync({ source, mapping });
    if (computed instanceof Error) {
      return "" + computed.cause;
    } else {
      return JSON.stringify(computed, null, 2);
    }
  } catch (error) {
    console.error(error);
    return Promise.resolve("[]");
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

export function addValidateJSONListener() {
  document
    .getElementById("json-schema-validator")
    ?.addEventListener("click", () => {
      sourceErrorSpan.style.display = "inline";
      if (!isValidFromJTD(currentMapping.schema, currentMapping.source)) {
        console.log("INVALID SCHEMA");
        sourceErrorSpan.textContent = "Invalid JSON";
        sourceErrorSpan.classList.replace("success", "error");
      } else {
        console.log("VALID SCHEMA");
        sourceErrorSpan.textContent = "Valid JSON";
        sourceErrorSpan.classList.replace("error", "success");
      }
    });
}
