import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';

console.log(remarkParse.Parser)

const markdown = `
<comp>
Test
</comp>
`

function remarkAddTokenizer() {
    const Parser = this.Parser; // `this` is the unified processor here

    console.log(this);

    function myTokenizer(eat, value, silent) {
        // tokenizer logic here
    }
    myTokenizer.locator = (value, fromIndex) => value.indexOf('<comp>', fromIndex);

    Parser.prototype.blockTokenizers.myComp = myTokenizer;

    // Insert 'myComp' before 'jsx' tokenizer in blockMethods
    const index = Parser.prototype.blockMethods.indexOf('jsx');
    if (index !== -1) {
        Parser.prototype.blockMethods.splice(index, 0, 'myComp');
    } else {
        Parser.prototype.blockMethods.unshift('myComp');
    }
}

let processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkAddTokenizer);


// Parse and process the Markdown
const tree = processor.parse(markdown);
const result = processor.runSync(tree, { contents: markdown });

// Output the result
console.log(JSON.stringify(result, null, 2));
