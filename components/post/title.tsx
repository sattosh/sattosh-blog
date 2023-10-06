import { ReactNode } from 'react';

type Props = {
  children?: ReactNode;
};

export const PostTitle = ({ children }: Props) => {
  return <div className="text-6xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-left">{children}</div>;
};

export default PostTitle;
