import cn from 'classnames';
import Link from 'next/link';

type Props = {
  title: string;
  src: string;
  slug?: string;
  shadow?: boolean;
};

const CoverImage = ({ title, src, slug, shadow = false }: Props) => {
  const image = <img src={src} alt={`Cover Image for ${title}`} className={cn('lg:px-42 sm:px-0 md:px-28')} />;
  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link as={`/posts/${slug}`} href="/posts/[slug]" aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
};

export default CoverImage;
