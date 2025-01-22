import { type Mapping } from "../main.mts";
import { setEditorContent } from "./editor.mts";
import { deleteMappingLocal, getMappingLocal, upsertMappingLocal } from "./localStorage.mts";

let renamed: Mapping | null = null;

export function appendMappingLi(id: string, parent: HTMLElement, isActive: boolean, value: string) {
  let clone = makeMappingLi(id, parent, isActive, value);
  parent.appendChild(clone);
  computeMenuLocation(id);
}

export function unshiftMappingLi(id: string, parent: HTMLElement, value: string) {
  let clone = makeMappingLi(id, parent, true, value);
  let children = parent.querySelectorAll("#mappings .mapping-li");
  for (let i = 0; i < children.length; i++) {
    let li = children[i];
    li.classList.remove("active");
  }
  parent.replaceChildren(clone, ...children);
  computeAllMenus();
  renameLi(parent.children.item(0) as HTMLElement);
  renamed = getMappingLocal(id);
}

function computeMenuLocation(id: string) {
  let li = document.getElementById(id);
  if (li) {
    let optionsButton = li.querySelector<HTMLButtonElement>("button.tooltip");
    let menuPopover = li.querySelector<HTMLUListElement>("ul.menu");
    if (optionsButton && menuPopover) {
      optionsButton.popoverTargetElement = menuPopover;
      let rect = optionsButton.getBoundingClientRect();
      menuPopover.style.top = (rect.bottom - 10) + "px";
      menuPopover.style.left = (rect.right - 25) + "px";
    }
  }
}

function computeAllMenus() {
  let liElements = document.getElementsByClassName("mapping-li");
  for (let li of liElements) {
    computeMenuLocation(li.id);
  }
}

function makeMappingLi(id: string, parent: HTMLElement, isActive: boolean, value: string): HTMLElement {
  let template = document.querySelector<HTMLTemplateElement>("#mappingli-template");
  let clone = template?.content.cloneNode(true) as HTMLElement;
  let li = clone.querySelector<HTMLLIElement>("li.mapping-li");
  if (li) {
    li.id = id;
    if (isActive) li.classList.add("active");
  }
  let input = clone.querySelector("input");
  if (input) {
    input.value = value;
    input.dataset.id = id;
  }
  let menuPopover = clone.querySelector<HTMLUListElement>("ul.menu");
  let renameButton = clone.querySelector<HTMLButtonElement>("#button-rename");
  let deleteButton = clone.querySelector<HTMLButtonElement>("button.button-delete");
  if (renameButton) {
    renameButton.dataset.id = id;
    renameButton.addEventListener("click", (e: MouseEvent) => {
      let clicked = (e.target as HTMLInputElement).dataset.id;
      if (clicked) {
        renamed = getMappingLocal(clicked);
      }
      menuPopover?.hidePopover();
      if (input) {
        renameLi(li!);
      }
    });
  }
  // select mapping li and load it
  input?.addEventListener("click", async (e: MouseEvent) => {
    e.preventDefault();
    let selected = getMappingLocal(id);
    if (selected) {
      renamed = selected;
      setEditorContent(selected);
    }
    let clickedInput = e.target as HTMLInputElement;
    let children = document.querySelectorAll("#mappings .mapping-li");
    for (let i = 0; i < children.length; i++) {
      let li = children[i];
      if (li.id === clickedInput.dataset.id) {
        li.classList.add("active");
      } else {
        li.classList.remove("active");
      }
    }
  });
  input?.addEventListener("focusout", () => {
    input.type = "button";
    if (renamed) {
      renamed.text = input.value;
      upsertMappingLocal(renamed);
    }
  });
  input?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      if (input.value === "") {
        input.value = "New Mapping";
      }
      input.blur();
      if (renamed) {
        renamed.text = input.value;
        upsertMappingLocal(renamed);
      }
    }
  });
  deleteButton?.addEventListener("click", () => {
    parent.removeChild(li!);
    computeAllMenus();
    deleteMappingLocal(id);
  });
  return clone;
}

function renameLi(li: HTMLElement) {
  let input = li.querySelector("input");
  if (input) {
    input.type = "text";
    input.setSelectionRange(
      input.value.length,
      input.value.length,
    );
    input.focus({ focusVisible: true });
  }
}
