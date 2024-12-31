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
    import MappingLi from "$lib/MappingLi.svelte";

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

    let mappingList = [
        {
            id: 0,
            text: "Item",
            source: itemSample.source,
            mapping: itemSample.mapping,
        },
        {
            id: 1,
            text: "Invoice",
            source: invoiceSample.source,
            mapping: invoiceSample.mapping,
        },
    ];

    let sourceState = $state(mappingList[0].source);
    let mappingState = $state(mappingList[0].mapping);
    let targetState = $derived(computeMapping());

    function setActiveMapping(text: string) {
        let ul = document.querySelector("#mappings");
        if (ul?.children) {
            for (let li of ul.children) {
                let textButton = li.firstElementChild;
                if (textButton?.textContent === text) {
                    li.classList.add("active");
                } else {
                    li.classList.remove("active");
                }
            }
        }
    }

    function loadMapping(event: Event) {
        let button = event.target as HTMLButtonElement;
        if (button && button.textContent && button.parentElement) {
            setActiveMapping(button.textContent);
            let selected;
            for (let mapping of mappingList) {
                if (mapping.text === button.textContent) {
                    selected = mapping;
                }
            }
            if (selected) {
                sourceState = selected.source;
                mappingState = selected.mapping;
            }
        }
    }

    let evaluator = new ScriptEvaluator();

    let isDarkModeEnabled = $derived(darkMode.isActive);

    $effect(() => {
        let headers = document.querySelectorAll(".section-header");
        let splitpanes = document.querySelector("#splitpanes");
        let sidebar = document.querySelector("aside");
        let elements = [...headers, splitpanes, sidebar];
        for (let element of elements) {
            if (isDarkModeEnabled) {
                element?.classList.replace("light", "dark");
            } else {
                element?.classList.replace("dark", "light");
            }
        }
    });
</script>

<div class="main-container">
    <aside class="light">
        <ul id="mappings">
            {#each mappingList as mapping, i (mapping.id)}
                <MappingLi
                    text={mapping.text}
                    active={i === 0 ? true : false}
                    loadHandler={loadMapping}
                />
            {/each}
        </ul>
    </aside>
    <main>
        <Splitpanes theme="custom-theme" class="light" id="splitpanes">
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
        padding-left: 20px;
        height: 28px;
        position: relative;
    }
    .section-header span {
        font-family: var(--font-mono);
        font-weight: bold;
        position: absolute;
        top: 4px;
    }
    .main-container {
        width: 100%;
        display: flex;
    }
    aside {
        background-color: var(--bg);
        width: 150px;
        border-right: 1px solid var(--border);
        padding: 20px 5px;
    }
    aside ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }
</style>
