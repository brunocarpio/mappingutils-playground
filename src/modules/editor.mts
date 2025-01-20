import { EditorView, basicSetup } from "codemirror";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import { json } from "@codemirror/lang-json";
import { javascript } from "@codemirror/lang-javascript";
import { scrollPastEnd, ViewUpdate } from "@codemirror/view";
import { githubLight } from "@ddietr/codemirror-themes/theme/github-light";
import { githubDark } from "@ddietr/codemirror-themes/theme/github-dark";
import ScriptEvaluator from "./ScriptEvaluator.mts";
import { Mapping } from "../main.mts";

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
let currentMapping: Mapping;

let overwrite = false;

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
    "&": { height: "calc(100% - 30px)" },
    ".cm-scroller": { overflow: "auto" }
  });
}

function updateListenerExtension() {
  return EditorView.updateListener.of(async (update: ViewUpdate) => {
    if (update.docChanged && !overwrite) {
      if (update.view === leftEditorView) {
        console.log("on change left", Date.now());
        currentMapping.source = update.view.state.doc.toString();
        let computed = await computeMapping(currentMapping.source, currentMapping.mapping);
        overwriteEditorContent(rightEditorView, computed);
      } else if (update.view === centerEditorView) {
        console.log("on change center", Date.now());
        currentMapping.mapping = update.view.state.doc.toString();
        let computed = await computeMapping(currentMapping.source, currentMapping.mapping);
        overwriteEditorContent(rightEditorView, computed);
      }
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
  overwrite = true;
  editorView?.dispatch({
    changes: {
      from: 0,
      to: editorView.state.doc.length,
      insert: content
    }
  });
  overwrite = false;
}

export async function setEditorContent(mapping: any) {
  currentMapping = mapping;
  overwriteEditorContent(leftEditorView, mapping.source);
  overwriteEditorContent(centerEditorView, mapping.mapping);
  let computed = await computeMapping(mapping.source, mapping.mapping);
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

