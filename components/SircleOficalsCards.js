import Image from 'next/image';
const SircleOficalsCards = ({ info, index }) => {
  return (
    <div key={index}>
      <div className=" rounded-full relative ">
        <Image
          height={1000}
          width={1000}
          alt=" "
          className="object-cover rounded-full w-[100px] h-[100px] border-[6px] border-green-500"
          src={info.src}
        />
        <div className="absolute top-[4px] right-[2px] rounded-full bg-green-500 text-white w-7 h-7 text-center pt-[0.1rem]">
          {info.mount}
        </div>
      </div>
      <div className="text-center">{info.name}</div>
    </div>
  );
};

export default SircleOficalsCards;
