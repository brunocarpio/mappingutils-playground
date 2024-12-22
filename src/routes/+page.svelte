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

    $effect(() => {
        let headers = document.querySelectorAll(".section-header");
        for (let header of headers) {
            if (isDarkModeEnabled) {
                header.classList.replace("light", "dark");
            } else {
                header.classList.replace("dark", "light");
            }
        }
    });
</script>

<main>
    <Splitpanes theme="custom-theme">
        <Pane>
            <div class="section-header light">
                <span>SOURCE</span>
                <select
                    name="sample"
                    bind:value={selectedState}
                    onchange={handleSelectionChange}
                >
                    {#each sampleOptions as option}
                        <option value={option.value}>{option.value}</option>
                    {/each}
                </select>
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
                                "scrollbar-color": "#9ca3af rgb(54, 59, 61)",
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

<style>
    main {
        height: calc(100dvh - 40px);
    }
    .section-header {
        background-color: var(--bg);
        color: var(--text);
        padding-left: 20px;
        padding-right: 15px;
        height: 28px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .section-header span {
        font-family: "Liberation Mono", "Courier New", monospace;
        font-weight: bold;
    }
    .section-header select {
        background-color: var(--bg);
        color: var(--text);
        border-color: var(--bg);
        font: inherit;
    }
</style>
