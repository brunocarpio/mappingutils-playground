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
        } catch (err: any) {
            return err.toString();
        }
        return cvalue;
    }
</script>

<div class="h-[calc(100dvh-40px)]">
    <Splitpanes>
        <Pane>
            <span class="font-mono font-semibold px-5">SOURCE</span>
            <CodeMirror
                bind:value={inputState}
                class="font-mono text-base"
                lang={json()}
                lineWrapping={true}
                styles={{
                    "&": {
                        height: "93dvh",
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
                    <span class="font-mono font-semibold px-5">MAPPING</span>
                    <CodeMirror
                        bind:value={mappingState}
                        class="font-mono text-base"
                        lang={javascript()}
                        lineWrapping={true}
                        styles={{
                            "&": {
                                height: "21dvh",
                            },
                            ".cm-content": {
                                overflow: "auto",
                            },
                        }}
                    />
                </Pane>
                <Pane>
                    <span class="font-mono font-semibold px-5">TARGET</span>
                    <CodeMirror
                        class="font-mono text-base"
                        editable={false}
                        lang={json()}
                        lineWrapping={true}
                        value={resultState}
                        styles={{
                            "&": {
                                height: "73dvh",
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
