import { Metadata } from 'next';
import Container from '@/components/container';
import PostBody from '@/components/post/body';
import Header from '@/components/header';
import { PostHeader, PostTitle } from '@/components/post';
import Layout from '@/components/layout';
import { getPostBySlug, getAllPosts } from '@/lib/mdn2html/api';
import { markdownToHtml } from '@/lib/mdn2html';

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const posts = getAllPosts(['slug']);
  return posts.map((post) => {
    return {
      slug: post.slug,
    };
  });
}

/** メタデータの設定 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug, ['title', 'date', 'slug', 'author', 'content', 'ogImage', 'coverImage', 'excerpt']);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      images: [post.ogImage.url],
      title: post.title,
      description: post.excerpt,
      url: `https://blog.sattosh.com//posts/${post.slug}`,
    },
  };
}

export default function Post({ params }: Props) {
  const post = getPostBySlug(params.slug, ['title', 'date', 'slug', 'author', 'content', 'ogImage', 'coverImage', 'excerpt']);
  const content = markdownToHtml(post?.content || '');

  return (
    <Layout>
      <Container>
        <Header />
        {!post ? (
          <PostTitle>Load Content Failed</PostTitle>
        ) : (
          <>
            <article className="mb-32">
              <PostHeader title={post.title} coverImage={post.coverImage} date={post.date} author={post.author} />
              <PostBody content={content} />
            </article>
          </>
        )}
      </Container>
    </Layout>
  );
}
