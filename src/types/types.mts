export interface Mapping {
    id: string;
    text: string;
    schema: string;
    source: string;
    mapping: string;
}

export let importMappingSchema = {
    elements: {
        properties: {
            id: { type: "string" },
            text: { type: "string" },
            schema: { type: "string" },
            source: { type: "string" },
            mapping: { type: "string" },
        }
    }
};
