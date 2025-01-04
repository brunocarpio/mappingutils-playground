<script lang="ts">
    import MappingLi from "$lib/MappingLi.svelte";

    interface Mapping {
        id: string;
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
    let crypto = globalThis.crypto;

    let addingMapping = $state(false);

    function addMapping() {
        let id = crypto.randomUUID();
        mappingList.unshift({
            id,
            mapping: "",
            source: "",
            text: "",
        });
        loadMappingId(id);
        addingMapping = true;
    }

    function deleteMapping(id: string) {
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
        let selected = mappingList.find((mapping) => mapping.id === id);
        if (selected) {
            sourceState = selected.source;
            mappingState = selected.mapping;
        }
    }

    function setActiveMapping(id: string) {
        let ul = document.querySelector("#mappings");
        if (ul?.children) {
            for (let li of ul.children) {
                let textButton = li.firstElementChild as HTMLInputElement;
                if (textButton?.dataset.id === id) {
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

    $effect(() => {
        if (addingMapping) {
            mappingLiGroup[0].renameHandler();
            addingMapping = false;
        }
    });
</script>

<aside class={darkMode ? "dark" : "light"}>
    <div>
        <button aria-label="Add New Mapping" onclick={addMapping}>
            <svg
                viewBox="0 0 24 24"
                width="25px"
                height="25px"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z"
                ></path>
                <path
                    d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13"
                ></path>
            </svg>
        </button>
    </div>
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
        padding: 15px 5px;
        width: 150px;
    }
    aside ul {
        list-style: none;
        margin: 0;
        padding: 0;
        width: inherit;
    }
    aside div {
        display: flex;
        justify-content: end;
        margin-bottom: 15px;
    }
    aside div button {
        background: none;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        padding: 8px;
        position: relative;
    }
    aside div button:hover {
        background-color: rgb(from var(--btn-hover) r g b / 0.5);
    }
    aside div svg {
        width: 20px;
        height: 20px;
    }
    aside div svg path {
        stroke: var(--text);
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
</style>
