import { setEditorContent } from "./editor.mts";
import { upsertMappingLocal } from "./localStorage.mts";
import { unshiftMappingLi } from "./mappingLi.mts";

let addMapping = document.getElementById(
    "add-mapping-button",
) as HTMLButtonElement;

let mappingUl = document.getElementById("mappings") as HTMLUListElement;

export function initAddMappingButton() {
    addMapping?.addEventListener("click", (e: MouseEvent) => {
        e.stopImmediatePropagation();
        let id = crypto.randomUUID();
        let mapping = {
            id,
            mapping: "",
            source: "",
            schema: "",
            text: "",
        };
        upsertMappingLocal(mapping);
        unshiftMappingLi(mapping.id, mappingUl, mapping.text);
        setEditorContent(mapping);
    });
}
