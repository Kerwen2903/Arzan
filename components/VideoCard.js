import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DownloadIcon,
  EyeIcon,
  HeartIcon,
  PlayIcon,
  XIcon,
} from '@heroicons/react/outline';
import EveryButton from './miniComponents/EveryButton';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCookie } from 'cookies-next';
import { hostname } from '../setting';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import ReactPlayer from 'react-player';
import { Triangle } from 'react-loader-spinner';

const VideoCard = ({ users, grid, data, videosUrl }) => {
  const [videos, setVideos] = useState(data.results);
  const [hasMore, setHasMore] = useState(true);
  const [pageCount, setPageCount] = useState(2);
  const [nextPage, setNextPage] = useState(data.next);
  const [trigger, setTrigger] = useState(1);
  const getMorePost = async () => {
    let page = '';
    let poz = '';
    getCookie('location') != '' || router.query ? (poz = '?') : (poz = '&');
    if (nextPage) {
      page = poz + `page=${pageCount}`;
    }

    fetch(`${videosUrl}${page}`).then((response) =>
      response.json().then((data) => {
        setPageCount(pageCount + 1);
        setNextPage(data.next);
        setVideos([...videos, ...data.results]);
        if (!data.next) setHasMore(false);
      })
    );
  };

  const [imageCount, setImageCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [videoId, setVideoId] = useState();
  const [video, setVideo] = useState();
  const [isLiked, setIsLiked] = useState(videos[imageCount].is_liked);
  useEffect(() => {
    setIsLiked(videos[imageCount].is_liked);
  }, [imageCount]);
  const getImage = async () => {
    if (videoId) {
      const headers = {
        'Content-Type': 'application/json',

        'Accept-language': 'tk',
      };
      if (getCookie('token')) {
        headers.Authorization = `Token ${getCookie('token')}`;
      }
      const res = await fetch(`${hostname}/api/galleries/videos/${videoId}/`, {
        headers,
      });
      const videoReal = await res.json();
      setVideo(videoReal);
    }
  };
  useEffect(() => {
    getImage();
  }, [videoId]);
  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  useEffect(() => {
    if (getCookie('token')) {
      LikePost();
    }
  }, [isLiked]);

  const LikePost = async () => {
    if (videoId) {
      const headers = {
        'Content-Type': 'application/json',
        'Accept-language': 'tk',
      };
      if (getCookie('token')) {
        headers.Authorization = `Token ${getCookie('token')}`;
      }
      const { like } = await axios.post(
        `${hostname}/api/galleries/videos/${videoId}/like/`,
        {
          is_liked: isLiked,
        },
        {
          headers,
        }
      );
    }
  };
  return (
    <div className="mt-10">
      <div className="flex justify-between mb-3">
        {users && <EveryButton />}
      </div>
      <div className="grid grid-cols-5"></div>
      <div>
        <InfiniteScroll
          dataLength={(pageCount - 1) * 10}
          next={getMorePost}
          hasMore={hasMore}
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${grid} gap-4 mt-5`}
        >
          {videos.map((info, index) => {
            return (
              <div
                key={index}
                className="relative border-2 rounded-sm border-[#E5E5E5] cursor-pointer"
              >
                {info.owner.is_official ? (
                  <Link href={`users/${info.owner.username}-${info.owner.id}`}>
                    <div className="p-2 flex items-center gap-3">
                      <Image
                        src={
                          !info.owner.avatar
                            ? `/pets/${info.owner.id % 10}.png`
                            : info.owner.avatar
                        }
                        alt=""
                        width={1000}
                        height={500}
                        className="w-12 h-12 rounded-full border-green-600 border-2 object-cover"
                      />
                      {info.owner.username}
                    </div>
                  </Link>
                ) : (
                  <div className="p-2 flex items-center gap-3">
                    <Image
                      src={
                        !info.owner.avatar
                          ? `/pets/${info.owner.id % 10}.png`
                          : info.owner.avatar
                      }
                      alt=""
                      width={1000}
                      height={500}
                      className="w-12 h-12 rounded-full border-green-600 border-2 object-cover"
                    />
                    {info.owner.username}
                  </div>
                )}
                <div className="relative flex items-center justify-center">
                  <Image
                    onClick={() => {
                      setVideoId(info.id);
                      setImageCount(index);
                      setIsOpen(true);
                    }}
                    height={1000}
                    width={1000}
                    alt=" "
                    src={info.thumbnail}
                    className="w-full h-48 object-cover"
                  />
                  <PlayIcon
                    onClick={() => {
                      setVideoId(info.id);
                      setImageCount(index);
                      setIsOpen(true);
                    }}
                    className="w-12 h-12 absolute text-gray-400 bg-gray-300 rounded-full "
                  />
                </div>

                <div>
                  <div className="p-3">{info.description}</div>
                  <div className="flex justify-between items-center">
                    <div className="flex  text-[#747474] text-xs p-3 gap-5">
                      <div className="flex items-center gap-1">
                        {info.download_count}{' '}
                        <DownloadIcon className="h-4 w-4" />{' '}
                      </div>
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        {info.view_count}
                      </div>
                    </div>
                    <div className="flex items-center gap-1  text-red-600 mr-5">
                      <HeartIcon
                        className="h-4 w-4"
                        fill={info.is_liked ? 'red' : 'white  '}
                      />
                      {info.like_count}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </InfiniteScroll>
      </div>
      {isOpen && (
        <div className="fixed bg-gray-900  h-full top-0 left-0 w-full ">
          <div className="relative h-full">
            <HeartIcon
              fill={isLiked ? 'red' : ''}
              className="xl:h-10 h-6 xl:w-10 w-6 text-red-500 absolute right-52 xl:right-72 bottom-9 z-30 cursor-pointer"
              onClick={handleLike}
            />
            <ReactPlayer
              url={`${videos[imageCount].file}`}
              height={'100%'}
              width={'100%'}
              controls
            />
            {/* <video controls className="h-[80%] object-contain m-auto mt-[3%]">
              <source
                src={`${data.results[imageCount].file}`}
                type="video/mp4"
              />
            </video> */}
            <div className="absolute top-10 right-10">
              <XIcon
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 cursor-pointer text-white"
              />
            </div>
            {!imageCount == 0 && (
              <div
                onClick={() => {
                  setImageCount(imageCount - 1);
                }}
                className="absolute left-0 top-1/2 cursor-pointer"
              >
                <ArrowLeftIcon className="w-16 h-16 text-white" />
              </div>
            )}
            {!imageCount == 0 && (
              <div
                onClick={() => {
                  setImageCount(imageCount + 1);
                }}
                className="absolute right-0 top-1/2 cursor-pointer"
              >
                <ArrowRightIcon className="w-16 h-16 text-white" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCard;
