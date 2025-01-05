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
            class={isDarkModeEnabled ? "dark" : "light"}
            id="splitpanes"
            theme="custom-theme"
        >
            <Pane>
                <div
                    class="section-header {isDarkModeEnabled
                        ? 'dark'
                        : 'light'}"
                >
                    <span>SOURCE</span>
                </div>
                <CodeMirror
                    bind:value={sourceState}
                    lang={json()}
                    lineWrapping={true}
                    extensions={[scrollPastEnd()]}
                    theme={isDarkModeEnabled ? oneDark : null}
                    styles={isDarkModeEnabled
                        ? {
                              "&": {
                                  "scrollbar-color": "#9ca3af rgb(54, 59, 61)",
                              },
                          }
                        : null}
                />
            </Pane>
            <Pane>
                <div
                    class="section-header {isDarkModeEnabled
                        ? 'dark'
                        : 'light'}"
                >
                    <span>MAPPING</span>
                </div>
                <CodeMirror
                    bind:value={mappingState}
                    lang={javascript()}
                    lineWrapping={true}
                    extensions={[scrollPastEnd()]}
                    theme={isDarkModeEnabled ? oneDark : null}
                    styles={isDarkModeEnabled
                        ? {
                              "&": {
                                  "scrollbar-color": "#9ca3af rgb(54, 59, 61)",
                              },
                          }
                        : null}
                />
            </Pane>
            <Pane>
                <div
                    class="section-header {isDarkModeEnabled
                        ? 'dark'
                        : 'light'}"
                >
                    <span>TARGET</span>
                </div>
                {#await targetState then target}
                    <CodeMirror
                        editable={false}
                        lang={json()}
                        lineWrapping={true}
                        extensions={[scrollPastEnd()]}
                        value={target}
                        theme={isDarkModeEnabled ? oneDark : null}
                        styles={isDarkModeEnabled
                            ? {
                                  "&": {
                                      "scrollbar-color":
                                          "#9ca3af rgb(54, 59, 61)",
                                  },
                              }
                            : null}
                    />
                {:catch error}
                    <p>{error.message}</p>
                {/await}
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
