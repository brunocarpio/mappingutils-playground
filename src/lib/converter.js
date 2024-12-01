/**
 * @param {string} mappingState
 * @returns {object}
 */
export default function mappingFromString(mappingState) {
    let m = {};
    eval(`m = ${mappingState}`);
    return m;
}
