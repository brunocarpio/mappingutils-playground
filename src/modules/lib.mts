import Ajv from "ajv/dist/jtd";
const ajv = new Ajv();

export function replacer(match: string, p1: string, p2: string) {
  if (p1) {
    return p1;
  } else if (p2) {
    return "";
  } else {
    return match;
  }
}

export function isValidFromJTD(schema: string, data: string): boolean {
  try {
    let validate = ajv.compile(JSON.parse(schema));
    return validate(JSON.parse(data));
  } catch (error) {
    return false;
  }
}

export default function evaluateMapping(mapping: string): object {
  let hidden = mapping.substring(8);
  let m = {};
  try {
    eval(`m = ${hidden}`);
  } catch (error) {
    console.log(error);
  }
  return m;
}
