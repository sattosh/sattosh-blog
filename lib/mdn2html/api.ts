import fs from 'fs';
import { resolve } from 'path';
import matter from 'gray-matter';
import PostType from '../../interfaces/post';

const postsDirectory = resolve(process.cwd(), '_posts');

/** 記事用マークダウンファイルのファイル名を全取得 */
export const getPostSlugs = (): string[] => {
  return fs.readdirSync(postsDirectory);
};

/** 指定した記事のマークダウンファイルが存在するか確認 */
const checkExistPost = (slug: string): boolean => {
  const fullPath = resolve(postsDirectory, slug);
  return fs.existsSync(fullPath);
};

/** 指定した記事のマークダウンファイルを取得 */
export const getPostBySlug = (slug: string, fields: string[] = []) => {
  let fileContents = '';
  const items = {};

  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = resolve(postsDirectory, `${realSlug}.md`);
  try {
    fileContents = fs.readFileSync(fullPath, 'utf8');
  } catch (e) {
    return undefined;
  }
  const { data, content } = matter(fileContents);

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') items[field] = realSlug;
    if (field === 'content') items[field] = content;
    if (typeof data[field] !== 'undefined') items[field] = data[field];
  });

  return items as PostType;
};

/**
 * すべての記事から指定したフィールドの全取得
 * @param {string[]} fields  取得するフィールドの配列
 * @returns {PostType[]} 記事の配列
 */
export const getAllPosts = (fields: string[] = []): PostType[] => {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    .filter((post) => post !== undefined)
    // 時刻でソート
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
};
