<script lang="ts">
    import loader from "@monaco-editor/loader";
    import { onDestroy, onMount } from "svelte";
    import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
    import registerMapping from "$lib/mappingLang";

    let editorContainer: HTMLElement;
    let monaco: typeof Monaco;
    let editor: Monaco.editor.IStandaloneCodeEditor;

    let options: Monaco.editor.IStandaloneEditorConstructionOptions = {
        theme: "vs-dark",
        minimap: { enabled: false },
        lineNumbers: "off",
        contextmenu: false,
        scrollBeyondLastLine: false,
    };

    interface myProps {
        value: string;
        language: string;
        type: string;
    }

    let { value = $bindable(), language, type }: myProps = $props();

    $effect(() => {
        if (value && type === "target") {
            handleUpdateInProps();
        }
    });

    function handleUpdateInProps() {
        if (type === "target") {
            let models = monaco?.editor?.getModels();
            if (models?.length > 0) {
                models.at(0)?.setValue(value);
            }
        }
    }

    onMount(async () => {
        let monacoEditor = await import("monaco-editor");
        loader.config({ monaco: monacoEditor.default });

        monaco = await loader.init();

        let editor = monaco.editor.create(editorContainer, options);
        let model: Monaco.editor.ITextModel;

        if (language === "mapping") {
            registerMapping(monaco);
        }
        model = monaco.editor.createModel(value, language);
        if (type === "source" || type === "mapping") {
            model.onDidChangeContent(() => {
                value = model.getValue();
            });
        }
        editor.setModel(model);
    });

    onDestroy(() => {
        monaco?.editor.getModels().forEach((model) => model.dispose());
        editor?.dispose();
    });
</script>

<div>
    <div class="container" bind:this={editorContainer}></div>
</div>

<style>
    .container {
        width: 100%;
        height: 600px;
    }
</style>
