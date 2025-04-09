import { getAllMappingsLocal } from "./localStorage.mts";

let exportButton = document.getElementById("export-button") as HTMLButtonElement;
let menuPopover = document.getElementById("import-menu") as HTMLElement;


export function initExportButton() {
    exportButton?.addEventListener("click", () => {
        let mappings = getAllMappingsLocal();

        if (mappings) {
            let temp = document.createElement("a");
            let data = "text/json;charset=utf-8,"
                + encodeURIComponent(JSON.stringify(mappings, null, 4));
            temp.setAttribute("href", "data:" + data);
            let date = new Date().toISOString().substring(0, 10);
            temp.setAttribute("download", `mapping-${date}.json`);
            temp.click();
        }

        menuPopover?.hidePopover();
    });
}
