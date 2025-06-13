export function parseLabelsFromAux(str) {
  let lines = str.split("\n");
  let labelLines = lines.filter((l) => l.slice(0,9) === "\\newlabel");
  let newLabelArgs = labelLines.map((line) => [...line.matchAll(/\{([^{}]*)\}/gm)].map((match) => match[1]));
  return newLabelArgs.map((newLabelArgs) => {
    return {
      name: newLabelArgs[0],
      counterVal: newLabelArgs[1],
      pageNum: newLabelArgs[2],
      sectionTitle: newLabelArgs[3],
      internalMarker: newLabelArgs[4],
      extraData: newLabelArgs[5],
    }
  });
}

export function parseChapterNumber(str) {
  let lines = str.split("\n");
  let chapterNumber = lines.find((l) => l.slice(0,20) === "\\setcounter{chapter}").slice(20);
  // TODO: Cursed Regex, rework!
  return parseInt([...chapterNumber.match(/\{([^{}]*)\}/gm)].map((match) => match[1])[0]);
}
