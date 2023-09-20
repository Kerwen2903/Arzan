import Container from '../components/Container';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, {
  Navigation,
  Pagination,
  Autoplay,
  Scrollbar,
} from 'swiper';
import 'swiper/swiper-bundle.css';
import Image from 'next/image';
import PostCards from '../components/PostCards';
import Link from 'next/link';
import { parse } from 'cookie';
import SelectHome from '../components/SelectHome';
import SircleOficalsCards from '../components/SircleOficalsCards';
import { hostname } from '../setting';
import { useEffect, useState } from 'react';
import tk from '../static/locales/tk.json';
import ru from '../static/locales/ru.json';
import en from '../static/locales/en.json';
import { getCookie } from 'cookies-next';

SwiperCore.use([Navigation, Pagination, Autoplay, Scrollbar]);

const sircleStory = [
  { mount: '23', name: '100 haryt', src: '/images/12.jpg' },
  { mount: '27', name: 'akyol', src: '/images/11.png' },
  { mount: '21', name: 'gulzemin', src: '/images/3.png' },
  { mount: '50', name: 'sherbet', src: '/images/4.jpg' },
  { mount: '40', name: '100 haryt', src: '/images/5.jpg' },
  { mount: '13', name: 'akyol', src: '/images/6.avif' },
  { mount: '63', name: 'sherbet', src: '/images/7.avif' },
  { mount: '93', name: 'gulzemin', src: '/images/7.avif' },
  { mount: '113', name: 'MB', src: '/images/7.avif' },
  { mount: '213', name: 'Magazin', src: '/images/7.avif' },
  { mount: '231', name: 'Berkarar', src: '/images/7.avif' },
];
export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = parse(req.headers.cookie || '');
  let location = '';
  if (cookies.location) location = `&location=${cookies.location}`;
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept-language': cookies.language || 'tk',
    };
    const selectedUrl = `${hostname}/api/posts/?is_selected=true` + location;
    const newOfficials =
      `${hostname}/api/users/news/?type=2&ordering=-date_joined` + location;
    const pinnedUrl = `${hostname}/api/posts/?is_pinned=true` + location;
    const bannerUrl = `${hostname}/api/commercials/advertisements/?type=0`;
    const pinnedResponse = await fetch(pinnedUrl);
    const selectedResponse = await fetch(selectedUrl);
    const newOfficialsResponse = await fetch(newOfficials);
    const bannerResponse = await fetch(bannerUrl);
    const pinnedData = await pinnedResponse.json();
    const selectedData = await selectedResponse.json();
    const newOfficialsData = await newOfficialsResponse.json();
    const bannerData = await bannerResponse.json();

    return {
      props: {
        pinnedData,
        selectedData,
        bannerData,
        newOfficialsData,
        pinnedUrl,
      },
    };
  } catch (error) {
    return { props: { data: null } };
  }
}

const Index = ({
  pinnedData,
  selectedData,
  bannerData,
  newOfficialsData,
  pinnedUrl,
}) => {
  const [content, setContent] = useState(tk);
  useEffect(() => {
    const storedLanguage = getCookie('language') || 'tk';

    switch (storedLanguage) {
      case 'ru':
        setContent(ru);
        break;
      case 'en':
        setContent(en);
        break;
      default:
        setContent(tk);
    }
  }, []);
  return (
    <Container>
      <div className="  relative rounded-sm">
        <Swiper
          modules={{ Autoplay }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          loop
          slidesPerView={1}
          spaceBetween={30}
          navigation={{
            prevEl: '.my-prev-button',
            nextEl: '.my-next-button',
          }}
          pagination={{ el: '.swiper-pagination', clickable: true }}
          className="h-min"
        >
          {bannerData &&
            bannerData.map((banner, index) => (
              <SwiperSlide key={index} className="h-auto">
                <Image
                  height={200}
                  width={1000}
                  alt=" "
                  className="object-cover  w-full  rounded-md"
                  src={banner.image}
                />
              </SwiperSlide>
            ))}
        </Swiper>
        <div className="swiper-pagination"></div>
        <div className="my-prev-button absolute flex top-[40%] md:top-[45%] bg-white md:w-11 md:h-11 w-8 h-8 rounded-full justify-center p-0 z-10 left-0 md:text-[35px] text-[25px] cursor-pointer">
          <div className="md:mt-[-7px] mt-[-4px]">&#8249;</div>
        </div>
        <div className="my-next-button absolute flex top-[40%] md:top-[45%] bg-white md:w-11 md:h-11 w-8 h-8 rounded-full justify-center p-0 z-10 right-0 md:text-[35px] text-[25px] cursor-pointer">
          <div className="md:mt-[-7px] mt-[-4px]">&#8250;</div>
        </div>
      </div>
      {/* <div className=" mt-5">
        <Swiper
          spaceBetween={30}
          // scrollbar={{ draggable: true }}
          // slidesPerView={2}
          breakpoints={{
            576: {
              // width: 576,
              slidesPerView: 1,
            },
            1024: {
              // width: 768,
              slidesPerView: 7,
            },
          }}
          // autoplay={{
          //   delay: 2500,
          //   disableOnInteraction: false,
          // }}
        >
          {sircleStory.map((info, index) => (
            <SwiperSlide key={index}>
              <SircleOficalsCards key={index} info={info} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div> */}

      {selectedData?.count && (
        <SelectHome title={content.selected} data={selectedData} />
      )}
      <div className="grid grid-cols-2 gap-4 mt-5">
        {/* <div className="col-span-2 h-44 relative">
          <Image
            height={1000}
            width='auto'
            alt=" "
            className="w-full h-full object-cover rounded-lg"
            src={lelo[0].src}
          />
          <div className="absolute bg-[#22c55ecc] text-lg font-[700] top-0 left-0 text-white p-4 rounded-br-lg w-44">
            Konkurs
          </div>
        </div> */}

        <div className="col-span-2   relative">
          <Link href={`/users/top?tab=officials&filter=-balance`}>
            <Image
              height={1000}
              width={1000}
              alt=" "
              className="w-full md:h-full h-24 object-cover rounded-lg"
              src={`/top.png`}
            />

            <div className="absolute bg-[#22c55e] lg:text-lg md:text-md font-[700] top-0 left-0 text-white p-3 rounded-br-lg w-40">
              {content.tops}
            </div>
          </Link>
        </div>

        <div className="  relative">
          <Link href="/galleries">
            <Image
              height={1000}
              width={1000}
              alt=" "
              className="w-full md:h-full h-24 object-cover rounded-lg"
              src={`/photo_banner.png`}
            />
            <div className="absolute bg-[#22c55e] lg:text-lg md:text-md font-[700] top-0 left-0 text-white p-3 rounded-br-lg md:w-40">
              {content.photo}
            </div>
          </Link>
        </div>
        <div className="  relative">
          <Link href="/videos">
            <Image
              height={1000}
              width={1000}
              alt=" "
              className="w-full md:h-full h-24 object-cover rounded-lg"
              src={`/video_banner.png`}
            />
            <div className="absolute bg-[#22c55e] lg:text-lg md:text-md font-[700] top-0 left-0 text-white p-3 rounded-br-lg md:w-40">
              {content.videos}
            </div>
          </Link>
        </div>

        <div className="col-span-2  relative">
          <Link href={`/officials`}>
            <Image
              height={1000}
              width={1000}
              alt=" "
              className="w-full md:h-full h-24 object-cover rounded-lg"
              src={`/officials_banner.png`}
            />
            <div className="absolute bg-[#22c55e] lg:text-lg md:text-md font-[700] top-0 left-0 text-white p-3 rounded-br-lg w-40">
              {content.officials}
            </div>
          </Link>
        </div>
      </div>
      <div className="mt-5">
        <h1 className="text-xl md:text-2xl mb-2 font-[500]">
          {content.newOfficials}
        </h1>
        <Swiper
          spaceBetween={20}
          // scrollbar={{ draggable: true }}
          // slidesPerView={2}
          breakpoints={{
            0: {
              slidesPerView: 3,
            },
            576: {
              // width: 576,
              slidesPerView: 5,
            },
            1024: {
              // width: 768,
              slidesPerView: 7,
            },
          }}
          // autoplay={{
          //   delay: 2500,
          //   disableOnInteraction: false,
          // }}
        >
          {newOfficialsData?.results.map((newOfficials, i) => (
            <SwiperSlide key={i}>
              <Link
                href={`/users/${newOfficials.username}-${newOfficials.id}`}
                className="rounded-md"
              >
                <Image
                  height={500}
                  width={500}
                  alt=" "
                  src={
                    !newOfficials.avatar
                      ? `/pets/${newOfficials.id % 10}.png`
                      : newOfficials.avatar
                  }
                  className=" w-full h-28 md:h-32 rounded-md   z-10 object-cover border-[1px] border-[#E5E5E5]"
                />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <PostCards
        users={true}
        grid={'3'}
        data={pinnedData}
        title={content.posts}
        link="/posts"
        postsUrl={pinnedUrl}
      />
    </Container>
  );
};

export default Index;
