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

    let isDarkModeEnabled = $derived(darkMode.isActive);

    let lightBackground = "bg-[#f5f5f5]";
    let darkBackground = "bg-[#1e2021]";
    function getBackground() {
        if (isDarkModeEnabled) {
            return darkBackground;
        } else {
            return lightBackground;
        }
    }
    function getPaneTypeClasses() {
        let base = "font-mono font-semibold px-5";
        if (isDarkModeEnabled) {
            return base + " text-[#e8e6e3]";
        } else {
            return base + " text-black";
        }
    }
</script>

<div class="h-[calc(100dvh-40px)]">
    <Splitpanes theme="my-theme">
        <Pane>
            <div class={getBackground()}>
                <span class={getPaneTypeClasses()}>SOURCE</span>
            </div>
            {#if isDarkModeEnabled}
                <CodeMirror
                    bind:value={inputState}
                    class="font-mono text-base h-full"
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
                    bind:value={inputState}
                    class="font-mono text-base h-full"
                    lang={json()}
                    lineWrapping={true}
                    extensions={[scrollPastEnd()]}
                />
            {/if}
        </Pane>
        <Pane>
            <div class={getBackground()}>
                <span class={getPaneTypeClasses()}>MAPPING</span>
            </div>
            {#if isDarkModeEnabled}
                <CodeMirror
                    bind:value={mappingState}
                    class="font-mono text-base h-full"
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
                    class="font-mono text-base h-full"
                    lang={javascript()}
                    lineWrapping={true}
                    extensions={[scrollPastEnd()]}
                />
            {/if}
        </Pane>
        <Pane>
            <div class={getBackground()}>
                <span class={getPaneTypeClasses()}>TARGET</span>
            </div>
            {#if isDarkModeEnabled}
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
                                "scrollbar-color": "#9ca3af rgb(54, 59, 61)",
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
                    />
                {:catch error}
                    <p class="text-red-700 text-lg">{error.message}</p>
                {/await}
            {/if}
        </Pane>
    </Splitpanes>
</div>

<style global lang="scss">
    .splitpanes.my-theme {
        .splitpanes__pane {
            background-color: #edebeb;
        }
        .splitpanes__splitter {
            background-color: #e8e6e3;
            position: relative;
            &:before {
                content: "";
                position: absolute;
                left: 0;
                top: 0;
                transition: opacity 0.4s;
                background-color: rgba(255, 0, 0, 0.3);
                opacity: 0;
                z-index: 1;
            }
            &:hover:before {
                opacity: 1;
            }
            &.splitpanes__splitter__active {
                z-index: 2; /* Fix an issue of overlap fighting with a near hovered splitter */
            }
        }
    }
    .my-theme {
        &.splitpanes--vertical > .splitpanes__splitter:before {
            left: -7px;
            right: -7px;
            height: 100%;
            cursor: col-resize;
        }
        &.splitpanes--horizontal > .splitpanes__splitter:before {
            top: -7px;
            bottom: -7px;
            width: 100%;
            cursor: row-resize;
        }
    }

    .cm-editor {
        height: 100%;
    }
</style>
