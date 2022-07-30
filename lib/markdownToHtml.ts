import { remark } from 'remark';
import html from 'remark-html';
import parse from 'remark-parse';
import stringify from 'remark-stringify';
import prism from 'remark-prism';

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(parse)
    .use(stringify)
    .use(prism, { plugins: ['line-numbers'] })
    .use(html, { sanitize: false })
    .process(markdown);
  return result.toString();
}
