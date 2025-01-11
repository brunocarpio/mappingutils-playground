export function appendMappingLi(id: string, parent: HTMLElement, isActive: boolean, value: string) {
  let template = document.querySelector<HTMLTemplateElement>("#mappingli-template");
  if (template) {
    let clone = template.content.cloneNode(true) as HTMLElement;
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
        input.type = "text";
        input.setSelectionRange(
          input.value.length,
          input.value.length,
        );
        input.focus({ focusVisible: true });
      }
    });
    input?.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (input.value === "") {
          input.value = "New Mapping";
        }
        input.blur();
      }
    });
    input?.addEventListener("focusout", () => {
      input.type = "button";
    });
    deleteButton?.addEventListener("click", () => {
      parent.removeChild(li!);
      let liElements = parent.getElementsByClassName("mapping-li");
      for (let li of liElements) {
        computeMenuLocation(li.id);
      }
    });
    parent.appendChild(clone);
    computeMenuLocation(id);
  }
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
