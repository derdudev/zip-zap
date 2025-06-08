// micromark-to-remark.js
import { micromarkExtension } from './your-micromark-extension'; // Your micromark extension
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toMarkdown } from 'mdast-util-to-markdown';

export function remarkMicromarkBridge() {
    return (options = {}) => {
        const data = this.data();

        function add(field, value) {
            if (data[field]) data[field].push(value);
            else data[field] = [value];
        }

        add('micromarkExtensions', micromarkExtension(options));
        add('fromMarkdownExtensions', fromMarkdown(micromarkExtension(options)));
        add('toMarkdownExtensions', toMarkdown(micromarkExtension(options)));
    };
}
