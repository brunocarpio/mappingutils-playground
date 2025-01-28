export function replacer(match: string, p1: string, p2: string) {
  if (p1) {
    return p1;
  } else if (p2) {
    return "";
  } else {
    return match;
  }
}
