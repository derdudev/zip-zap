import fs from 'fs'
import {unified} from 'unified'
import rehypeStringify from 'rehype-stringify'
import remarkRehype from 'remark-rehype'
import {remark} from 'remark'
import remarkMdx from 'remark-mdx'
import rehypeParse from 'rehype-parse';
import remarkFrontmatter from "remark-frontmatter";
import {generate, registerGenerator} from "./lib/generator.js";
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

const doc = fs.readFileSync('content/main-chapters/about-me.mdx')

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

let labels = [];

registerGenerator({
    name: "label",
    dataGenerator: (frontmatter, attributes) => {
        return {
            name: attributes.find(attr => attr.name === "name").value
        }
    },
    preEjsRender: (name, attributes) => {
        labels.push({
            name: attributes.find(attr => attr.name === "name").value,
            value: currentCounterValue()
        })
    }
});
registerGenerator({
    name: "ref",
    dataGenerator: (frontmatter, attributes) => {
        let to = attributes.find(attr => attr.name === "to").value;
        let label = labels.find(label => label.name === to);

        // console.log("[DEBUG] labels: ", labels);
        // console.log("[DEBUG] Counter corresp. to Ref: ", label);

        if(label){
            // console.log("[DEBUG]", label.ccounter)
            // console.log("[DEBUG] Counter value: ", label.ccounter.value)
            return {
                href: "#"+to,
                value: "Abschnitt " + label.value
            }
        } else {
            return {
                href: to,
                value: "tbr"
            }
        }
    }
});

generateFromMDX({
    dir: path.join(process.cwd(), "content", "main-chapters"),
    outputDir: path.join(process.cwd(), "build", "content"),
})
