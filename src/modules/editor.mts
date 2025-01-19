import { EditorView, basicSetup } from "codemirror";
import { Compartment, EditorState } from "@codemirror/state";
import { json } from "@codemirror/lang-json";
import { javascript } from "@codemirror/lang-javascript";
import { scrollPastEnd } from "@codemirror/view";
import { githubLight } from "@ddietr/codemirror-themes/theme/github-light";
import { githubDark } from "@ddietr/codemirror-themes/theme/github-dark";

let leftPane = document.querySelector(".pane.left")!;
let centerPane = document.querySelector(".pane.center")!;
let rightPane = document.querySelector(".pane.right")!;

let leftEditorView: EditorView;
let centerEditorView: EditorView;
let rightEditorView: EditorView;

let lightTheme = githubLight;
let darkTheme = githubDark;
let themeCompartment = new Compartment;

function createEditorState(readOnly: boolean, lang: string) {
  let langExtension;
  if (lang === "json") {
    langExtension = json();
  }
  if (lang === "javascript") {
    langExtension = javascript();
  }
  let extensions = [
    basicSetup, langExtension, scrollPastEnd(), fixedHeightEditor(), EditorView.lineWrapping, themeCompartment.of(darkTheme)
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

function fixedHeightEditor() {
  return EditorView.theme({
    "&": { height: "100%" },
    ".cm-scroller": { overflow: "auto" }
  });
}

export function makeEditorViews() {
  leftEditorView = makeEditorView(leftPane, false, "json");
  centerEditorView = makeEditorView(centerPane, false, "javascript");
  rightEditorView = makeEditorView(rightPane, true, "json");
}

export function setEditorTheme(darkMode: boolean) {
  let transaction = {
    effects: themeCompartment.reconfigure(darkMode ? darkTheme : lightTheme)
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

export function overwriteLeftEditorContent(content: string) {
  overwriteEditorContent(leftEditorView, content);
}
export function overwriteCenterEditorContent(content: string) {
  overwriteEditorContent(centerEditorView, content);
}
export function overwriteRightEditorContent(content: string) {
  overwriteEditorContent(rightEditorView, content);
}
