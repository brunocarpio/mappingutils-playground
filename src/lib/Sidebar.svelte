<script>
    import { darkMode } from "$lib/shared.svelte.js";

    let isDarkModeEnabled = $derived(darkMode.isActive);

    $effect(() => {
        let sidebar = document.querySelector("aside");
        if (isDarkModeEnabled) {
            sidebar?.classList.replace("light", "dark");
        } else {
            sidebar?.classList.replace("dark", "light");
        }
    });
</script>

<aside class="light">
    <p>lol</p>
</aside>

<style>
    aside {
        background-color: var(--bg);
        color: var(--text);
        width: 34px;
        border-right: 1px solid var(--border);
    }
</style>
