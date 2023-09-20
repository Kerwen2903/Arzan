import {
  ChartSquareBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LocationMarkerIcon,
  PencilAltIcon,
  PhoneIcon,
} from '@heroicons/react/outline';
import { hostname } from '../../setting';
import { parse } from 'cookie';
import Image from 'next/image';
import Container from '../../components/Container';
import PostCards from '../../components/PostCards';
import { useEffect, useRef, useState } from 'react';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import axios from 'axios';

import tk from '../../static/locales/tk.json';
import ru from '../../static/locales/ru.json';
import en from '../../static/locales/en.json';

export async function getServerSideProps(context) {
  const { req, query } = context;
  const cookies = parse(req.headers.cookie || '');
  const username = cookies.username;
  const token = cookies.token;
  const slugArray = query.slug.split('-');
  const lengthSlugArray = slugArray.length - 1;
  const queryId = slugArray[lengthSlugArray];
  try {
    const headers = {
      'Content-Type': 'application/json',

      'Accept-language': cookies.language || 'tk',
    };
    if (token) {
      headers.Authorization = `Token ${token}`;
    }

    const response = await fetch(`${hostname}/api/users/${queryId}/`, {
      headers,
    });
    const data = await response.json();
    const response2 = await fetch(`${hostname}/api/posts/?owner=${queryId}`, {
      headers,
    });
    if (!data) {
      return {
        redirect: {
          destination: '/',
          permanent: true,
        },
      };
    }
    if (data.username == username) {
      return {
        redirect: {
          destination: '/users/me',
          permanent: false,
        },
      };
    }
    if (response.status == 404) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
    const myPosts = await response2.json();

    return { props: { data, myPosts } };
  } catch (error) {
    return { props: { data: null, myPosts: null } };
  }
}
const UserProfil = ({ data, myPosts }) => {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentData, setCommentData] = useState([]);
  const [commentAdd, setCommentAdd] = useState('');
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
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(data.is_following);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(true);
    handleFollow();
  }, [isFollowing]);
  const handleFollow = async () => {
    if (getCookie('token') && isFollowing != null) {
      const token = getCookie('token');

      const headers = {
        'Content-Type': 'application/json',

        'Accept-language': 'tk',
      };
      if (token) {
        headers.Authorization = `Token ${token}`;
      }
      const { follow } = await axios.post(
        `${hostname}/api/users/${data.id}/follow/`,
        {
          is_following: isFollowing,
        },
        {
          headers,
        }
      );
    }
  };

  // ------------------------------------------------comment------------------------------------------
  const Comment = async () => {
    try {
      const headers = {
        headers: {
          'Content-Type': 'application/json',
          'Accept-language': 'tk',
        },
      };
      const token = getCookie('token');
      if (token) {
        headers.Authorization = `Token ${token}`;
      }
      const response = await axios(
        `${hostname}/api/users/comments/?user=${data.id}&ordering=-date_created`,
        headers
      );
      const commentDataR = response.data;
      setCommentData(commentDataR.results);
    } catch (error) {}
  };
  useEffect(() => {
    Comment();
  }, []);

  const handleAddComment = async (event) => {
    event.preventDefault();
    const newComment = {
      content: commentAdd,
      user: data.id,
    };
    const token = getCookie('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept-language': 'tk',
    };
    if (token) {
      headers.Authorization = `Token ${token}`;
    }
    const response = await fetch(`${hostname}/api/users/comments/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newComment),
    });
    if (response.ok) {
      const comment = await response.json();
      setCommentData([comment, ...commentData]);
    } else {
    }
  };
  const commentSectionRef = useRef(null);
  useEffect(() => {
    if (commentSectionRef.current) {
      commentSectionRef.current.scrollTop =
        commentSectionRef.current.scrollHeight;
    }
  }, [commentData, isCommentOpen]);

  return (
    <Container>
      <button
        onClick={() => router.back()}
        className="bg-green-500 w-[50px] text-white text-2xl rounded-md mb-2"
      >
        &#8249;
      </button>
      <div className="w-full flex m-auto">
        <div className="w-full">
          <div className="w-full relative ">
            <div
              className={
                !data.avatar
                  ? 'w-full h-96 bg-black flex items-center justify-center'
                  : 'bg-black'
              }
            >
              {data.avatar ? (
                <Image
                  alt=" "
                  src={data.avatar}
                  height={500}
                  width={1000}
                  className={
                    !data.avatar
                      ? ' w-min   h-48'
                      : 'w-full h-96  object-contain'
                  }
                />
              ) : (
                <Image
                  alt=" "
                  src={`/pets/${data.id % 10}.png`}
                  height={500}
                  width={1000}
                  className={
                    !data.avatar
                      ? ' w-min   h-48'
                      : 'w-full h-96  object-contain'
                  }
                />
              )}
            </div>
            <div className="absolute top-0 h-96 backdrop-blur-sm w-full z-1"></div>
            <div className="flex justify-center mt-[-5vw]">
              <div className=" relative ">
                <div className="bg-black rounded-full">
                  <Image
                    height={1000}
                    width={1000}
                    alt=" "
                    src={
                      !data.avatar ? `/pets/${data.id % 10}.png` : data.avatar
                    }
                    className="rounded-full w-44 h-44 border-[0.6rem] border-white bg-black z-10 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="w-full text-center font-[700] text-2xl">
              {data.username}
            </div>
            <div className="flex items-center gap-2 justify-center text-[#5F5F5F] mt-2">
              <PhoneIcon className="w-5 h-5" />
              993 {data.phone}
            </div>
            <div className="flex items-center gap-2 justify-center text-[#5F5F5F] mt-2">
              <LocationMarkerIcon className="w-5 h-5" />
              Ashgabat
            </div>
            {data.is_official && (
              <div className="text-center text-[#5F5F5F] my-5 ">
                {data.description}
              </div>
            )}
            <div className="flex m-auto w-max gap-5 mt-5">
              <div>
                <div className="text-center font-[500]">
                  {data.followers__count +
                    (isFollowing
                      ? data.is_following
                        ? 0
                        : 1
                      : data.is_following
                      ? -1
                      : 0)}
                </div>
                <div className="text-center text-[#5F5F5F]">
                  {content.followers}
                </div>
              </div>
              <div className="h-11 w-[1px] rounded-full bg-slate-300"></div>
              <div>
                <div className="text-center font-[500]">
                  {data.following__count}
                </div>
                <div className="text-center text-[#5F5F5F]">
                  {content.following}
                </div>
              </div>
              <div className="h-11 w-[1px] rounded-full bg-slate-300"></div>
              <div>
                <div className="text-center font-[500]">
                  {data.posts__like_count__sum}
                </div>
                <div className="text-center text-[#5F5F5F]">
                  {content['like-count']}
                </div>
              </div>
            </div>
            <div className=" mt-7 gap-4 flex justify-center">
              {isActive && (
                <div
                  onClick={() => {
                    setIsFollowing(!isFollowing);
                  }}
                  className={
                    !isFollowing
                      ? 'bg-green-500 flex justify-center w-[220px]   rounded-md py-2 px-16 text-white gap-2 cursor-pointer'
                      : 'bg-gray-200 border-2 border-gray-400 flex justify-center  w-[220px]  rounded-md py-2 px-16 text-gray-400  cursor-pointer'
                  }
                >
                  {!isFollowing ? content.follow : content['un-follow']}
                </div>
              )}
              {/* <div
                onClick={() => setIsCommentOpen(!isCommentOpen)}
                className="p-2  border-gray-300 text-gray-500 border-2  w-[220px]   px-5 rounded-lg  cursor-pointer flex justify-center items-center"
              >
                Teswirler
                {!isCommentOpen ? (
                  <ChevronDownIcon className="h-5 w-5" />
                ) : (
                  <ChevronUpIcon className="h-5 w-5" />
                )}
              </div> */}
            </div>
          </div>
          {/* ----comment-place---------------------------------- */}

          {isCommentOpen && (
            <div className="mt-7">
              {getCookie('token') && (
                <form className="flex h-[50px]" onSubmit={handleAddComment}>
                  <input
                    className="w-full border-[1px] px-4 rounded-l-md"
                    onChange={(e) => setCommentAdd(e.target.value)}
                    type="text"
                    name="comment"
                    placeholder="Add a comment"
                  />
                  <button
                    type="submit"
                    className="bg-green-500 text-white py-1 px-2 rounded-r-md"
                  >
                    Submit
                  </button>
                </form>
              )}
              <div className="mt-5 " ref={commentSectionRef}>
                {commentData.map((comments, i) => (
                  <div className="border-b-[1px] mb-5" key={i}>
                    <div className="flex justify-between">
                      <div className="flex">
                        <Image
                          src={
                            !comments.owner.avatar
                              ? `/pets/${comments.owner.id % 10}.png`
                              : `${comments.owner.avatar}`
                          }
                          width={50}
                          height={50}
                          alt=""
                          className="object-cover rounded-full mr-4 w-[50px] h-[50px]"
                        />
                        <div>
                          <h1>{comments.owner.username}</h1>
                          <h1 className="text-[#747474] text-sm">
                            {comments.date_created}
                          </h1>
                        </div>
                      </div>
                      {/* <button className="bg-green-500 text-white rounded-md px-2">
                          Jogap ber
                        </button> */}
                    </div>
                    <div className="my-5">{comments.content}</div>
                    {/* <div>otwet</div> */}
                  </div>
                ))}
              </div>
              {/* <div onClick={getMorePost()}>read more..</div> */}
            </div>
          )}

          {myPosts.count != 0 && (
            <PostCards data={myPosts} grid={3} title={content.posts} />
          )}
        </div>
      </div>
    </Container>
  );
};

export default UserProfil;
