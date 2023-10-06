import PostPreview from './post/preview';
import type Post from '../interfaces/post';

type Props = {
  posts: Post[];
};

const MoreStories = ({ posts }: Props) => {
  return (
    <section>
      <h2 className="mt-8 mb-6 text-4xl  font-bold tracking-tighter leading-tight">記事</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12 lg:gap-x-12 gap-y-20 md:gap-y-16 mb-32">
        {posts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
            slug={post.slug}
            excerpt={post.excerpt}
          />
        ))}
      </div>
    </section>
  );
};

export default MoreStories;
