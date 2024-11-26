<script lang="ts">
    import hljs from "highlight.js/lib/core";
    import json from "highlight.js/lib/languages/json";
    import "highlight.js/styles/github-dark-dimmed.css";

    hljs.registerLanguage("json", json);

    let { value = $bindable(), type }: { value: string; type: string } =
        $props();

    let codeElement: HTMLElement = $state();

    $effect(() => {
        hljs.highlightElement(codeElement);
    });

    function handleInput() {
        value = codeElement.innerText;
    }

    $effect(() => {
        if (value && type === "target") {
            handleUpdateInProps();
        }
    });

    function handleUpdateInProps() {
        if (type === "target") {
            codeElement.innerHTML = value;
        }
    }
</script>

<div class="h-full">
    {#if type !== "target"}
        <pre class="h-full"><code
                bind:this={codeElement}
                class="h-full rounded-lg border border-gray-300 focus:ring-gray-400 focus:border-gray-500"
                contenteditable={true}
                oninput={handleInput}
                >{value}
        </code></pre>
    {:else}
        <pre class="h-full"><code
                bind:this={codeElement}
                class="language-json h-full rounded-lg border border-gray-300 focus:ring-gray-400 focus:border-gray-500"
                >{value}
        </code></pre>
    {/if}
</div>

<style>
    code {
        display: inline-block;
    }
</style>
