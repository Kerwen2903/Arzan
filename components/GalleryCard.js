import { EyeIcon, PhotographIcon } from '@heroicons/react/outline';
import EveryButton from './miniComponents/EveryButton';
import Image from 'next/image';
import Link from 'next/link';

const GalleryCard = ({ users, grid, data }) => {
  return (
    <div className="mt-10">
      <div className="flex justify-between mb-3">
        {users && <EveryButton />}
      </div>
      <div className="grid grid-cols-5"></div>
      <div className={`grid grid-cols-2 md:grid-cols-${grid} gap-4 mt-5`}>
        {data.map((gallery, index) => {
          return (
            <Link
              href={`/galleries/${gallery.owner.username}-${gallery.id}`}
              key={index}
            >
              <div className="relative border-2 rounded-sm border-[#E5E5E5]">
                <div className="p-2 flex items-center gap-3">
                  <Image
                    src={
                      !gallery.owner.avatar
                        ? `/pets/${gallery.owner.id % 10}.png`
                        : ''
                    }
                    alt=""
                    width={1000}
                    height={500}
                    className="w-12 h-12 rounded-full border-green-600 border-2 "
                  />
                  {gallery.owner.username}
                </div>
                <Image
                  height={1000}
                  width={1000}
                  alt=" "
                  src={gallery.banner}
                  className="w-full h-48 object-cover"
                />
                <div>
                  <div className="p-3">{gallery.description}</div>
                  <div className="flex  text-[#747474] text-xs p-3 gap-5">
                    <div className="flex">
                      <PhotographIcon className="h-4 w-4" />
                      {gallery.images__count}
                    </div>
                    <div className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      {gallery.view_count}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default GalleryCard;
