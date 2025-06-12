import {unified} from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkStringify from "remark-stringify";
import remarkMdx from "remark-mdx";

const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkMath);

const Parser = require('remark-parse/lib/parser.js');

console.log(Parser.prototype.inlineMethods);

