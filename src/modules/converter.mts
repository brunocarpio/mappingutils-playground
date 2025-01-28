export default function assignMapping(mapping: string): object {
  let hidden = mapping.substring(8);
  let m = {};
  eval(`m = ${hidden}`);
  return m;
}
