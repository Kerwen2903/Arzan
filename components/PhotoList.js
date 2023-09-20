import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  HeartIcon,
  LockClosedIcon,
  XIcon,
} from '@heroicons/react/outline';
import EveryButton from './miniComponents/EveryButton';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { hostname } from '../setting';
import { getCookie } from 'cookies-next';
import axios from 'axios';

const PhotoList = ({ users, grid, data, username }) => {
  const [imageCount, setImageCount] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [imageId, setImageId] = useState();
  const [image, setImage] = useState();
  const [isLiked, setIsLiked] = useState(image?.is_liked);
  const handleLike = () => {
    setIsLiked(!isLiked);
  };
  useEffect(() => {
    if (getCookie('token')) {
      LikePost();
    }
  }, [isLiked]);
  useEffect(() => {
    getImage();
  }, [imageId]);
  const LikePost = async () => {
    if (imageId) {
      const headers = {
        'Content-Type': 'application/json',
        'Accept-language': 'tk',
      };
      if (getCookie('token')) {
        headers.Authorization = `Token ${getCookie('token')}`;
      }
      const { like } = await axios.post(
        `${hostname}/api/galleries/images/${imageId}/like/`,
        {
          is_liked: isLiked,
        },
        {
          headers,
        }
      );
    }
  };
  const getImage = async () => {
    if (imageId) {
      const headers = {
        'Content-Type': 'application/json',

        'Accept-language': 'tk',
      };
      if (getCookie('token')) {
        headers.Authorization = `Token ${getCookie('token')}`;
      }
      const res = await fetch(`${hostname}/api/galleries/images/${imageId}/`, {
        headers,
      });
      const imageReal = await res.json();
      setImage(imageReal);
      setIsLiked(imageReal.is_liked);
    }
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between mb-3">
        <div className="text-2xl flex items-center gap-5">
          <Image
            src={
              '/images/12.jpg'
              // !data.owner.avatar
              //   ? `/pets/${data.owner.id % 10}.png`
              //   : `${data.owner.avatar}`
            }
            width={1000}
            height={500}
            alt=""
            className="rounded-full w-12 h-12 border-2 border-green-700 "
          />
          {username}
        </div>
        {users && <EveryButton />}
      </div>
      <div className="grid grid-cols-5"></div>
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-${grid} gap-4 mt-5`}
      >
        {data.map((info, index) => {
          return (
            <div
              onClick={() => {
                setImageId(info.id);
                setImageCount(index);
                setIsOpen(true);
              }}
              key={index}
              className="relative border-2 rounded-lg border-[#E5E5E5] cursor-pointer"
            >
              <Image
                height={1000}
                width={1000}
                alt=" "
                src={info.file}
                className="w-full rounded-md h-56 object-cover"
              />
              <div className="absolute bottom-0 w-full">
                <div className="flex  text-[#747474] text-xs p-3 justify-between ">
                  <div className="flex backdrop-blur-md bg-[#00000024] text-white">
                    <EyeIcon className="h-4 w-4" />
                    {info.view_count}
                  </div>
                  <div className="flex items-center gap-2 backdrop-blur-md bg-[#00000024] text-white">
                    <HeartIcon
                      fill={info.is_liked ? 'red' : 'white'}
                      className={
                        info.is_liked ? 'h-4 w-4 text-red-500' : ' h-4 w-4'
                      }
                    />
                    {info.like_count}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {isOpen && (
        <div className="fixed bg-gray-900  h-full top-0 left-0 w-full ">
          <div className="relative h-[90%] mt-[2%]">
            <Image
              height={1000}
              width={1000}
              alt=" "
              src={data[imageCount].file}
              className="object-contain h-full m-auto"
            />
            <div className="absolute top-10 right-10">
              <XIcon
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 cursor-pointer text-white"
              />
            </div>
            {!imageCount == 0 && (
              <div
                onClick={() => {
                  setImageId(data[imageCount].id - 1);
                  setImageCount(imageCount - 1);
                }}
                className="absolute left-0 top-1/2 cursor-pointer"
              >
                <ArrowLeftIcon className="w-16 h-16 text-gray-500 border-2 border-white rounded-full" />
              </div>
            )}
            {imageCount < data.length - 1 && (
              <div
                onClick={() => {
                  setImageId(data[imageCount].id + 1);
                  setImageCount(imageCount + 1);
                }}
                className="absolute right-0 top-1/2 cursor-pointer"
              >
                <ArrowRightIcon className="w-16 h-16 text-gray-500 border-2 border-white rounded-full" />
              </div>
            )}
            <HeartIcon
              fill={isLiked ? 'red' : ''}
              className="h-10 w-10 text-red-500 absolute right-1/4 bottom-11"
              onClick={handleLike}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoList;
