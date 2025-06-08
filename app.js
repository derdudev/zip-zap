import fs from 'fs'
import {mdxJsx} from 'micromark-extension-mdx-jsx'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {mdxJsxFromMarkdown, mdxJsxToMarkdown} from 'mdast-util-mdx-jsx'
import {toMarkdown} from 'mdast-util-to-markdown'
import {unified} from 'unified'
import rehypeStringify from 'rehype-stringify'
import remarkRehype from 'remark-rehype'
import {reporter} from 'vfile-reporter'
import remarkParse from 'remark-parse';
import {remark} from 'remark'
import remarkMdx from 'remark-mdx'
import rehypeParse from 'rehype-parse';
import remarkFrontmatter from "remark-frontmatter";
import {generate, registerGenerator} from "./components/generator.js";
import path from "node:path";

const doc = fs.readFileSync('example.mdx')

const tree = fromMarkdown(doc, {
    extensions: [mdxJsx()],
    mdastExtensions: [mdxJsxFromMarkdown()]
})

// console.log(tree.children)

// const out = toMarkdown(tree, {extensions: [mdxJsxToMarkdown()]})
// console.log(out)

// const file = await unified()
//     .use(() => {
//         return {
//             parse: () => tree, // Inject the already-parsed MDAST tree
//             // Required by unified, but we don't need it
//             stringify: (node) => node,
//         };
//     })
//     .use(remarkRehype)
//     .use(rehypeStringify)
//     .process(doc)

// // Use unified to process the MDAST into HTML
// const file = await unified()
//     .use(remarkRehype) // Convert MDAST to HAST
//     .use(rehypeStringify) // Convert HAST to HTML
//     .run(tree); // Use .run() instead of .process()
//
// // Generate the HTML output
// const html = unified().use(rehypeStringify).stringify(file);
//
// // console.error(reporter(file))
// console.log(String(html))

// const markdown = `
// # Hello World
//
// <MyComponent prop="value">Custom content</MyComponent>
// `;
//
// const file = await unified()
//     .use(remarkParse, {
//         extensions: [mdxJsx()],
//         mdastExtensions: [mdxJsxFromMarkdown()],
//     })
//     .use(remarkRehype)
//     .use(rehypeStringify)
//     .process(doc);
//
// console.log(String(file));

registerGenerator({
    name: "label",
    dataGenerator: (name, attributes) => {
        return {
            name: attributes.find(attr => attr.name === "name").value
        }
    }
});
registerGenerator({
    name: "ref",
    dataGenerator: (name, attributes) => {
        return {
            href: attributes.find(attr => attr.name === "to").value,
            value: "1.1"
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

        console.log(tree);

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

        return tree.children[0];
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
    .use(remarkRehype, {
        handlers: customHandlers,
    })
    .use(rehypeStringify)
    .process(doc)

fs.writeFileSync(path.join(process.cwd(), "build","content", "example.html"), String(file));

console.log(String(file))
console.log(frontmatter)
