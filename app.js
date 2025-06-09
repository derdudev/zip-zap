import fs from 'fs'
import {unified} from 'unified'
import rehypeStringify from 'rehype-stringify'
import remarkRehype from 'remark-rehype'
import {remark} from 'remark'
import remarkMdx from 'remark-mdx'
import rehypeParse from 'rehype-parse';
import remarkFrontmatter from "remark-frontmatter";
import {generate, registerGenerator} from "./components/generator.js";
import path from "node:path";
import {renderEjsComponent} from "./ejs-components/render-ejs-component.js";
import {
    counterIncr,
    counterReset,
    counterValue,
    currentCounterValue,
    registerCounter,
    resetCounters
} from "./counter.js";
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeMathjax from 'rehype-mathjax'
import remarkParse from "remark-parse";
import rehypeFormat from "rehype-format"

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

// let sectionCounter = new Counter(0, (rawValue) => {
//     return rawValue;
// });
// let subsectionCounter = new Counter(0, (rawValue) => {
//     return sectionCounter.value + "." +  rawValue;
// });

// let currentCounter = sectionCounter;

let labels = [];

registerGenerator({
    name: "label",
    dataGenerator: (name, attributes) => {
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
    dataGenerator: (name, attributes) => {
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

const customHandlers = {
    mdxJsxTextElement(state, node) {
        // Custom transformation for inline MDX JSX elements
        let element = generate({
            name: node.name.toLowerCase(),
            attributes: node.attributes.map((attr) => {
                return {
                    name: attr.name,
                    value: attr.value
                }
            }),
        });

        const processor = unified()
            .use(rehypeParse, { fragment: true });

        const tree = processor.runSync(processor.parse(element));

        return tree.children;
    },
    mdxJsxFlowElement(state, node) {
        // Custom transformation for block-level MDX JSX elements
        let element = generate({
            name: node.name.toLowerCase(),
            attributes: node.attributes.map(attr => {
                return {
                    name: attr.name,
                    value: attr.value
                }
            }),
        });

        const processor = unified()
            .use(rehypeParse, { fragment: true });

        const tree = processor.runSync(processor.parse(element));

        return tree.children;
    },
    mdxTextExpression(state, node) {
        console.warn("\x1b[38;2;255;176;5m[WARN] JavaScript expressions are not prohibited in this markdown format. The Expression will be inserted as plain text in a <span> element.\x1b[0m");
        return {
            type: 'element',
            tagName: "span",
            children: [{
                type: 'text',
                value: node.value
            }]
        };
    },
    mdxFlowExpression(state, node) {
        console.warn("\x1b[38;2;255;176;5m[WARN] JavaScript expressions are not prohibited in this markdown format. The Expression will be inserted as plain text in a <span> element.\x1b[0m");
        return {
            type: 'element',
            tagName: "p",
            children: [{
                type: 'text',
                value: node.value
            }]
        };
    },
    link(state, node) {
        let element = renderEjsComponent({
            name: "in-out-link",
            data: {
                href: node.url,
                children: node.children.map(child => {
                    if(child.type === "text") {
                        return child.value;
                    }
                }),
            }
        });

        const processor = unified()
            .use(rehypeParse, { fragment: true });

        const tree = processor.runSync(processor.parse(element));

        return tree.children;
    },
    heading(state, node) {
        switch(node.depth){
            case 1:
                counterIncr("section");

                node.children = [{
                    type: 'text',
                    value: "§"+counterValue("section")+". "
                }].concat(node.children);
                break;
            case 2:
                counterIncr("subsection");

                node.children = [{
                    type: 'text',
                    value: "§"+counterValue("subsection")+". "
                }].concat(node.children);
                break;
        }

        // console.log("[DEBUG]", node);

        const tagName = `h${node.depth}`;
        return {
            type: 'element',
            tagName: tagName,
            properties: {
                className: [`heading-level-${node.depth}`],
                id: node.children
                    .filter((child) => child.type === 'text')
                    .map((child) => child.value)
                    .join('-')
                    .toLowerCase(),
            },
            children: state.all(node),
        };
    }
};

let frontmatter = {};

const file = await remark()
    .use(remarkFrontmatter)
    .use(() => (tree) => {
        if(tree.children[0].type === "yaml") {
            tree.children[0].value.trim().split("\n").forEach(line => {
                if(line.trim().length >= 1) {
                    // code from the vercel portfolio starter kit (https://vercel.com/templates/next.js/portfolio-starter-kit)
                    let [key, ...valueArr] = line.split(': ')
                    let value = valueArr.join(': ').trim()
                    value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
                    frontmatter[key.trim()] = value
                }
            })
        }
    })
    .use(remarkMdx)
    .use(remarkMath)
    .use(remarkRehype, {
        handlers: customHandlers,
    })
    .use(rehypeStringify)
    .process(doc)

console.log("[DEBUG] ### Second render ###")

// RESET COUNTERS
resetCounters();

const file2 = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(() => (tree) => {
        if(tree.children[0].type === "yaml") {
            tree.children[0].value.trim().split("\n").forEach(line => {
                if(line.trim().length >= 1) {
                    // code from the vercel portfolio starter kit (https://vercel.com/templates/next.js/portfolio-starter-kit)
                    let [key, ...valueArr] = line.split(': ')
                    let value = valueArr.join(': ').trim()
                    value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
                    frontmatter[key.trim()] = value
                }
            })
        }
    })
    .use(remarkMdx)
    .use(remarkMath)
    .use(remarkRehype, {
        handlers: customHandlers,
    })
    .use(rehypeKatex)
    // .use(rehypeFormat)
    .use(rehypeStringify)
    .process(doc)

fs.writeFileSync(path.join(process.cwd(), "build","content", "example.html"), String(file));
fs.writeFileSync(path.join(process.cwd(), "build","content", "example-run-2.html"), renderEjsComponent({
    name: "layout",
    data: {
        content: String(file2)
    }
}));

// console.log(String(file2))
// console.log(frontmatter)
