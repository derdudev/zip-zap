import {unified} from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkMath from "remark-math";
import * as util from "node:util";
import remarkMdx from "remark-mdx";

util.inspect.defaultOptions.depth = 5;

function Test(options) {
    console.log(this.data());
    const micromarkExtensions =
        this.data().micromarkExtensions;
    micromarkExtensions.push({
        test: "test"
    })
}

unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkMath)
    .use(Test)
    .use(remarkStringify)
    .processSync("hallo welt")
