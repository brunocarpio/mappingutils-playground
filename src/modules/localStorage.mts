import { initialMappingList } from "../main.mts";
import type { Mapping } from "../types/types.mts";

export function initializeLocal() {
    let local = localStorage.getItem("mappingList");
    if (!local) {
        localStorage.setItem("mappingList", JSON.stringify(initialMappingList));
    }
    let darkMode = localStorage.getItem("darkMode");
    if (!darkMode) {
        localStorage.setItem("darkMode", "false");
    }
}

export function getDarkModeLocal() {
    let darkMode = localStorage.getItem("darkMode");
    return darkMode === "true";
}

export function toggleDarkModeLocal() {
    let darkMode = localStorage.getItem("darkMode");
    if (darkMode === "true") {
        localStorage.setItem("darkMode", "false");
    } else {
        localStorage.setItem("darkMode", "true");
    }
}

export function upsertMappingLocal(mapping: Mapping) {
    let local = localStorage.getItem("mappingList");
    if (local) {
        let mappingList = JSON.parse(local) as Mapping[];
        let index = mappingList.findIndex((m) => m.id === mapping.id);
        if (index > -1) {
            mappingList.splice(index, 1, mapping);
        } else {
            mappingList.unshift(mapping);
        }
        localStorage.setItem("mappingList", JSON.stringify(mappingList));
    } else {
        localStorage.setItem("mappingList", JSON.stringify([mapping]));
    }
}

export function getMappingLocal(id: string): Mapping | null {
    let local = localStorage.getItem("mappingList");
    if (local) {
        let mappingList = JSON.parse(local) as Mapping[];
        let index = mappingList.findIndex((m) => m.id === id);
        if (index > -1) {
            return mappingList[index];
        } else {
            return null;
        }
    } else {
        return null;
    }
}

export function getAllMappingsLocal(): Mapping[] | null {
    let local = localStorage.getItem("mappingList");
    if (local) {
        let mappingList = JSON.parse(local) as Mapping[];
        return mappingList;
    } else {
        return null;
    }
}

export function deleteMappingLocal(id: string) {
    let local = localStorage.getItem("mappingList");
    if (local) {
        let mappingList = JSON.parse(local) as Mapping[];
        let index = mappingList.findIndex((m) => m.id === id);
        if (index > -1) {
            mappingList.splice(index, 1);
            localStorage.setItem("mappingList", JSON.stringify(mappingList));
        }
    }
}

export function replaceMappings(mappings: Mapping[]) {
    localStorage.setItem("mappingList", JSON.stringify(mappings));
}
