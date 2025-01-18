import { EditorView, basicSetup } from "codemirror";
import { Compartment, EditorState } from "@codemirror/state";
import { json } from "@codemirror/lang-json";
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

let state = EditorState.create({
  extensions: [
    basicSetup,
    json(),
    scrollPastEnd(),
    fixedHeightEditor(),
    themeCompartment.of(darkTheme)
  ],
});

function makeEditorView(parent: Element) {
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
  leftEditorView = makeEditorView(leftPane);
  centerEditorView = makeEditorView(centerPane);
  rightEditorView = makeEditorView(rightPane);
}

export function setEditorTheme(darkMode: boolean) {
  if (darkMode) {
    leftEditorView.dispatch({
      effects: themeCompartment.reconfigure(darkTheme)
    });
  } else {
    leftEditorView.dispatch({
      effects: themeCompartment.reconfigure(lightTheme)
    });
  }
}

function updateEditorContent(editorView: EditorView, content: string) {
  editorView?.dispatch({
    changes: {
      from: 0,
      to: editorView.state.doc.length,
      insert: content
    }
  });
}

export function updateLeftEditorContent(content: string) {
  updateEditorContent(leftEditorView, content);
}
export function updateCenterEditorContent(content: string) {
  updateEditorContent(centerEditorView, content);
}
export function updateRightEditorContent(content: string) {
  updateEditorContent(rightEditorView, content);
}
