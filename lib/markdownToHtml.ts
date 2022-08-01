import { remark } from 'remark';
import html from 'remark-html';
import prism from 'remark-prism';
import slug from 'remark-slug';
import toc from 'remark-toc';

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(slug)
    .use(toc, { heading: '目次', maxDepth: 2 })
    .use(prism)
    .use(html, { sanitize: false })
    .process(markdown);
  return result.toString();
}
