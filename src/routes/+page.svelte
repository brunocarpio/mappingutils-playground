<script lang="ts">
    import { Pane, Splitpanes } from "svelte-splitpanes";
    import { invoiceSample, itemSample } from "$lib/samples";
    import CodeMirror from "svelte-codemirror-editor";
    import { json } from "@codemirror/lang-json";
    import { javascript } from "@codemirror/lang-javascript";
    import { scrollPastEnd } from "@codemirror/view";
    import ScriptEvaluator from "$lib/ScriptEvaluator";
    import { darkMode } from "$lib/shared.svelte.js";
    import { oneDark } from "@codemirror/theme-one-dark";
    import Aside from "$lib/Aside.svelte";

    let crypto = globalThis.crypto;

    let mappingList = $state([
        {
            id: crypto.randomUUID(),
            text: "Item",
            source: itemSample.source,
            mapping: itemSample.mapping,
        },
        {
            id: crypto.randomUUID(),
            text: "Invoice",
            source: invoiceSample.source,
            mapping: invoiceSample.mapping,
        },
    ]);

    let sourceState = $state(mappingList[0].source);
    let mappingState = $state(mappingList[0].mapping);
    let targetState = $derived(computeMapping());

    let evaluator = new ScriptEvaluator();

    let isDarkModeEnabled = $derived(darkMode.isActive);

    async function computeMapping() {
        try {
            let target = await evaluator.evalAsync({
                source: sourceState,
                mapping: mappingState,
            });
            return JSON.stringify(target, null, 2);
        } catch (err: any) {
            return err.toString();
        }
    }

    $effect(() => {
        let headers = document.querySelectorAll(".section-header");
        for (let header of headers) {
            if (isDarkModeEnabled) {
                header?.classList.replace("light", "dark");
            } else {
                header?.classList.replace("dark", "light");
            }
        }
    });
</script>

<div class="main-container">
    <Aside
        bind:mappingList
        bind:sourceState
        bind:mappingState
        darkMode={isDarkModeEnabled}
    />
    <main>
        <Splitpanes
            theme="custom-theme"
            class={isDarkModeEnabled ? "dark" : "light"}
            id="splitpanes"
        >
            <Pane>
                <div class="section-header light">
                    <span>SOURCE</span>
                </div>
                {#if isDarkModeEnabled}
                    <CodeMirror
                        bind:value={sourceState}
                        lang={json()}
                        lineWrapping={true}
                        extensions={[scrollPastEnd()]}
                        theme={oneDark}
                        styles={{
                            "&": {
                                "scrollbar-color": "#9ca3af rgb(54, 59, 61)",
                            },
                        }}
                    />
                {:else}
                    <CodeMirror
                        bind:value={sourceState}
                        lang={json()}
                        lineWrapping={true}
                        extensions={[scrollPastEnd()]}
                    />
                {/if}
            </Pane>
            <Pane>
                <div class="section-header light">
                    <span>MAPPING</span>
                </div>
                {#if isDarkModeEnabled}
                    <CodeMirror
                        bind:value={mappingState}
                        lang={javascript()}
                        lineWrapping={true}
                        extensions={[scrollPastEnd()]}
                        theme={oneDark}
                        styles={{
                            "&": {
                                "scrollbar-color": "#9ca3af rgb(54, 59, 61)",
                            },
                        }}
                    />
                {:else}
                    <CodeMirror
                        bind:value={mappingState}
                        lang={javascript()}
                        lineWrapping={true}
                        extensions={[scrollPastEnd()]}
                    />
                {/if}
            </Pane>
            <Pane>
                <div class="section-header light">
                    <span>TARGET</span>
                </div>
                {#if isDarkModeEnabled}
                    {#await targetState then target}
                        <CodeMirror
                            editable={false}
                            lang={json()}
                            lineWrapping={true}
                            extensions={[scrollPastEnd()]}
                            value={target}
                            theme={oneDark}
                            styles={{
                                "&": {
                                    "scrollbar-color":
                                        "#9ca3af rgb(54, 59, 61)",
                                },
                            }}
                        />
                    {:catch error}
                        <p>{error.message}</p>
                    {/await}
                {:else}
                    {#await targetState then target}
                        <CodeMirror
                            editable={false}
                            lang={json()}
                            lineWrapping={true}
                            extensions={[scrollPastEnd()]}
                            value={target}
                        />
                    {:catch error}
                        <p>{error.message}</p>
                    {/await}
                {/if}
            </Pane>
        </Splitpanes>
    </main>
</div>

<style>
    main {
        height: calc(100dvh - 40px);
        width: 100%;
    }
    .section-header {
        background-color: var(--bg);
        color: var(--text);
        height: 28px;
        padding-left: 20px;
        position: relative;
    }
    .section-header span {
        font-family: var(--font-mono);
        font-weight: bold;
        position: absolute;
        top: 4px;
    }
    .main-container {
        display: flex;
        width: 100%;
    }
</style>
