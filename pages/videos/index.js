import Image from 'next/image';
import Container from '../../components/Container';
import { parse } from 'cookie';
import VideoCard from '../../components/VideoCard';
import { hostname } from '../../setting';
// import { useRouter } from 'next/router';

export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = parse(req.headers.cookie || '');
  let location = '';
  if (cookies.location) location = `?location=${cookies.location}`;

  try {
    const headers = {
      'Content-Type': 'application/json',

      'Accept-language': cookies.language || 'tk',
    };
    if (cookies.token) {
      headers.Authorization = `Token ${cookies.token}`;
    }
    const url = `${hostname}/api/galleries/videos/` + location;
    const response = await fetch(url, {
      headers,
    });
    const data = await response.json();
    const bannerResponse = await fetch(
      `${hostname}/api/commercials/advertisements/?type=2`
    );
    const bannerData = await bannerResponse.json();

    return { props: { data, bannerData, url } };
  } catch (error) {
    return { props: { data: null } };
  }
}

const index = ({ data, bannerData, url }) => {
  // const router = useRouter();
  return (
    <Container>
      {/* <button
        onClick={() => router.back()}
        className="bg-green-500 w-[50px] text-white text-2xl rounded-md mb-5"
      >
        &#8249;
      </button> */}
      {/* <div className="mt-3">Bas sahypa / wideolar</div> */}
      <h1 className="flex text-4xl mt-5">
        Videos <div>({data.count})</div>
      </h1>
      <Image
        src={bannerData[0].image}
        width={1000}
        height={500}
        alt=""
        className="w-full h-[300px] object-cover rounded-md mt-10"
      />
      <VideoCard grid={3} data={data} videosUrl={url} />
    </Container>
  );
};
export default index;
