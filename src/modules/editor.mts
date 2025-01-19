import { EditorView, basicSetup } from "codemirror";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import { json } from "@codemirror/lang-json";
import { javascript } from "@codemirror/lang-javascript";
import { scrollPastEnd, ViewUpdate } from "@codemirror/view";
import { githubLight } from "@ddietr/codemirror-themes/theme/github-light";
import { githubDark } from "@ddietr/codemirror-themes/theme/github-dark";
import ScriptEvaluator from "./ScriptEvaluator.mts";

let leftPane = document.querySelector(".pane.left")!;
let centerPane = document.querySelector(".pane.center")!;
let rightPane = document.querySelector(".pane.right")!;

let leftEditorView: EditorView;
let centerEditorView: EditorView;
let rightEditorView: EditorView;

let lightTheme: Extension = githubLight;
let darkTheme: Extension = githubDark;
let theme: Compartment = new Compartment;

let evaluator = new ScriptEvaluator();
let currentMapping;

function createEditorState(readOnly: boolean, lang: string) {
  let langExtension;
  if (lang === "json") {
    langExtension = json();
  }
  if (lang === "javascript") {
    langExtension = javascript();
  }
  let extensions = [
    basicSetup,
    langExtension,
    scrollPastEnd(),
    fixedHeightEditorExtension(),
    updateListenerExtension(),
    EditorView.lineWrapping,
    theme.of(darkTheme)
  ];
  if (readOnly) {
    extensions.push(EditorState.readOnly.of(true));
  }
  return EditorState.create({ extensions });
}

function makeEditorView(parent: Element, readOnly: boolean, lang: string) {
  let state = createEditorState(readOnly, lang);
  return new EditorView({
    state,
    parent
  });
}

function fixedHeightEditorExtension() {
  return EditorView.theme({
    "&": { height: "100%" },
    ".cm-scroller": { overflow: "auto" }
  });
}

function updateListenerExtension() {
  return EditorView.updateListener.of((update: ViewUpdate) => {
    if (update.docChanged) {
      //console.log(update.view === leftEditorView);
      //console.log(update.view.state.doc.toString());
    }
  });
}

export function makeEditorViews() {
  leftEditorView = makeEditorView(leftPane, false, "json");
  centerEditorView = makeEditorView(centerPane, false, "javascript");
  rightEditorView = makeEditorView(rightPane, true, "json");
}

export function setEditorTheme(darkMode: boolean) {
  let transaction = {
    effects: theme.reconfigure(darkMode ? darkTheme : lightTheme)
  };
  leftEditorView.dispatch(transaction);
  centerEditorView.dispatch(transaction);
  rightEditorView.dispatch(transaction);
}

function overwriteEditorContent(editorView: EditorView, content: string) {
  editorView?.dispatch({
    changes: {
      from: 0,
      to: editorView.state.doc.length,
      insert: content
    }
  });
}

export async function setEditorContent(mapping: any) {
  currentMapping = mapping;
  overwriteEditorContent(leftEditorView, mapping.source);
  overwriteEditorContent(centerEditorView, mapping.mapping);
  let computed = await computeMapping(mapping.source, mapping.mapping)
  overwriteEditorContent(rightEditorView, computed);
}

async function computeMapping(source: string, mapping: string): Promise<string> {
  try {
    return JSON.stringify(
      await evaluator.evalAsync({ source, mapping }),
      null,
      2
    );
  } catch (err: any) {
    return err.toString();
  }
}

