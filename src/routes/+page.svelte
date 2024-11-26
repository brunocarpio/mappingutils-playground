<script lang="ts">
    import { Pane, Splitpanes } from "svelte-splitpanes";
    import sample from "$lib/sample";
    import { mapObj } from "mappingutils";
    import mappingFromString from "$lib/converter";
    import CodeMirror from "svelte-codemirror-editor";
    import { json } from "@codemirror/lang-json";
    import { javascript } from "@codemirror/lang-javascript";

    let inputState: string = $state(sample.json);
    let mappingState: string = $state(sample.mapping);
    let resultState = $derived(computeMapping());

    function computeMapping() {
        let cvalue = "";
        let mapping = mappingFromString(mappingState);
        try {
            cvalue = JSON.stringify(
                mapObj(JSON.parse(inputState), mapping),
                null,
                2
            );
        } catch (err) {
            console.log(err);
        }
        return cvalue;
    }
</script>

<h1>Hello world</h1>

<div class="h-dvh">
    <Splitpanes>
        <Pane>
            <CodeMirror
                bind:value={inputState}
                class="font-mono text-base"
                lang={json()}
                lineWrapping={true}
                styles={{
                    "&": {
                        height: "100dvh",
                    },
                    ".cm-content": {
                        overflow: "auto",
                    },
                }}
            />
        </Pane>
        <Pane>
            <Splitpanes horizontal={true}>
                <Pane size={25}>
                    <CodeMirror
                        bind:value={mappingState}
                        class="font-mono text-base"
                        lang={javascript()}
                        lineWrapping={true}
                        styles={{
                            "&": {
                                height: "25dvh",
                            },
                            ".cm-content": {
                                overflow: "auto",
                            },
                        }}
                    />
                </Pane>
                <Pane>
                    <CodeMirror
                        class="font-mono text-base"
                        editable={false}
                        lang={json()}
                        lineWrapping={true}
                        value={resultState}
                        styles={{
                            "&": {
                                height: "75dvh",
                            },
                            ".cm-content": {
                                overflow: "auto",
                            },
                        }}
                    />
                </Pane>
            </Splitpanes>
        </Pane>
    </Splitpanes>
</div>
