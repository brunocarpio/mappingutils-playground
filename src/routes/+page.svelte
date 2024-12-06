<script lang="ts">
    import { Pane, Splitpanes } from "svelte-splitpanes";
    import sample from "$lib/sample";
    import CodeMirror from "svelte-codemirror-editor";
    import { json } from "@codemirror/lang-json";
    import { javascript } from "@codemirror/lang-javascript";
    import { scrollPastEnd } from "@codemirror/view";
    import ScriptEvaluator from "$lib/ScriptEvaluator";
    import { darkMode } from "$lib/shared.svelte.js";
    import { oneDark } from "@codemirror/theme-one-dark";

    let inputState: string = $state(sample.json);
    let mappingState: string = $state(sample.mapping);
    let resultState = $derived(computeMapping());

    let evaluator = new ScriptEvaluator();

    async function computeMapping() {
        let out = "";
        try {
            let target = await evaluator.evalAsync({
                source: inputState,
                mapping: mappingState,
            });
            out = JSON.stringify(target, null, 2);
        } catch (err: any) {
            return err.toString();
        }
        return out;
    }
</script>

<div class="h-[calc(100dvh-40px)]">
    <Splitpanes>
        <Pane>
            <span class="font-mono font-semibold px-5">SOURCE</span>
            {#if darkMode.isActive}
                <CodeMirror
                    bind:value={inputState}
                    class="font-mono text-base h-full"
                    lang={json()}
                    lineWrapping={true}
                    extensions={[scrollPastEnd()]}
                    theme={oneDark}
                    styles={{
                        "&": {
                            height: "100%",
                        },
                    }}
                />
            {:else}
                <CodeMirror
                    bind:value={inputState}
                    class="font-mono text-base h-full"
                    lang={json()}
                    lineWrapping={true}
                    extensions={[scrollPastEnd()]}
                    styles={{
                        "&": {
                            height: "100%",
                        },
                    }}
                />
            {/if}
        </Pane>
        <Pane>
            <span class="font-mono font-semibold px-5">MAPPING</span>
            {#if darkMode.isActive}
                <CodeMirror
                    bind:value={mappingState}
                    class="font-mono text-base h-full"
                    lang={javascript()}
                    lineWrapping={true}
                    extensions={[scrollPastEnd()]}
                    theme={oneDark}
                    styles={{
                        "&": {
                            height: "100%",
                        },
                    }}
                />
            {:else}
                <CodeMirror
                    bind:value={mappingState}
                    class="font-mono text-base h-full"
                    lang={javascript()}
                    lineWrapping={true}
                    extensions={[scrollPastEnd()]}
                    styles={{
                        "&": {
                            height: "100%",
                        },
                    }}
                />
            {/if}
        </Pane>
        <Pane>
            <span class="font-mono font-semibold px-5">TARGET</span>
            {#if darkMode.isActive}
                {#await resultState then result}
                    <CodeMirror
                        class="font-mono text-base h-full"
                        editable={false}
                        lang={json()}
                        lineWrapping={true}
                        extensions={[scrollPastEnd()]}
                        value={result}
                        theme={oneDark}
                        styles={{
                            "&": {
                                height: "100%",
                            },
                        }}
                    />
                {:catch error}
                    <p class="text-red-700 text-lg">{error.message}</p>
                {/await}
            {:else}
                {#await resultState then result}
                    <CodeMirror
                        class="font-mono text-base h-full"
                        editable={false}
                        lang={json()}
                        lineWrapping={true}
                        extensions={[scrollPastEnd()]}
                        value={result}
                        styles={{
                            "&": {
                                height: "100%",
                            },
                        }}
                    />
                {:catch error}
                    <p class="text-red-700 text-lg">{error.message}</p>
                {/await}
            {/if}
        </Pane>
    </Splitpanes>
</div>
