import Container from '../../components/Container';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';
import 'swiper/swiper-bundle.css';
import Image from 'next/image';
import { parse } from 'cookie';
import { hostname } from '../../setting';
import {
  BookmarkIcon,
  CalendarIcon,
  ChatIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
} from '@heroicons/react/outline';
import { useEffect, useRef, useState } from 'react';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { comment } from 'postcss';
import { ToastContainer, toast } from 'react-toastify';
import tk from '../../static/locales/tk.json';
import ru from '../../static/locales/ru.json';
import en from '../../static/locales/en.json';
SwiperCore.use([Navigation, Pagination, Autoplay]);

export async function getServerSideProps(context) {
  const { req, query } = context;

  try {
    const cookies = parse(req.headers.cookie || '');
    const language = cookies.language;
    const token = cookies.token;
    let location = '';
    if (cookies.location) {
      location = `?location=${cookies.location}`;
    }

    const headers = {
      'Content-Type': 'application/json',

      'Accept-language': language || 'tk',
    };
    const reportResponse = await fetch(`${hostname}/api/posts/report_types/`, {
      headers,
    });
    if (token) {
      headers.Authorization = `Token ${token}`;
    }
    const slugArray = query.slug.split('-');
    const lengthSlugArray = slugArray.length - 1;
    const queryId = slugArray[lengthSlugArray];
    const postUrl = `${hostname}/api/posts/${queryId}/`;
    const response = await fetch(postUrl, {
      headers,
    });
    let owner;
    owner = false;
    const data = await response.json();
    const reportTypes = await reportResponse.json();
    if (cookies.username == data.owner.username) {
      owner = true;
    }

    return { props: { data, owner, reportTypes } };
  } catch (error) {
    return { props: { data: null } };
  }
}
const Posts = ({ data, owner, reportTypes }) => {
  const router = useRouter();
  const [report, setReport] = useState();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [commentData, setCommentData] = useState([]);
  const [commentAdd, setCommentAdd] = useState('');
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(data?.is_liked);
  const [isBooked, setIsBooked] = useState(data?.is_saved);
  const notify = (text) => {
    toast.success(text, {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });
  };

  const handleBooked = () => {
    setIsBooked(!isBooked);
  };
  const handleLikedOff = () => {
    setIsLiked(!isLiked);
  };
  const booked = async () => {
    const token = getCookie('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept-language': 'tk',
    };
    if (token) {
      headers.Authorization = `Token ${token}`;
    }
    const { follow } = await axios.post(
      `${hostname}/api/posts/${data.id}/save/`,
      {
        is_saved: isBooked,
      },
      {
        headers,
      }
    );
  };
  useEffect(() => {
    if (getCookie('token')) {
      if (getCookie('username') != data.owner.username) {
        booked();
      }
    }
  }, [isBooked]);
  const handleLiked = async () => {
    const token = getCookie('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept-language': 'tk',
    };
    if (token) {
      headers.Authorization = `Token ${token}`;
    }
    const { follow } = await axios.post(
      `${hostname}/api/posts/${data.id}/like/`,
      {
        is_liked: isLiked,
      },
      {
        headers,
      }
    );
  };

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
        `${hostname}/api/posts/comments/?post=${data.id}&ordering=-date_created`,
        headers
      );
      const commentDataR = response.data;
      setCommentData(commentDataR.results);
    } catch (error) {}
  };
  useEffect(() => {
    Comment();
  }, []);
  useEffect(() => {
    if (getCookie('token') && data.owner.username != getCookie('username')) {
      if (data.owner.username != getCookie('username')) {
        handleLiked();
      }
    }
  }, [isLiked]);
  useEffect(() => {});
  const handleAddComment = async (event) => {
    event.preventDefault();
    const newComment = {
      content: commentAdd,
      post: data.id,
    };
    const token = getCookie('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept-language': 'tk',
    };
    if (token) {
      headers.Authorization = `Token ${token}`;
    }
    const response = await fetch(`${hostname}/api/posts/comments/`, {
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
  const handleDelete = async () => {
    try {
      const headers = {
        headers: {
          'Content-Type': 'application/json',
          'Accept-language': 'tk',
          Authorization: `Token ${getCookie('token')}`,
        },
      };
      const response = await axios.delete(
        `${hostname}/api/posts/${data.id}/`,
        headers
      );

      router.push('/users/me?deleted=success');
    } catch (error) {}
  };
  const handleReport = async () => {
    if (report) {
      const token = getCookie('token');
      const headers = {
        'Content-Type': 'application/json',
        'Accept-language': 'tk',
      };
      if (token) {
        headers.Authorization = `Token ${token}`;
      }
      const { follow } = await axios
        .post(
          `${hostname}/api/posts/reports/`,
          {
            post: data.id,
            type: report,
          },
          {
            headers,
          }
        )
        .then((response) => {
          if (response.status === 201) {
            setIsReportModalOpen(false);
            notify(content['reported successfully']);
          }
        });
    }
  };
  useEffect(() => {
    if (router.query.edit == 'success') {
      notify(content['edited with success']);
    }
  }, []);
  // =================================================
  // const [hasMore, setHasMore] = useState(true);
  // const [pageCount, setPageCount] = useState();
  // useEffect(() => {
  //   setPageCount(2);
  // }, [router.query]);
  // const getMorePost = async () => {
  //   if (data.next) {
  //     let page = '';
  //     let poz = '';
  //     if (getCookie('location') || router.query) poz = '&';
  //     else poz = '&';
  //     if (data.next) {
  //       setPageCount(pageCount + 1);
  //       page = poz + `page=${pageCount}`;
  //     }
  //     const res = await fetch(
  //       `${hostname}api/posts/comments/?post=${data.id}${page}`
  //     );
  //     const newComment = await res.json();

  //     setCommentData([commentData, ...newComment.results]);
  //   }
  // };
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
  const handleCopy = () => {
    navigator.clipboard.writeText(hostname + router.asPath);
    notify(content['link copied']);
  };
  return (
    <>
      <Container>
        <button
          onClick={() => router.back()}
          className="bg-green-500 w-[50px] text-white text-2xl rounded-md mb-5"
        >
          &#8249;
        </button>
        <div className="relative ">
          {data.owner.is_official ? (
            <Link
              href={`/users/${data.owner.username}-${data.owner.id}`}
              className="flex w-min"
            >
              <div className=" mb-10  flex items-center gap-5 text-xl">
                {
                  <Image
                    src={
                      !data.owner.avatar
                        ? `/pets/${data.owner.id % 10}.png`
                        : `${data.owner.avatar}`
                    }
                    width={500}
                    height={500}
                    className="w-14 h-14 rounded-full border-2 border-green-600 object-cover"
                    alt=""
                  />
                }
                {data.owner.username}
              </div>
            </Link>
          ) : (
            <div className=" mb-10 flex items-center gap-5 text-xl w-min">
              {
                <Image
                  src={
                    !data.owner.avatar
                      ? `/pets/${data.owner.id % 10}.png`
                      : `${data.owner.avatar}`
                  }
                  width={500}
                  height={500}
                  className="w-14 h-14 rounded-full border-2 border-green-600 object-cover"
                  alt=""
                />
              }
              {data.owner.username}
            </div>
          )}
          <div className="h-[300px] md:h-2/3 relative rounded-sm  ">
            <Swiper
              modules={{ Autoplay }}
              autoplay={{
                delay: 41000,
                disableOnInteraction: false,
              }}
              loop
              slidesPerView={1}
              spaceBetween={30}
              navigation={{
                prevEl: '.my-prev-button',
                nextEl: '.my-next-button',
              }}
              pagination={{ clickable: true }}
              className="h-full"
            >
              {data.images.map((lel, index) => (
                <SwiperSlide key={index} className="md:h-2/3">
                  <Image
                    height={500}
                    width={1000}
                    alt=" "
                    className=" w-full h-[300px] md:h-[600px] object-contain   rounded-md"
                    src={`${lel.file}`}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="my-prev-button absolute flex top-1/2 bg-white w-11 h-11 rounded-full justify-center p-0 z-10 left-5 text-[35px] cursor-pointer">
              <div className="mt-[-8px]">&#8249;</div>
            </div>
            <div className="my-next-button absolute flex top-1/2 bg-white w-11 h-11 rounded-full justify-center p-0 z-10 right-5 text-[35px] cursor-pointer">
              <div className="mt-[-8px]">&#8250;</div>
            </div>
          </div>
          {/* <div className=" absolute flex top-1/2 bg-green-500 text-white w-14 h-14 rounded-full justify-center items-center p-0 z-10 left-5  cursor-pointer">
            <div className="text-6xl mt-[-18px]">&#8249;</div>
          </div>
          <div className=" absolute flex top-1/2 bg-green-500 text-white w-14 h-14 rounded-full justify-center items-center p-0 z-10 right-5  cursor-pointer">
            <div className="text-6xl mt-[-18px]">&#8250;</div>
          </div> */}
        </div>
        <div className="">
          <div className="flex justify-between  m-auto mt-5">
            <div className="flex w-44">
              <BookmarkIcon
                className="w-7 h-7 cursor-pointer"
                fill={isBooked ? 'black' : 'white'}
                onClick={() => handleBooked()}
              />
              <ShareIcon
                className="w-7 h-7 cursor-pointer"
                onClick={() => handleCopy()}
              />
            </div>
            <label>
              {/* {data.owner.username != getCookie('username') && ( */}
              <HeartIcon
                onClick={() => handleLikedOff()}
                fill={isLiked ? 'red' : 'white'}
                className="w-7 h-7 text-red-600 cursor-pointer"
              />
              {/* )} */}
            </label>
          </div>
          <div className="flex  m-auto gap-5 mt-5 text-gray-500">
            <div>{data.date_created}</div>
            <div className="flex items-center">
              <EyeIcon className="w-5 h-5" /> {data.view_count}
            </div>
            <div className="flex items-center">
              <HeartIcon className="w-5 h-5" />
              {data.like_count}
            </div>
            <div className="flex items-center">
              <ChatIcon className="w-5 h-5" /> {data.comments_count}
            </div>
          </div>
          <div className="">
            <h1 className="md:text-4xl text-xl mb-5 mt-5">{data.name}</h1>
            <div className="w-full h-[1px] bg-[#E5E5E5]"></div>
            <div className="flex justify-between items-center">
              <div>
                <div className="flex text-4xl items-end text-green-500 font-bold gap-3 mt-6">
                  {data.discount}
                  <h1 className="text-xl text-black font-[400]"> manat</h1>{' '}
                  <h1 className="line-through text-xl text-[#AAAAAA] ml-10 font-[400]">
                    {data.price} manat
                  </h1>
                </div>
                <div className="flex items-center mt-5 gap-2 text-[#AAAAAA]">
                  <CalendarIcon className="w-5 h-5 " />
                  {data.date_started} - {data.date_finished}
                </div>
              </div>
              <div className="flex w-16 h-16 bg-green-500 text-white justify-center text-2xl rounded-full items-center">
                {data.discount_percent}%
              </div>
            </div>
            <div className="w-full h-[1px] bg-[#E5E5E5] mt-7"></div>
            <h1 className="my-5 text-justify">{data && data.description}</h1>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tags, index) => (
                <div
                  className="bg-green-100 text-green-600 rounded-md px-2 w-max"
                  key={index}
                >
                  <Link href={`/search?search=${tags}`}>#{tags}</Link>
                </div>
              ))}
            </div>
            {owner && (
              <div className="mt-3 grid grid-cols-2 sm:flex flex-wrap gap-3 ">
                {/* <div className="p-2 bg-green-500 text-white h-minw-full sm:w-48 px-5 rounded-lg text-center cursor-pointer">
                  One gecir
                </div> */}
                <div
                  className="p-2  bg-red-600 text-white w-full sm:w-48 px-5 rounded-lg text-center cursor-pointer "
                  onClick={() => setIsOpenDelete(true)}
                >
                  {content.delete}
                </div>
                <Link href={`/posts/${data.name}-${data.id}/edit`}>
                  <div className="p-2  bg-green-500 text-white w-full sm:w-48 px-5 rounded-lg text-center cursor-pointer ">
                    {content.edit}
                  </div>
                </Link>
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 sm:flex gap-3 mb-5 ">
              {!owner && getCookie('token') && (
                <div
                  className="p-2  border-red-600 text-red-600 border-2 w-full sm:w-48 px-5 rounded-lg text-center cursor-pointer"
                  onClick={() => setIsReportModalOpen(true)}
                >
                  {content.report}
                </div>
              )}
              <div
                onClick={() => setIsCommentOpen(!isCommentOpen)}
                className="p-2  border-gray-500 text-gray-500 border-2 w-full sm:w-48 px-5 rounded-lg  cursor-pointer flex justify-center items-center"
              >
                {content.comments}
                {!isCommentOpen ? (
                  <ChevronDownIcon className="h-5 w-5" />
                ) : (
                  <ChevronUpIcon className="h-5 w-5" />
                )}
              </div>
            </div>
            {/* ----comment-place */}

            {isCommentOpen && (
              <div>
                {getCookie('token') && (
                  <form className="flex h-[50px]" onSubmit={handleAddComment}>
                    <input
                      className="w-full border-[1px] px-4 rounded-l-md"
                      onChange={(e) => setCommentAdd(e.target.value)}
                      type="text"
                      name="comment"
                      placeholder={content['add-comment']}
                    />
                    <button
                      type="submit"
                      className="bg-green-500 text-white py-1 px-2 rounded-r-md"
                    >
                      {content.send}
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
            {/* -------------------------------------delete------------------------------------------------------------- */}
            {isOpenDelete && (
              <div
                className="fixed top-0 left-0 w-full h-full bg-black/25 backdrop-blur-md z-50"
                onClick={() => setIsOpenDelete(false)}
              ></div>
            )}

            {isOpenDelete && (
              <div className="fixed lg:w-[500px] h-max   bg-white m-auto z-50   inset-0 flex flex-col  p-10 rounded-md">
                <div className="lg:text-2xl py-5">
                  {content['Are you sure to delete']} ({data.name}) ?
                </div>
                <div className=" w-full grid grid-cols-2 gap-6">
                  <div
                    className="px-10 py-2 bg-red-500 text-white rounded-md cursor-pointer"
                    onClick={() => handleDelete()}
                  >
                    {content.yes}
                  </div>
                  <div
                    className="px-10 py-2 bg-green-400 text-white rounded-md cursor-pointer"
                    onClick={() => setIsOpenDelete(false)}
                  >
                    {content.no}
                  </div>
                </div>
              </div>
            )}
            {/* -------------------------------------report-------------------------------------- */}
            {isReportModalOpen && (
              <div
                className="fixed top-0 left-0 w-full h-full bg-black/25 backdrop-blur-md z-50"
                onClick={() => setIsReportModalOpen(false)}
              ></div>
            )}
            {isReportModalOpen && (
              <div className="fixed lg:w-[400px]   bg-white m-auto z-50   inset-0 flex flex-col   rounded-md h-min">
                <div className="border-b-[1px] p-4">{content.report}</div>

                {reportTypes?.map((reports, i) => (
                  <div key={i} className="gap-2 grid grid-cols-10 p-3 px-5">
                    <input
                      type="radio"
                      name="report"
                      id={`report-${i}`}
                      value={reports.id}
                      onChange={(e) => setReport(e.target.value)}
                    />
                    <label htmlFor={`report-${i}`} className="ml-2 col-span-9">
                      {reports.name}
                    </label>
                  </div>
                ))}
                <button
                  onClick={() => handleReport()}
                  className="px-10 py-2 border-red-500 border-2 text-red-500 m-5 rounded-md cursor-pointer"
                >
                  {content.report}
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
};
export default Posts;
