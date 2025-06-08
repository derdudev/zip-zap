import fs from 'node:fs/promises'
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
import generateLabel from "./components/label.js";

const doc = await fs.readFile('example.mdx')

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

const customHandlers = {
    mdxJsxTextElement(state, node) {
        // Custom transformation for inline MDX JSX elements
        return {
            type: 'element',
            tagName: node.name,
            properties: {
                className: ['custom-inline']
            },
            children: state.all(node)
        }
    },
    mdxJsxFlowElement(state, node) {
        // Custom transformation for block-level MDX JSX elements
        let element = generateLabel({
            name: node.attributes[0].value
        });

        const processor = unified()
            .use(rehypeParse, { fragment: true });

        const tree = processor.runSync(processor.parse(element));

        console.log(tree);

        return tree.children[0];
    },
    mdxFlowExpression(state, node) {
        console.warn("JavaScript expressions are not prohibited in this markdown format");
        return {};
    }
};

const file = await remark()
    .use(remarkMdx)
    .use(remarkRehype, {
        handlers: customHandlers,
    })
    .use(rehypeStringify)
    .process(doc)

console.log(String(file))
