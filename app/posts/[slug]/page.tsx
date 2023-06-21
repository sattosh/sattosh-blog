import Head from 'next/head';
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

export default function Post({ params }: Props) {
  const post = getPostBySlug(params.slug, ['title', 'date', 'slug', 'author', 'content', 'ogImage', 'coverImage']);
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
              <Head>
                <title>{post.title}</title>
                <meta property="og:image" content={post.ogImage.url} />
              </Head>
              <PostHeader title={post.title} coverImage={post.coverImage} date={post.date} author={post.author} />
              <PostBody content={content} />
            </article>
          </>
        )}
      </Container>
    </Layout>
  );
}

export async function generateStaticParams() {
  const posts = getAllPosts(['slug']);
  return posts.map((post) => {
    return {
      slug: post.slug,
    };
  });
}
