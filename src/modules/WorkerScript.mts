// adapted from https://stackoverflow.com/questions/10653809/making-webworkers-a-safe-environment/

import { mapObj } from "mappingutils";
import evaluateMapping from "./lib.mts";

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
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "postMessage",
  "self",
  "setTimeout",
  "undefined",
]);

(function secureEnvironment() {
  const global = self;
  const prototypeChain = [global, Object.getPrototypeOf(global)];
  for (let obj of prototypeChain) {
    if (!obj) continue;
    for (let prop of Object.getOwnPropertyNames(obj)) {
      if (!allowedGlobals.has(prop)) {
        try {
          const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
          if (!descriptor || descriptor.configurable) {
            Object.defineProperty(obj, prop, {
              get: () => {
                throw new ReferenceError(prop + " is not defined");
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

self.onmessage = (event) => {
  let { source, mapping } = event.data;
  try {
    let userFunction = new Function(
      "mapObj",
      "evaluateMapping",
      "source",
      "mapping",
      `
      "use strict";
      return mapObj(JSON.parse(source), evaluateMapping(mapping));
    `,
    );
    let result = userFunction(mapObj, evaluateMapping, source, mapping);
    postMessage(result);
  } catch (error) {
    console.log(error);
    postMessage([]);
  }
};
