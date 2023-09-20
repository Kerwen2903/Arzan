import Image from 'next/image';
import Container from '../../components/Container';
import GalleryCard from '../../components/GalleryCard';
import { parse } from 'cookie';
import { getHostname, hostname } from '../../setting';
import { useEffect, useState } from 'react';
import tk from '../../static/locales/tk.json';
import ru from '../../static/locales/ru.json';
import en from '../../static/locales/en.json';
import { getCookie } from 'cookies-next';
// import { useRouter } from 'next/router';

export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = parse(req.headers.cookie || '');
  try {
    const response = await fetch(`${hostname}/api/galleries/`);
    const bannerResponse = await fetch(
      `${hostname}/api/commercials/advertisements/?type=1`
    );
    const bannerData = await bannerResponse.json();
    const data = await response.json();

    return { props: { data, bannerData } };
  } catch (error) {
    return { props: { data: null } };
  }
}

const Index = ({ data, bannerData }) => {
  // const router = useRouter();
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
      {/* <button
        onClick={() => router.back()}
        className="bg-green-500 w-[50px] text-white text-2xl rounded-md mb-5"
      >
        &#8249;
      </button> */}
      {/* <div>Bas sahypa / gallery</div> */}
      <h1 className="flex text-4xl">
        {content.photo} <div>(+{data.count})</div>
      </h1>
      <Image
        src={bannerData[0].image}
        width={1000}
        height={500}
        alt=""
        className="w-full h-[300px] object-cover rounded-md mt-10"
      />
      <GalleryCard grid={3} data={data.results} />
    </Container>
  );
};
export default Index;
