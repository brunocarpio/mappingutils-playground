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

    let sampleOptions = [
        {
            value: "Item",
            source: itemSample.source,
            mapping: itemSample.mapping,
        },
        {
            value: "Invoice",
            source: invoiceSample.source,
            mapping: invoiceSample.mapping,
        },
    ];

    let selectedState = $state(sampleOptions[0].value);
    let sourceState = $state(sampleOptions[0].source);
    let mappingState = $state(sampleOptions[0].mapping);
    let targetState = $derived(computeMapping());

    function handleSelectionChange(event: Event) {
        let selected = sampleOptions.find(
            (option) =>
                option.value === (event.target as HTMLSelectElement).value,
        );
        sourceState = selected ? selected.source : "";
        mappingState = selected ? selected.mapping : "";
    }

    let evaluator = new ScriptEvaluator();

    let isDarkModeEnabled = $derived(darkMode.isActive);

    let lightBackground = "bg-[#f5f5f5]";
    let darkBackground = "bg-[#1e2021]";
    let textGray = "text-[#e8e6e3]";
    function getBackground() {
        if (isDarkModeEnabled) {
            return darkBackground;
        } else {
            return lightBackground;
        }
    }
    function getTypeStyle() {
        let base = "font-mono font-semibold px-5";
        if (isDarkModeEnabled) {
            return base + " " + textGray;
        } else {
            return base + " text-black";
        }
    }
    function getSelectStyle() {
        if (isDarkModeEnabled) {
            return "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500";
        } else {
            return "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500";
        }
    }
</script>

<div class="h-[calc(100dvh-40px)]">
    <Splitpanes theme="my-theme">
        <Pane>
            <div
                class="flex justify-between items-center pr-6 h-7 {getBackground()}"
            >
                <span class={getTypeStyle()}>SOURCE</span>
                <select
                    name="sample"
                    bind:value={selectedState}
                    onchange={handleSelectionChange}
                    class={getSelectStyle()}
                >
                    {#each sampleOptions as option}
                        <option value={option.value}>{option.value}</option>
                    {/each}
                </select>
            </div>
            {#if isDarkModeEnabled}
                <CodeMirror
                    bind:value={sourceState}
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
                    bind:value={sourceState}
                    class="font-mono text-base h-full"
                    lang={json()}
                    lineWrapping={true}
                    extensions={[scrollPastEnd()]}
                />
            {/if}
        </Pane>
        <Pane>
            <div class={getBackground()}>
                <span class={getTypeStyle()}>MAPPING</span>
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
                <span class={getTypeStyle()}>TARGET</span>
            </div>
            {#if isDarkModeEnabled}
                {#await targetState then target}
                    <CodeMirror
                        class="font-mono text-base h-full"
                        editable={false}
                        lang={json()}
                        lineWrapping={true}
                        extensions={[scrollPastEnd()]}
                        value={target}
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
                {#await targetState then target}
                    <CodeMirror
                        class="font-mono text-base h-full"
                        editable={false}
                        lang={json()}
                        lineWrapping={true}
                        extensions={[scrollPastEnd()]}
                        value={target}
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
