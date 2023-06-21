'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Avatar from '../avatar';
import DateFormatter from '../date-formatter';
import type Author from '../../interfaces/author';

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  author: Author;
  slug: string;
};

export const PostPreview = ({ title, coverImage, date, excerpt, author, slug }: Props) => {
  const router = useRouter();
  const handleClick = (e) => {
    e.preventDefault();
    router.push(`/posts/${slug}`);
  };
  return (
    <div
      className="sm:shadow-sm sm:shadow-slate-200 p-6 rounded-sm hover:shadow-slate-500 duration-500 hover:cursor-pointer"
      onClick={handleClick}
    >
      <div
        className="bg-contain bg-no-repeat bg-center h-[150px] w-full mb-3"
        style={{ backgroundImage: `url(${coverImage})` }}
      />
      <h4 className="text-3xl mb-3 leading-snug">
        <Link as={`/posts/${slug}`} href="/posts/[slug]" className="hover:underline">
          {title}
        </Link>
      </h4>
      <div className="text-lg mb-4">
        <DateFormatter dateString={date} />
      </div>
      <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
      <Avatar name={author.name} picture={author.picture} />
    </div>
  );
};

export default PostPreview;
