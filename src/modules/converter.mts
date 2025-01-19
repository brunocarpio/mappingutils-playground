export default function assignMapping(mapping: string): object {
    let m = {};
    eval(`m = ${mapping}`);
    return m;
}
