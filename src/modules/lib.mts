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
  let validate = ajv.compile(JSON.parse(schema));
  try {
    return validate(JSON.parse(data));
  } catch (error) {
    return false;
  }
}
