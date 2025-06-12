import { unified } from "unified";
import {
  unifiedLatexAstComplier,
  unifiedLatexFromString,
} from "@unified-latex/unified-latex-util-parse";

import fs from "fs";
import path from "node:path";

const TEX_SOURCE = fs.readFileSync(path.join(process.cwd(), "..","content","tex","chapters","das-bin-ich.tex"), "utf-8");

const processor1 = unified().use(unifiedLatexFromString);
const ast1 = processor1.parse(TEX_SOURCE);

fs.writeFileSync(path.join(process.cwd(), "parsed-tex.json"), JSON.stringify(ast1, null, 2),  "utf-8");
