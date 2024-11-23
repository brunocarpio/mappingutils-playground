<script lang="ts">
    import Monaco from "./Monaco.svelte";
    import { Pane, Splitpanes } from "svelte-splitpanes";
    import sample from "$lib/sample";
    import { mapObj } from "mappingutils";

    let inputState: string = $state(sample.json);
    let mappingState: string = $state(sample.mapping);
    let resultState = $derived(
        JSON.stringify(
            mapObj(JSON.parse(inputState), mappingFromString(mappingState)),
            null,
            2
        )
    );

    function mappingFromString(mappingState: string) {
        let lines = mappingState.slice(1, -1).split(",");
        let arr = [];
        for (let line of lines) {
            let ltrimed = line.trim();
            if (ltrimed) {
                let [k, v] = ltrimed.split(":");
                k = k.trim().slice(1, -1);
                v = v.trim().slice(1, -1);
                arr.push([k, v]);
            } else {
                continue;
            }
        }
        return Object.fromEntries(arr);
    }
</script>

<div class="h-screen place-content-center">
    <div class="h-2/5">
        <Splitpanes>
            <Pane>
                <Monaco
                    bind:value={inputState}
                    language={"json"}
                    type={"source"}
                />
            </Pane>
            <Pane>
                <Monaco
                    value={mappingState}
                    language={"mapping"}
                    type={"mapping"}
                />
            </Pane>
            <Pane>
                <Monaco value={resultState} language={"json"} type={"target"} />
            </Pane>
        </Splitpanes>
    </div>
</div>
