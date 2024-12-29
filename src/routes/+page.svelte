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
            {#each mappingList as mapping, i}
                <li class={i === 0 ? "active mapping-li" : "mapping-li"}>
                    <button onclick={loadMapping} class="mapping-text">
                        {mapping.text}
                    </button>
                    <button class="tooltip"> &#x22EE; </button>
                    <span class="tooltip-text">Options</span>
                    <ul class="menu_dropdown">
                        <li>
                            <button>Rename</button>
                        </li>
                        <li>
                            <button class="btn-delete">Delete</button>
                        </li>
                    </ul>
                </li>
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
    aside ul li.mapping-li {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        background: none;
        transition: background-color 0.3s;
        border-radius: 8px;
        cursor: pointer;
        position: relative;
    }
    aside ul li.mapping-li:hover {
        background-color: rgb(from var(--btn-hover) r g b / 0.5);
    }
    aside ul li.mapping-li.active {
        background-color: var(--btn-hover);
    }
    aside ul li button.mapping-text {
        width: 100%;
    }
    aside ul li button {
        background: none;
        border: none;
        color: var(--text);
        cursor: pointer;
        padding: 10px;
        text-align: left;
        transition: background-color 0.3s;
    }
    aside ul li button.tooltip + span.tooltip-text {
        background-color: var(--gray9);
        border-radius: 6px;
        border: 1px solid var(--border);
        bottom: 125%;
        color: var(--gray0);
        font-size: 14px;
        font-weight: 600;
        left: 90%;
        margin-left: -35px;
        opacity: 0;
        padding: 6px 0;
        position: absolute;
        text-align: center;
        transition: opacity 0.3s;
        visibility: hidden;
        width: 70px;
        z-index: 1;
    }
    aside ul li button.tooltip + span.tooltip-text::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: var(--gray7) transparent transparent transparent;
    }
    aside ul li button.tooltip:hover + span.tooltip-text {
        visibility: visible;
        opacity: 1;
    }

    aside ul li ul.menu_dropdown {
        background-color: var(--border);
        border-radius: 16px;
        border: 1px solid var(--menu-border);
        top: 70%;
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
        color: var(--text);
        left: 80%;
        list-style: none;
        margin: 3px 0 0 0;
        padding: 10px;
        position: absolute;
        transition: opacity 0.3s;
        visibility: hidden;
        width: 100px;
        z-index: 1;
    }
    aside ul li button.tooltip:focus ~ ul.menu_dropdown {
        visibility: visible;
    }
    aside ul li ul.menu_dropdown li {
        border-radius: 4px;
        margin: 0;
    }
    aside ul li ul.menu_dropdown li:hover {
        background-color: var(--menu-border);
    }
    .btn-delete {
        color: var(--red);
    }
</style>
