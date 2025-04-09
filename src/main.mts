import "./styles/aside.css";
import "./styles/base.css";
import "./styles/main.css";
import "./styles/navbar.css";

import { invoiceSample, itemSample } from "./samples.mts";
import {
    initEditor,
    setEditorContent,
} from "./modules/editor.mts";
import {
    getAllMappingsLocal,
    initializeLocal,
} from "./modules/localStorage.mts";
import type { Mapping } from "./types/types.mjs";
import { initButtonDarkMode } from "./modules/darkModeButton.mts";
import { initAddMappingButton } from "./modules/addMappingButton.mts";
import { initMappingUl } from "./modules/mappingUl.mts";
import { initExportButton } from "./modules/exportButton.mts";
import { initImportButton } from "./modules/importButton.mts";

export let initialMappingList: Mapping[] = [
    {
        id: "56c91a03-95a7-4928-9a4d-85486b1f3ec1",
        text: "Item",
        schema: itemSample.schema,
        source: itemSample.source,
        mapping: itemSample.mapping,
    },
    {
        id: "eb631d1c-170f-4aec-a368-2ac7a0b0516b",
        text: "Invoice",
        schema: invoiceSample.schema,
        source: invoiceSample.source,
        mapping: invoiceSample.mapping,
    },
];

export function loadAllMappings() {
    let list = getAllMappingsLocal();
    if (list && list[0]) {
        setEditorContent(list[0]);
    }
}

window.onload = (_) => {
    initButtonDarkMode();
    initAddMappingButton();
    initializeLocal();
    initExportButton();
    initImportButton();
    initEditor();
    initMappingUl();
    loadAllMappings();
};
