<script lang="ts">
    import type { MouseEventHandler } from "svelte/elements";

    interface Props {
        active: boolean;
        id: number;
        loadHandler: MouseEventHandler<HTMLElement>;
        text: string;
    }

    let { text = $bindable(), active, loadHandler, id }: Props = $props();

    let menu: HTMLUListElement;
    let popoverButton: HTMLButtonElement;
    let textButton: HTMLInputElement;

    $effect(() => {
        popoverButton.popoverTargetElement = menu;
        let rect = popoverButton.getBoundingClientRect();
        menu.style.top = `${rect.bottom - 10}px`;
        menu.style.left = `${rect.right - 25}px`;
    });

    function renameHandler() {
        menu.hidePopover();
        textButton.type = "text";
        textButton.setSelectionRange(
            textButton.value.length,
            textButton.value.length,
        );
        textButton.focus({ focusVisible: true });
    }

    function focusOutHandler() {
        textButton.type = "button";
    }

    function keyDownHandler(e: KeyboardEvent) {
        if (e.key === "Enter") {
            textButton.blur();
        }
    }

    function changeHandler() {
        if (text === "") {
            text = "New Mapping";
        }
    }
</script>

<li class="mapping-li" class:active>
    <input
        bind:this={textButton}
        bind:value={text}
        class="button-text"
        data-id={id}
        onclick={loadHandler}
        onfocusout={focusOutHandler}
        onkeydown={keyDownHandler}
        onchange={changeHandler}
        placeholder="New Mapping"
        size=20
        type="button"
    />
    <button
        aria-label="options-button"
        bind:this={popoverButton}
        class="tooltip"
    >
        <svg
            fill="currentColor"
            height="18"
            transform="translate(0 4)"
            viewBox="0 0 30 30"
            width="18"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
        </svg>
    </button>
    <span class="tooltip-text">Options</span>
    <ul class="menu" popover="auto" bind:this={menu}>
        <li>
            <button onclick={renameHandler}>Rename</button>
        </li>
        <li>
            <button class="button-delete">Delete</button>
        </li>
    </ul>
</li>

<style>
    button,
    input.button-text {
        background: none;
        border: none;
        color: var(--text);
        cursor: pointer;
        padding: 10px;
        text-align: left;
        transition: background-color 0.3s;
    }
    input.button-text {
        width: 70%;
    }
    li.mapping-li {
        background: none;
        border-radius: 8px;
        display: flex;
        margin-bottom: 10px;
        position: relative;
        transition: background-color 0.3s;
        width: inherit;
    }
    li.mapping-li:hover {
        background-color: rgb(from var(--btn-hover) r g b / 0.5);
    }
    li.mapping-li.active {
        background-color: var(--btn-hover);
    }
    span.tooltip-text {
        background-color: var(--gray9);
        border-radius: 6px;
        border: 1px solid var(--border);
        bottom: 125%;
        color: var(--gray0);
        font-size: 14px;
        font-weight: 600;
        left: 82%;
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
    span.tooltip-text::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: var(--gray7) transparent transparent transparent;
    }
    button.tooltip:hover + span.tooltip-text {
        visibility: visible;
        opacity: 1;
    }

    ul.menu {
        background-color: var(--border);
        border-radius: 16px;
        border: 1px solid var(--menu-border);
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
        color: var(--text);
        inset: auto;
        list-style: none;
        padding: 10px;
        position: absolute;
        transition: opacity 0.3s;
        width: 100px;
    }
    ul.menu li button {
        border-radius: 4px;
        width: 100%;
    }
    ul.menu li button:hover {
        background-color: var(--menu-border);
    }
    button.button-delete {
        color: var(--red);
    }
</style>
