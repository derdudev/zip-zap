import fs from "fs";
import path from "path";
import {counterIncr, counterValue, registerCounters, resetCounters} from "./counter.js";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdx from "remark-mdx";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import {unified} from "unified";
import remarkParse from "remark-parse";
import rehypeKatex from "rehype-katex";
import {generateComponent, registerComponents} from "./generator.js";
import rehypeParse from "rehype-parse";
import {renderEjsComponent} from "./render-ejs-component.js";
import components from "../components.js";
import counters from "../counters.js";

registerComponents(components);
registerCounters(counters);

export function generateFromMDXFile({
    filePath,
    outputDir
}) {
    let file = fs.readFileSync(filePath, "utf8");
    // FIRST RENDER
    // maybe on first render the rehype part is not needed if instead the tree is traversed after all remark modules to execute callbacks on the visit of jsx components
    console.log("[RENDER] First run");
    render(file);

    // reset counters
    resetCounters();

    // SECOND RENDER
    console.log("[RENDER] Second run");
    let result = render(file);

    // write result to html file
    fs.writeFileSync(path.join(outputDir,path.basename(filePath,".mdx")+".html"), renderEjsComponent({
        name: "layout",
        data: {
            content: String(result)
        }
    }));
}

export function generateFromMDX({
    dir,
    outputDir
}){
    // read all filenames in the directory
    let filenames = fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx');

    // for each filename:
    filenames.forEach(filename => {
       generateFromMDXFile({
           filePath: path.join(dir, filename),
           outputDir: outputDir,
       })
    });
}

const MDX_EXPRESSION_HANDLERS = {
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
}

let _frontmatter = {}; // TODO: Refactor this ugly solution (frontmatter should be private to render())
const CUSTOM_HANDLERS =  {
    mdxJsxTextElement(state, node) {
        // Custom transformation for inline MDX JSX elements
        let element = generateComponent({
            name: node.name.toLowerCase(),
            frontmatter: _frontmatter, // TODO: Refactor ugly solution
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
        let element = generateComponent({
            name: node.name.toLowerCase(),
            frontmatter: _frontmatter, // TODO: Refactor ugly solution
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

function render(mdxFile) {
    return unified()
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
                        _frontmatter[key.trim()] = value
                    }
                })
            }
        })
        .use(remarkMdx)
        .use(remarkMath)
        .use(remarkRehype, {
            handlers: {
                ...MDX_EXPRESSION_HANDLERS,
                ...CUSTOM_HANDLERS
            },
        })
        .use(rehypeKatex)
        // .use(rehypeFormat)
        .use(rehypeStringify)
        .processSync(mdxFile)
}
