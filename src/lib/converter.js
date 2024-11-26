/**
 * @param {string} mappingState
 * @returns {object}
 */
export default function mappingFromString(mappingState) {
    let lines = mappingState
        .trim()
        .slice(1, -1)
        .split(",")
        .map((line) => {
            return line.trim();
        })
        .map((line) => {
            return line.replaceAll("\n", "");
        })
        .filter((line) => line);
    let fixStart = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i]?.match(new RegExp(":\\s*\\["))) {
            fixStart = i;
            lines[i] += ",";
        }
        let inFix = fixStart > -1 && fixStart !== i;
        if (inFix) {
            lines[fixStart] += lines[i] + ",";
        }
        if (lines[i]?.includes("]")) {
            fixStart = -1;
        }
        if (inFix) {
            lines[i] = "";
        }
    }
    lines = lines.map((line) => {
        return line
            .replaceAll("\n", "")
            .replace(new RegExp("(]),+$", "g"), "$1");
    });
    //console.log("lines", lines);
    let arr = [];
    for (let line of lines) {
        if (line) {
            let [k, v] = line.split(":");
            if (k && v) {
                //console.log("k", k);
                //console.log("v", v);
                k = k.trim().slice(1, -1);
                v = v.trim();
                if (v.match(new RegExp("^\\["))) {
                    //console.log("in condition");
                    //console.log("v", v);
                    v = v.replace(",]", "]");
                    v = v.slice(1, -1).trim();
                    v = v.split('",');
                    for (let i = 0; i < v.length; i++) {
                        v[i] = v[i].trim();
                        if (i === v.length - 1) {
                            try {
                                v[i] = new Function(
                                    "let myFunc=" + v[i] + ";return myFunc"
                                )();
                            } catch (err) {
                                console.log("err", err);
                            }
                        } else {
                            v[i] = v[i].replaceAll('"', "");
                        }
                    }
                } else {
                    v = v.trim().slice(1, -1);
                }
                arr.push([k, v]);
            }
        }
    }
    return Object.fromEntries(arr);
}
