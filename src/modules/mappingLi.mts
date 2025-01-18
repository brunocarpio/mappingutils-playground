import { mappingList } from "../main.mts";
import { updateCenterEditorContent, updateLeftEditorContent } from "./editor.mts";

let selected;

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
  }
  let menuPopover = clone.querySelector<HTMLUListElement>("ul.menu");
  let renameButton = clone.querySelector("#button-rename");
  let deleteButton = clone.querySelector("button.button-delete");
  renameButton?.addEventListener("click", () => {
    menuPopover?.hidePopover();
    if (input) {
      renameLi(li!);
    }
  });
  input?.addEventListener("click", (e: MouseEvent) => {
    e.preventDefault();
    console.log("CLICKED");
    selected = mappingList.find((mapping) => mapping.id === id);
    console.log("selected", selected);
    updateLeftEditorContent(selected?.source);
    updateCenterEditorContent(selected?.mapping);
  });
  input?.addEventListener("focusout", () => {
    input.type = "button";
  });
  input?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      if (input.value === "") {
        input.value = "New Mapping";
      }
      input.blur();
    }
  });
  deleteButton?.addEventListener("click", () => {
    parent.removeChild(li!);
    computeAllMenus();
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
