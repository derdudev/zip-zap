import fs from 'fs'
import {unified} from 'unified'
import rehypeStringify from 'rehype-stringify'
import remarkRehype from 'remark-rehype'
import {remark} from 'remark'
import remarkMdx from 'remark-mdx'
import rehypeParse from 'rehype-parse';
import remarkFrontmatter from "remark-frontmatter";
import {generate, registerGenerator, registerGenerators} from "./lib/generator.js";
import path from "node:path";
import {renderEjsComponent} from "./lib/render-ejs-component.js";
import {
    counterIncr,
    counterReset,
    counterValue,
    currentCounterValue,
    registerCounter,
    resetCounters
} from "./lib/counter.js";
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeMathjax from 'rehype-mathjax'
import remarkParse from "remark-parse";
import rehypeFormat from "rehype-format"
import {generateFromMDX, generateFromMDXFile} from "./lib/generate-from-mdx.js";
import generators from "./generators.js";

registerCounter({
    name: "section",
    initialValue: 0,
    stylizedValueGenerator: (rawValue) => {
        return rawValue;
    },
    onUpdate: (newValue) => {
        counterReset("subsection");
    }
})
registerCounter({
    name: "subsection",
    initialValue: 0,
    stylizedValueGenerator: (rawValue) => {
        return counterValue("section") + "." +  rawValue;
    }
})

generateFromMDX({
    dir: path.join(process.cwd(), "content", "main-chapters"),
    outputDir: path.join(process.cwd(), "build", "content"),
})
