import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';
import Container from '../components/Container';
import GalleryCard from '../components/GalleryCard';
import VideoCard from '../components/VideoCard';
import PostCards from '../components/PostCards';
import { useState } from 'react';
import { hostname } from '../setting';
import { parse } from 'cookie';
import { useRouter } from 'next/router';

export async function getServerSideProps(context) {
  const { query, req } = context;
  const cookies = parse(req.headers.cookie || '');
  let location = '';
  if (cookies.location) location = `&location=${cookies.location}`;
  try {
    const headers = {
      'Content-Type': 'application/json',

      'Accept-language': cookies.language || 'tk',
    };
    let postsUrl = `${hostname}/api/posts/?search=${query.search}`;
    let galleriesUrl = `${hostname}/api/galleries/?search=${query.search}`;
    let videosUrl = `${hostname}/api/galleries/videos/?search=${query.search}`;
    const postsResponse = await fetch(postsUrl + location, {
      headers,
    });
    const galleriesResponse = await fetch(galleriesUrl + location, {
      headers,
    });

    const videosResponse = await fetch(videosUrl + location, {
      headers,
    });
    const postsData = await postsResponse.json();
    const galleriesData = await galleriesResponse.json();
    const videosData = await videosResponse.json();

    return {
      props: {
        postsData,
        galleriesData,
        videosData,
        postsUrl,
        galleriesUrl,
        videosUrl,
      },
    };
  } catch (error) {
    return {
      props: { postsData: null, galleriesData: null, videosData: null },
    };
  }
}
const Search = ({
  postsData,
  galleriesData,
  videosData,
  postsUrl,
  galleriesUrl,
  videosUrl,
}) => {
  const [isOpenPosts, setIsOpenPosts] = useState(true);
  const [isOpenGalleries, setIsOpenGalleries] = useState(false);
  const [isOpenVideos, setIsOpenVideos] = useState(false);
  const router = useRouter();
  return (
    <Container>
      <button
        onClick={() => router.back()}
        className="bg-green-500 w-[50px] text-white text-2xl rounded-md mb-5"
      >
        &#8249;
      </button>
      {postsData.count !== 0 && (
        <div>
          <div
            className="flex items-center gap-5 -mb-12"
            onClick={() => setIsOpenPosts(!isOpenPosts)}
          >
            <h1 className="text-xl text-[#747474]">
              Arzanladyshlar({postsData.count})
            </h1>
            <div className="flex h-[1.5px] rounded-full w-full bg-[#747474] my-auto"></div>
            {isOpenPosts ? (
              <ChevronDownIcon className="h-8 w-8 text-[#747474]" />
            ) : (
              <ChevronUpIcon className="h-8 w-8 text-[#747474]" />
            )}
          </div>
          {isOpenPosts && (
            <PostCards grid={4} data={postsData} postsUrl={postsUrl} />
          )}
        </div>
      )}
      {/* --------------- */}
      {galleriesData.count !== 0 && (
        <div>
          <div
            className="flex items-center gap-5 mt-5"
            onClick={() => setIsOpenGalleries(!isOpenGalleries)}
          >
            <h1 className="text-xl text-[#747474]">
              Galleries({galleriesData.count})
            </h1>
            <div className="flex h-[1.5px] rounded-full w-full bg-[#747474] my-auto"></div>
            {isOpenGalleries ? (
              <ChevronDownIcon className="h-8 w-8 text-[#747474]" />
            ) : (
              <ChevronUpIcon className="h-8 w-8 text-[#747474]" />
            )}
          </div>
          {isOpenGalleries && (
            <GalleryCard grid={3} data={galleriesData.results} />
          )}
        </div>
      )}
      {/* ------------------------------------------------- */}
      {videosData.count !== 0 && (
        <div>
          <div
            className="flex items-center gap-5 mt-5"
            onClick={() => setIsOpenVideos(!isOpenVideos)}
          >
            <h1 className="text-xl text-[#747474]">
              Galleries({videosData.count})
            </h1>
            <div className="flex h-[1.5px] rounded-full w-full bg-[#747474] my-auto"></div>
            {isOpenVideos ? (
              <ChevronDownIcon className="h-8 w-8 text-[#747474]" />
            ) : (
              <ChevronUpIcon className="h-8 w-8 text-[#747474]" />
            )}
          </div>
          {isOpenVideos && (
            <VideoCard
              grid={2}
              data={videosData.results}
              videosUrl={videosUrl}
            />
          )}
        </div>
      )}
    </Container>
  );
};
export default Search;
