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
  // 画面遷移のためのクリックイベント
  const handleClick = (e) => {
    e.preventDefault();
    router.push(`/posts/${slug}`);
  };

  return (
    <div
      className="shadow-sm shadow-slate-200 p-6 rounded-sm hover:shadow-slate-500 duration-500 hover:cursor-pointer min-h-34 flex flex-col"
      onClick={handleClick}
    >
      <div
        className="bg-contain bg-no-repeat bg-center h-[150px] w-full mb-3"
        style={{ backgroundImage: `url(${coverImage})` }}
      />
      <div className="text-2xl my-2 leading-snug font-bold">
        <Link as={`/posts/${slug}`} href="/posts/[slug]">
          {title}
        </Link>
      </div>
      <div className="text-sm mb-4">
        <DateFormatter dateString={date} />
      </div>
      <p className="text-md leading-relaxed mb-4 text-gray-600">{excerpt}</p>
      <div className="flex-1 flex flex-col-reverse">
        <div>
          <Avatar name={author.name} picture={author.picture} />
        </div>
      </div>
    </div>
  );
};

export default PostPreview;
