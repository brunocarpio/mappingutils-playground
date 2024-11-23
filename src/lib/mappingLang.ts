import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";

function registerMapping(monaco: typeof Monaco) {
    monaco.languages.register({ id: "mapping" });

    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider("mapping", {
        tokenizer: {
            root: [
                [/\/\*.*\*\//, "mapping-comment"],
                [/'.*?'/, "mapping-string"],
                [/".*?"/, "mapping-string"],
                [/\$[a-zA-Z0-9_]*/, "mapping-variable"],
                [/[a-zA-Z0-9_]+/, "mapping-names"],
            ],
        },
    });

    const brackets = [
        { open: "(", close: ")" },
        { open: "[", close: "]" },
        { open: "{", close: "}" },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: "`", close: "`" },
    ];
    monaco.languages.setLanguageConfiguration("mapping", {
        brackets: [
            ["(", ")"],
            ["[", "]"],
            ["{", "}"],
        ],
        autoClosingPairs: brackets,
        surroundingPairs: brackets,
        indentationRules: {
            // ^(.*\*/)?\s*\}.*$
            decreaseIndentPattern: /^((?!.*?\/\*).*\*\/)?\s*[}\])].*$/,
            // ^.*\{[^}"']*$
            increaseIndentPattern:
                /^((?!\/\/).)*(\{[^}"'`]*|\([^)"'`]*|\[[^\]"'`]*)$/,
        },
        insertSpaces: true,
        tabSize: 2,
    });

    // Define a new theme that contains only rules that match this language
    monaco.editor.defineTheme("mappingTheme", {
        base: "vs",
        inherit: true,
        rules: [
            { token: "mapping-string", foreground: "a00000" },
            { token: "mapping-comment", foreground: "008000" },
            { token: "mapping-variable", foreground: "ff4000" },
            { token: "mapping-names", foreground: "0000c0" },
        ],
        colors: {
            "editor.background": "#fffffb",
        },
    });
}

export default registerMapping;
