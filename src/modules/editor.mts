import { EditorView, basicSetup } from "codemirror";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import { json } from "@codemirror/lang-json";
import { javascript } from "@codemirror/lang-javascript";
import { scrollPastEnd, ViewUpdate } from "@codemirror/view";
import { githubLight } from "@ddietr/codemirror-themes/theme/github-light";
import { githubDark } from "@ddietr/codemirror-themes/theme/github-dark";
import ScriptEvaluator from "./ScriptEvaluator.mts";
import { type Mapping } from "../main.mts";
import { getDarkModeLocal, upsertMappingLocal } from "./localStorage.mts";

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
let theme: Compartment = new Compartment;

let scrollBar: Compartment = new Compartment;
let lightScrollBar = customScrollbar(false);
let darkScrollBar = customScrollbar(true);

let evaluator = new ScriptEvaluator();
let currentMapping: Mapping;

let inOverwrite = false;

function createEditorState(readOnly: boolean, lang: string) {
  let langExtension;
  if (lang === "json") {
    langExtension = json();
  } else {
    langExtension = javascript();
  }
  let extensions: Extension[] = [
    basicSetup,
    langExtension,
    scrollPastEnd(),
    fixedHeightEditorExtension(),
    updateListenerExtension(),
    EditorView.lineWrapping,
    theme.of(darkTheme),
    scrollBar.of(darkScrollBar)
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
    "&": {
      "height": "calc(100% - 30px)",
    },
    ".cm-scroller": {
      "overflow": "auto",
      "scrollbar-width": "thin"
    }
  });
}

function customScrollbar(darkMode: boolean) {
  if (darkMode) {
    return EditorView.theme({
      ".cm-scroller": {
        "scrollbar-color": "var(--gray5) var(--gray7)",
      },
    });
  } else {
    return EditorView.theme({
      ".cm-scroller": {
        "scrollbar-color": "var(--gray3) var(--gray1)",
      },
    });
  }
}

function updateListenerExtension() {
  return EditorView.updateListener.of(async (update: ViewUpdate) => {
    if (update.docChanged && !inOverwrite) {
      if (update.view === leftDownEditorView) {
        let didNotChange = currentMapping.source.replace(/\s+/g, "") === update.view.state.doc.toString().replace(/\s+/g, "");
        currentMapping.source = update.view.state.doc.toString();
        upsertMappingLocal(currentMapping);
        if (!didNotChange) {
          console.log("computing");
          let computed = await computeMapping(currentMapping.source, currentMapping.mapping);
          overwriteEditorContent(rightEditorView, computed);
        }
      } else if (update.view === leftUpEditorView) {
        currentMapping.schema = update.view.state.doc.toString();
        upsertMappingLocal(currentMapping);
      } else if (update.view === centerEditorView) {
        let didNotChange = currentMapping.mapping.replace(/\s+/g, "") === update.view.state.doc.toString().replace(/\s+/g, "");
        currentMapping.mapping = update.view.state.doc.toString();
        upsertMappingLocal(currentMapping);
        if (!didNotChange) {
          console.log("computing");
          let computed = await computeMapping(currentMapping.source, currentMapping.mapping);
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
      scrollBar.reconfigure(darkMode ? darkScrollBar : lightScrollBar)
    ]
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
      insert: content
    }
  });
  inOverwrite = false;
}

export async function setEditorContent(mapping: Mapping) {
  currentMapping = mapping;
  overwriteEditorContent(leftDownEditorView, mapping.source);
  overwriteEditorContent(leftUpEditorView, mapping.schema);
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

export function addPrettyButtonsListener() {
  document.getElementById("pretty-print-source")?.addEventListener("click", () => {
    leftDownEditorView?.dispatch({
      changes: {
        from: 0,
        to: leftDownEditorView.state.doc.length,
        insert: JSON.stringify(JSON.parse(currentMapping.source), null, 2)
      }
    });
  });

  document.getElementById("pretty-print-schema")?.addEventListener("click", () => {
    leftUpEditorView?.dispatch({
      changes: {
        from: 0,
        to: leftUpEditorView.state.doc.length,
        insert: JSON.stringify(JSON.parse(currentMapping.schema), null, 2)
      }
    });
  });
}
