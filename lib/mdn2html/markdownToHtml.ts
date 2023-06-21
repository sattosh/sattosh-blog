import markdownHtml from 'zenn-markdown-html';

/** マークダウンの内容をHTMLに変換する */
export const markdownToHtml = (markdown: string) => markdownHtml(markdown);
