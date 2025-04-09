import Ajv from "ajv/dist/jtd";
import { importMappingSchema, Mapping } from "../types/types.mts";
import { replaceMappings } from "./localStorage.mts";
import { loadAllMappings } from "../main.mts";

export function initImportButton() {
    let ajv = new Ajv();
    let importButton = document.getElementById("import-button") as HTMLInputElement;
    let menuPopover = document.getElementById("import-menu") as HTMLElement;

    importButton?.addEventListener("change", (e) => {
        let target = e.target as HTMLInputElement;
        if (target.files) {
            let file = target.files[0];
            if (!file) {
                alert("No file selected. Please choose a file.");
                return;
            }
            if (file.type !== "application/json") {
                alert("Unsupported file type. Please select a JSON file.");
                return;
            }
            let reader = new FileReader();
            reader.onload = () => {
                let validate = ajv.compile(importMappingSchema);
                if (reader.result) {
                    let result: Mapping[] = JSON.parse(reader.result.toString());
                    if (result) {
                        if (!validate(result)) {
                            alert("Error parsing the file.");
                            return;
                        }
                        replaceMappings(result);
                        loadAllMappings();
                    }
                }
                else {
                    alert("Error reading the file.");
                }
            }
            reader.onerror = () => {
                alert("Error reading the file.");
            }
            reader.readAsText(file);
        }
        menuPopover?.hidePopover();
        // reset value for uploading a file with the same name
        target.value = "";
    });
}
