import { Compartment, EditorState, Extension } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { EditorView, scrollPastEnd, ViewUpdate } from "@codemirror/view";
import {
    customScrollbar,
    fixedHeightEditorExtension,
} from "./customExtensions.mts";
import { githubLight } from "@ddietr/codemirror-themes/theme/github-light";
import { githubDark } from "@ddietr/codemirror-themes/theme/github-dark";
import { getDarkModeLocal, upsertMappingLocal } from "./localStorage.mts";
import { javascript } from "@codemirror/lang-javascript";
import { diagnosticCount, linter, lintGutter } from "@codemirror/lint";
import { computeMapping, currentMapping, rightEditorView } from "./editor.mts";
import { replacer } from "./lib.mts";

let lightTheme: Extension = githubLight;
let darkTheme: Extension = githubDark;
let theme: Compartment = new Compartment();

let lightScrollBar = customScrollbar(false);
let darkScrollBar = customScrollbar(true);
let scrollBar: Compartment = new Compartment();

let inOverwrite = false;

function startLeftDownEv() {
    let darkMode = getDarkModeLocal();
    return EditorState.create({
        extensions: [
            EditorView.lineWrapping,
            basicSetup,
            computeListener("source"),
            fixedHeightEditorExtension(),
            json(),
            syntaxErrorListener("source-error"),
            lintGutter(),
            linter(jsonParseLinter(), { delay: 250 }),
            scrollBar.of(darkMode ? darkScrollBar : lightScrollBar),
            scrollPastEnd(),
            theme.of(darkMode ? darkTheme : lightTheme),
        ],
    });
}

function startLeftUpEv() {
    let darkMode = getDarkModeLocal();
    return EditorState.create({
        extensions: [
            EditorView.lineWrapping,
            basicSetup,
            fixedHeightEditorExtension(),
            json(),
            lintGutter(),
            linter(jsonParseLinter(), { delay: 250 }),
            saveSchemaListener(),
            scrollBar.of(darkMode ? darkScrollBar : lightScrollBar),
            scrollPastEnd(),
            theme.of(darkMode ? darkTheme : lightTheme),
        ],
    });
}

function startCenterEV() {
    let darkMode = getDarkModeLocal();
    return EditorState.create({
        extensions: [
            EditorView.lineWrapping,
            basicSetup,
            computeListener("schema"),
            fixedHeightEditorExtension(),
            javascript(),
            scrollBar.of(darkMode ? darkScrollBar : lightScrollBar),
            scrollPastEnd(),
            theme.of(darkMode ? darkTheme : lightTheme),
        ],
    });
}

function startRightEV() {
    let darkMode = getDarkModeLocal();
    return EditorState.create({
        extensions: [
            EditorState.readOnly.of(true),
            EditorView.lineWrapping,
            basicSetup,
            fixedHeightEditorExtension(),
            json(),
            scrollBar.of(darkMode ? darkScrollBar : lightScrollBar),
            scrollPastEnd(),
            theme.of(darkMode ? darkTheme : lightTheme),
        ],
    });
}

export function makeLeftDownEV() {
    return new EditorView({
        state: startLeftDownEv(),
        parent: document.getElementById("pane-left-down")!,
    });
}

export function makeLeftUpEV() {
    return new EditorView({
        state: startLeftUpEv(),
        parent: document.getElementById("pane-left-up")!,
    });
}

export function makeCenterEV() {
    return new EditorView({
        state: startCenterEV(),
        parent: document.getElementById("pane-center")!,
    });
}

export function makeRightEV() {
    return new EditorView({
        state: startRightEV(),
        parent: document.getElementById("pane-right")!,
    });
}

export function updateThemeTransaction() {
    let darkMode = getDarkModeLocal();
    return {
        effects: [
            theme.reconfigure(darkMode ? darkTheme : lightTheme),
            scrollBar.reconfigure(darkMode ? darkScrollBar : lightScrollBar),
        ],
    };
}

function saveSchemaListener() {
    return EditorView.updateListener.of(async (update: ViewUpdate) => {
        if (update.docChanged && !inOverwrite) {
            currentMapping.schema = update.view.state.doc.toString();
            upsertMappingLocal(currentMapping);
        }
    });
}

function syntaxErrorListener(id: string) {
    let syntaxError = false;
    let span = document.getElementById(id)!;
    return EditorView.updateListener.of(async (update: ViewUpdate) => {
        if (diagnosticCount(update.state) > 0 && !syntaxError) {
            syntaxError = true;
            span.textContent = "Syntax Error";
            span.classList.replace("success", "error");
            span.style.display = "inline";
        }
        if (diagnosticCount(update.state) === 0 && syntaxError) {
            syntaxError = false;
            span.style.display = "none";
        }
        if (inOverwrite) {
            span.style.display = "none";
        }
    });
}

function computeListener(type: "source" | "schema") {
    let regExp = /("[^"]*")|(\s+)/g;
    return EditorView.updateListener.of(async (update: ViewUpdate) => {
        if (update.docChanged && !inOverwrite) {
            let didChange = false;
            if (type === "source") {
                didChange =
                    currentMapping.source.replace(regExp, replacer) !==
                    update.state.doc.toString().replace(regExp, replacer);
                currentMapping.source = update.view.state.doc.toString();
            } else {
                didChange =
                    currentMapping.mapping.replace(regExp, replacer) !==
                    update.state.doc.toString().replace(regExp, replacer);
                currentMapping.mapping = update.view.state.doc.toString();
            }
            upsertMappingLocal(currentMapping);
            if (didChange) {
                let computed = await computeMapping(
                    currentMapping.source,
                    currentMapping.mapping,
                );
                overwriteEditorContent(rightEditorView, computed);
            }
        }
    });
}

export function overwriteEditorContent(
    editorView: EditorView,
    content: string,
) {
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
