import { unified } from "unified";
import rehypeStringify from "rehype-stringify";
import { unifiedLatexToHast } from "@unified-latex/unified-latex-to-hast";
import { unifiedLatexFromString } from "@unified-latex/unified-latex-util-parse";
import fs from "fs";
import path from "node:path";
import rehypeKatex from "rehype-katex";
import katex from "katex";
import { visit } from "unist-util-visit";
import rehypeParse from "rehype-parse";
import { renderEjsComponent } from "../lib/render-ejs-component.js";
import { htmlLike } from "@unified-latex/unified-latex-util-html-like";
import { getArgsContent } from "@unified-latex/unified-latex-util-arguments";
import { counterIncr, counterValue, registerCounter } from "../lib/counter.js";
import { printRaw } from "@unified-latex/unified-latex-util-print-raw";
import { parseChapterNumber } from "./parse-from-aux.js";

const TEX_SOURCE = fs.readFileSync(path.join(process.cwd(), "..","content","tex","chapters","das-bin-ich.tex"), "utf-8");

const AUX = fs.readFileSync(path.join(process.cwd(), "..","content","tex","chapters","das-bin-ich.aux"), "utf-8");

let chapterNumber = parseChapterNumber(AUX);

registerCounter({
  name: "section",
  initialValue: 0,
  stylizedValueGenerator: (rawValue) => {
    return `§${chapterNumber}.` + rawValue;
  }
})

const convert = (value) =>
  unified()
    .use(unifiedLatexFromString)
    .use(unifiedLatexToHast, {
      macroReplacements: {
        chapter: (node) => {
          return htmlLike({
            tag: "h1",
            content: {
              type: "string",
              content: `${chapterNumber}. ` + printRaw(getArgsContent(node)[2])
            },
          })
        },
        section: (node) => {
          counterIncr("section");

          let args = getArgsContent(node);
          return htmlLike({
            tag: "h2",
            content: {
              type: "string",
              content: counterValue("section") + ". "  + printRaw(args[args.length - 1])
            },
          })
        }
      }
    })
    .use(() => (tree) => {
      visit(tree, (node, index, parent) => {
        // KATEX-MATH RENDERING
        if(node.type === "element" && node.properties.className && (node.properties.className.join(' ') === "inline-math" || node.properties.className.join(' ') === "display-math")) {
          // WARNING: In documents with many math segments, this could be a real performance bottleneck!
          let texString = node.children[0].value.replace(/\\label\{[^}]*\}/g, "");
          let katexRenderedHTML = katex.renderToString(texString, {
            displayMode: node.properties.className.join(' ') === "display-math"
          });

          const processor = unified()
            .use(rehypeParse, { fragment: true });

          const tree = processor.runSync(processor.parse(katexRenderedHTML));

          parent.children[index] = tree.children[0];
        }
      })
    })
    .use(rehypeStringify)
    .processSync(value).value;

let result = renderEjsComponent({
  name: "layout-for-tex-html",
  data: {
    content: convert(TEX_SOURCE)
  },
  ejsComponentsPath: path.join(process.cwd(), "..","ejs-components")
});

fs.writeFileSync(path.join(process.cwd(), "..", "build", "content","TeXed-about-me.html"), result, "utf-8");
