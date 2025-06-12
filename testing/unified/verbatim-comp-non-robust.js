import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';

// Custom plugin to preserve raw content of <comp> without parsing
function remarkVerbatim(options) {
    console.log(options);
    return (tree, file) => {
        visit(tree, 'mdxJsxFlowElement', (node) => {
            if (node.name === 'comp') {
                // Capture the raw content by inspecting the original Markdown source
                const start = node.position.start.offset;
                const end = node.position.end.offset;
                let rawContent = file.contents.slice(start+6, end-7);
                if(rawContent.at(0) === "\n") {
                    rawContent = rawContent.slice(1);
                }

                // Extract everything between the opening and closing <comp> tags
                node.children = [
                    {
                        type: 'text',
                        value: rawContent,
                    },
                ];
            }
        });
    };
}

// Example Markdown
const markdown = `
Some content here.

<comp>
  **This should not be parsed**
  - Neither should this list
  <html>
</comp>

More content here.
`;

// Build the unified processor
const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkVerbatim, {
        components: [
            {
                name: "html"
            }
        ]
    });

// Parse and process the Markdown
const tree = processor.parse(markdown);
const result = processor.runSync(tree, { contents: markdown });

// Output the result
// console.log(JSON.stringify(result, null, 2));
