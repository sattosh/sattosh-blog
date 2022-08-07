import markdownHtml from 'zenn-markdown-html';

export default function markdownToHtml(markdown: string) {
  return markdownHtml(markdown);
}
