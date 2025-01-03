<script lang="ts">
    import MappingLi from "$lib/MappingLi.svelte";

    interface Mapping {
        id: number;
        mapping: string;
        source: string;
        text: string;
    }

    interface Props {
        darkMode: boolean;
        mappingList: Mapping[];
        mappingState: string;
        sourceState: string;
    }

    let {
        darkMode,
        mappingList = $bindable(),
        mappingState = $bindable(),
        sourceState = $bindable(),
    }: Props = $props();

    let _refs: MappingLi[] = $state([]);
    let mappingLiGroup = $derived(_refs.filter(Boolean));

    function deleteMapping(id: number) {
        let i = 0;
        for (i = 0; i < mappingList.length; i++) {
            if (mappingList[i].id === id) {
                mappingList.splice(i, 1);
                break;
            }
        }
        let j = i % mappingList.length;
        if (mappingList[j]) {
            loadMappingId(mappingList[j].id.toString());
        }
    }

    function loadMapping(event: Event) {
        let button = event.target as HTMLInputElement;
        let id = button.dataset.id ?? "";
        if (button && button.value && button.parentElement) {
            loadMappingId(id);
        }
    }

    function loadMappingId(id: string) {
        setActiveMapping(id);
        let selected = mappingList.find(
            (mapping) => mapping.id === Number.parseInt(id),
        );
        if (selected) {
            sourceState = selected.source;
            mappingState = selected.mapping;
        }
    }

    function setActiveMapping(index: string) {
        let ul = document.querySelector("#mappings");
        if (ul?.children) {
            for (let li of ul.children) {
                let textButton = li.firstElementChild as HTMLInputElement;
                if (textButton?.dataset.id === index) {
                    li.classList.add("active");
                } else {
                    li.classList.remove("active");
                }
            }
        }
    }

    $effect(() => {
        for (let mapping of mappingLiGroup) {
            mapping.computeMenuLocation();
        }
    });
</script>

<aside class={darkMode ? "dark" : "light"}>
    <ul id="mappings">
        {#each mappingList as mapping, i (mapping.id)}
            <MappingLi
                active={i === 0 ? true : false}
                bind:text={mapping.text}
                bind:this={_refs[i]}
                deleteHandler={() => deleteMapping(mapping.id)}
                id={mapping.id}
                loadHandler={loadMapping}
            />
        {/each}
    </ul>
</aside>

<style>
    aside {
        background-color: var(--bg);
        border-right: 1px solid var(--border);
        padding: 20px 5px;
        width: 150px;
    }
    aside ul {
        list-style: none;
        margin: 0;
        padding: 0;
        width: inherit;
    }
</style>
