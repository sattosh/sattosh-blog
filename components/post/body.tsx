import 'zenn-content-css';

type Props = {
  content: string;
};

export const PostBody = ({ content }: Props) => {
  return (
    <div className="max-w-4xl mx-auto znc">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default PostBody;
