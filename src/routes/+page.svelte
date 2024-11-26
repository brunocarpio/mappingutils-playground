<script lang="ts">
    import Editor from "./Editor.svelte";
    import { Pane, Splitpanes } from "svelte-splitpanes";
    import sample from "$lib/sample";
    import { mapObj } from "mappingutils";
    import mappingFromString from "$lib/converter";

    let inputState: string = $state(sample.json);
    let mappingState: string = $state(sample.mapping);
    let resultState = $derived(computeMapping());

    function computeMapping() {
        let cvalue = "";
        let mapping = mappingFromString(mappingState);
        try {
            cvalue = JSON.stringify(
                mapObj(JSON.parse(inputState), mapping),
                null,
                2
            );
        } catch (err) {
            console.log(err);
        }
        return cvalue;
    }
</script>

<h1>Hello world</h1>

<div class="h-dvh">
    <Splitpanes>
        <Pane>
            <Editor bind:value={inputState} type={"source"} />
        </Pane>
        <Pane>
            <Splitpanes horizontal={true}>
                <Pane>
                    <Editor bind:value={mappingState} type={"mapping"} />
                </Pane>
                <Pane>
                    <Editor value={resultState} type={"target"} />
                </Pane>
            </Splitpanes>
        </Pane>
    </Splitpanes>
</div>
