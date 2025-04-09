import { getAllMappingsLocal } from "./localStorage.mts";
import { appendMappingLi } from "./mappingLi.mts";

let mappingUl = document.getElementById("mappings") as HTMLUListElement;

export function initMappingUl() {
    if (mappingUl) {
        let list = getAllMappingsLocal();
        if (list) {
            for (let i = 0; i < list.length; i++) {
                let mapping = list[i];
                appendMappingLi(mapping.id, mappingUl, i === 0, mapping.text);
            }
        }
    }
}
