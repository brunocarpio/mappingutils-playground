<script>
    import ghCat from "$lib/assets/github-mark.svg";
    import npmLogo from "$lib/assets/npm.svg";
    import { darkMode } from "$lib/shared.svelte.js";
    function handlePress() {
        darkMode.isActive = !darkMode.isActive;
    }
</script>

<nav>
    <ul>
        <li class="nav-title">mappingutils</li>
        <li class="nav-links">
            <button onclick={handlePress}>
                {#if darkMode.isActive}
                    <svg xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M7 0h2v2H7zM12.88 1.637l1.414 1.415-1.415 1.413-1.413-1.414zM14 7h2v2h-2zM12.95 14.433l-1.414-1.413 1.413-1.415 1.415 1.414zM7 14h2v2H7zM2.98 14.364l-1.413-1.415 1.414-1.414 1.414 1.415zM0 7h2v2H0zM3.05 1.706 4.463 3.12 3.05 4.535 1.636 3.12z"
                        />
                        <path
                            d="M8 4C5.8 4 4 5.8 4 8s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4Z"
                        />
                    </svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M6.2 1C3.2 1.8 1 4.6 1 7.9 1 11.8 4.2 15 8.1 15c3.3 0 6-2.2 6.9-5.2C9.7 11.2 4.8 6.3 6.2 1Z"
                        />
                        <path
                            d="M12.5 5a.625.625 0 0 1-.625-.625 1.252 1.252 0 0 0-1.25-1.25.625.625 0 1 1 0-1.25 1.252 1.252 0 0 0 1.25-1.25.625.625 0 1 1 1.25 0c.001.69.56 1.249 1.25 1.25a.625.625 0 1 1 0 1.25c-.69.001-1.249.56-1.25 1.25A.625.625 0 0 1 12.5 5Z"
                        />
                    </svg>
                {/if}
            </button>
            <a href="https://www.npmjs.com/package/mappingutils" target="_blank"
                ><img src={npmLogo} width={50} alt="npm logo" /></a
            >
            <a
                href="https://github.com/brunocarpio/mappingutils"
                target="_blank"
                ><img src={ghCat} alt="github cat logo" width={30} /></a
            >
        </li>
    </ul>
</nav>

<style>
    nav {
        height: 40px;
        width: 100%;
        background-color: var(--blue);
    }
    nav ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
        padding-left: 20px;
        padding-right: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100%;
    }
    .nav-title {
        font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            "Open Sans",
            "Helvetica Neue",
            sans-serif;
        font-size: 18px;
        font-weight: 600;
        color: var(--gray2);
    }
    .nav-links {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    .nav-links a {
        display: block;
    }
    .nav-links button {
        background: none;
        border: none;
        position: relative;
        cursor: pointer;
    }
    .nav-links svg {
        display: block;
        width: 16px;
        height: 16px;
    }
    .nav-links path {
        fill: var(--gray0);
    }
</style>
