import { BsFillPencilFill } from 'react-icons/bs';
type Props = {
  name: string;
  picture: string;
};

const Avatar = ({ name }: Props) => {
  return (
    <div className="flex items-center">
      <BsFillPencilFill size={13} />
      <div className="ml-1 text-sl font-semibold">{name}</div>
    </div>
  );
};

export default Avatar;
