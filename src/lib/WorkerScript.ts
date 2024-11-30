//@ts-check

// adapted from https://stackoverflow.com/questions/10653809/making-webworkers-a-safe-environment/

import { mapObj } from "mappingutils";
import mappingFromString from "$lib/converter";

const allowedGlobals = new Set([
    "Array",
    "Boolean",
    "Date",
    "Error",
    "Function",
    "Infinity",
    "JSON",
    "Map",
    "Math",
    "NaN",
    "Number",
    "Object",
    "Promise",
    "RangeError",
    "ReferenceError",
    "RegExp",
    "Set",
    "String",
    "SyntaxError",
    "WeakMap",
    "WeakSet",
    "clearTimeout",
    "console",
    "isFinite",
    "isNaN",
    "parseFloat",
    "parseInt",
    "postMessage",
    "self",
    "setTimeout",
    "undefined",
]);

// Secure the environment
(function secureEnvironment() {
    const global = self;
    const prototypeChain = [global, Object.getPrototypeOf(global)];
    for (let obj of prototypeChain) {
        if (!obj) continue;
        for (let prop of Object.getOwnPropertyNames(obj)) {
            if (!allowedGlobals.has(prop)) {
                try {
                    const descriptor = Object.getOwnPropertyDescriptor(
                        obj,
                        prop
                    );
                    if (!descriptor || descriptor.configurable) {
                        Object.defineProperty(obj, prop, {
                            get: () => {
                                throw new ReferenceError(
                                    prop + " is not defined"
                                );
                            },
                            configurable: false,
                        });
                    }
                } catch {
                    try {
                        delete obj[prop];
                    } catch {
                        obj[prop] = undefined;
                    }
                }
            }
        }
    }
})();

// Message handler
self.onmessage = (event) => {
    const { source, mapping } = event.data;
    let result;

    // Wrap the dynamic code execution
    const userFunction = new Function(
        "mapObj",
        "mappingFromString",
        "source",
        "mapping",
        `
        "use strict";
        return mapObj(JSON.parse(source), mappingFromString(mapping));
      `
    );

    // Execute the user function with the required dependencies
    result = userFunction(mapObj, mappingFromString, source, mapping);
    postMessage(result);
};
