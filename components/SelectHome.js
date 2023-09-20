import Image from 'next/image';
import EveryButton from './miniComponents/EveryButton';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, {
  Navigation,
  Pagination,
  Autoplay,
  Scrollbar,
} from 'swiper';
import Link from 'next/link';

SwiperCore.use([Navigation, Pagination, Autoplay, Scrollbar]);

const SelectHome = ({ data, title }) => {
  return (
    <div>
      <div className="flex justify-between mb-3 mt-10">
        <div className="text-xl font-[500] md:text-3xl">{title}</div>
        <EveryButton link={`/posts/?is_selected=true`} />
      </div>
      <div className="flex ">
        <Swiper
          spaceBetween={20}
          // scrollbar={{ draggable: true }}
          // slidesPerView={2}
          breakpoints={{
            0: {
              slidesPerView: data.count < 2 ? data.count : 2,
            },
            576: {
              // width: 576,
              slidesPerView: data.count < 3 ? data.count : 3,
            },
            1024: {
              // width: 768,
              slidesPerView: data.count < 5 ? data.count : 5,
            },
          }}
          // autoplay={{
          //   delay: 2500,
          //   disableOnInteraction: false,
          // }}
        >
          {data.results.map((info, index) => (
            <SwiperSlide key={index}>
              <Link key={index} href={`/posts/${info.slug}-${info.id}`}>
                <div className="relative w-full  h-[150px]  sm:h-[250px]">
                  <Image
                    height={1000}
                    width={1000}
                    alt=" "
                    src={`${info.thumbnail}`}
                    className="rounded-md h-full object-cover"
                  />
                  <div className="absolute bottom-0 text-white bg-[#000000b8] w-full  p-3 font-[1000] ">
                    <div className="text-sm truncate md:text-md mb-1">
                      {info.name}
                    </div>
                    <div className="text-xs  text-[#C4C4C4;]">
                      {info.date_started}
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default SelectHome;
