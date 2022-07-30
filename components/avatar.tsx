import { BsFillPencilFill } from 'react-icons/bs';
type Props = {
  name: string;
  picture: string;
};

const Avatar = ({ name, picture }: Props) => {
  return (
    <div className="flex items-center">
      <BsFillPencilFill />
      <div className="ml-1 text-xl font-bold">{name}</div>
    </div>
  );
};

export default Avatar;
