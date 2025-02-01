import { EditorView } from "codemirror";
import ScriptEvaluator from "./ScriptEvaluator.mts";
import { type Mapping } from "../main.mts";

import { isValidFromJTD } from "./lib.mts";
import {
  makeCenterEV,
  makeLeftDownEV,
  makeLeftUpEV,
  makeRightEV,
  overwriteEditorContent,
  updateThemeTransaction,
} from "./editorViews.mts";

let leftUpEditorView: EditorView;
let leftDownEditorView: EditorView;
let centerEditorView: EditorView;
export let rightEditorView: EditorView;

let evaluator = new ScriptEvaluator();
export let currentMapping: Mapping;

export function makeEditorViews() {
  leftUpEditorView = makeLeftUpEV();
  leftDownEditorView = makeLeftDownEV();
  centerEditorView = makeCenterEV();
  rightEditorView = makeRightEV();
}

export function setEditorsTheme() {
  let transaction = updateThemeTransaction();
  leftUpEditorView.dispatch(transaction);
  leftDownEditorView.dispatch(transaction);
  centerEditorView.dispatch(transaction);
  rightEditorView.dispatch(transaction);
}

export async function setEditorContent(mapping: Mapping) {
  currentMapping = mapping;
  overwriteEditorContent(leftDownEditorView, mapping.source);
  overwriteEditorContent(leftUpEditorView, mapping.schema);
  overwriteEditorContent(centerEditorView, mapping.mapping);
  let computed = await computeMapping(mapping.source, mapping.mapping);
  overwriteEditorContent(rightEditorView, computed);
}

export async function computeMapping(
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
  let span = document.getElementById("source-error")!;
  document
    .getElementById("json-schema-validator")
    ?.addEventListener("click", () => {
      span.style.display = "inline";
      if (!isValidFromJTD(currentMapping.schema, currentMapping.source)) {
        console.log("INVALID SCHEMA");
        span.textContent = "Invalid JSON";
        span.classList.replace("success", "error");
      } else {
        console.log("VALID SCHEMA");
        span.textContent = "Valid JSON";
        span.classList.replace("error", "success");
      }
    });
}
