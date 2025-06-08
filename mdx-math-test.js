import fs from 'node:fs/promises'
import {compile} from '@mdx-js/mdx'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

console.log(
    String(
        await compile("# $$\\sqrt{a^2 + b^2}$$", {
            rehypePlugins: [rehypeKatex],
            remarkPlugins: [remarkMath]
        })
    )
)
