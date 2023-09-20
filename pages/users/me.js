import {
  ChevronDownIcon,
  ChevronUpIcon,
  LocationMarkerIcon,
  PencilAltIcon,
  PhoneIcon,
} from '@heroicons/react/outline';
import setting, { hostname } from '../../setting';
import { parse } from 'cookie';
import Image from 'next/image';
import Container from '../../components/Container';
import PostCards from '../../components/PostCards';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getCookie } from 'cookies-next';
import { useEffect, useRef, useState } from 'react';
import tk from '../../static/locales/tk.json';
import ru from '../../static/locales/ru.json';
import en from '../../static/locales/en.json';
import axios from 'axios';
import { toast } from 'react-toastify';

export async function getServerSideProps(context) {
  const { req } = context;
  try {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.token;
    let location = '';
    if (cookies.location) location = `?location=${cookies.location}`;

    const headers = {
      'Content-Type': 'application/json',

      'Accept-language': cookies.language || 'tk',
      Authorization: `token ${token}`,
    };

    const response = await fetch(`${hostname}/api/users/me/`, {
      headers,
    });
    const data = await response.json();
    const response2 = await fetch(`${hostname}/api/posts/my_posts/`, {
      headers,
    });
    if (!token) {
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
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [descriptionEdit, setDescriptionEdit] = useState(data?.description);
  const [progress, setProgress] = useState('');
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

  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(data.avatar);
  const updateAvatar = (avatar) => {
    const options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${getCookie('token')}`,
      },
      body: JSON.stringify({ avatar }),
    };

    fetch(`${hostname}/api/users/${data.id}/`, options)
      .then((response) => response.json())
      .then((data) => router.reload())
      .catch((error) => {});
  };
  const updateDescription = (avatar) => {
    const options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${getCookie('token')}`,
      },
      body: JSON.stringify({ description: descriptionEdit }),
    };

    fetch(`${hostname}/api/users/${data.id}/`, options)
      .then((response) => response.json())
      .then((data) => {
        setIsOpenEdit(false);
        notify(content['sent successfully']);
      })
      .catch((error) => {});
  };
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        const percent = (event.loaded / event.total) * 100;
        console.log(`Progress: ${percent}%`);
        setProgress(parseInt(percent));
        // Update progress bar here
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 201) {
            const imageUrl = JSON.parse(xhr.responseText);
            updateAvatar(imageUrl.file);
            resolve(imageUrl);
          } else {
            reject(new Error('Failed to upload image'));
          }
        }
      };

      xhr.open('POST', `${hostname}/api/files/images/`);
      xhr.setRequestHeader('Authorization', `token ${getCookie('token')}`);
      xhr.send(formData);
    });
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
    Comment();
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
  useEffect(() => {
    if (router.query.created == 'success') {
      notify(content['successfully created']);
    }
    if (router.query.deleted == 'success') {
      notify('Ustunlikli pozuldy');
    }
  }, []);
  return (
    <Container>
      <button
        onClick={() => router.back()}
        className="bg-green-500 w-[50px] text-white text-2xl rounded-md mb-10"
      >
        &#8249;
      </button>
      <form>
        <input
          type="file"
          id="photoChanger"
          className="hidden"
          onChange={handleFileSelect}
        />
      </form>
      <div className="w-full flex m-auto">
        <div className="w-full">
          <div className="w-full relative ">
            <div
              className={
                !data.avatar
                  ? 'w-full h-96 bg-black flex items-center justify-center'
                  : ''
              }
            >
              <Image
                height={1000}
                width={1000}
                alt=" "
                src={!imageUrl ? `/pets/${data.id % 10}.png` : imageUrl}
                className={
                  !data.avatar ? ' w-min   h-48' : 'w-full h-96 object-contain'
                }
              />
            </div>
            <div className="absolute top-0 h-96 backdrop-blur-sm w-full z-1"></div>
            <div className="flex justify-center mt-[-5vw]">
              <div className=" relative ">
                <div className="bg-black rounded-full">
                  <Image
                    height={1000}
                    width={1000}
                    alt=" "
                    src={!imageUrl ? `/pets/${data.id % 10}.png` : imageUrl}
                    className="rounded-full w-44 h-44 border-[0.6rem] border-white bg-black z-10 object-cover"
                  />
                </div>
                <label
                  htmlFor="photoChanger"
                  className="absolute z-10 right-4 bottom-4 cursor-pointer"
                >
                  <PencilAltIcon className="border-2 w-7 h-7 text-green-500 bg-white border-white rounded-md" />
                </label>
              </div>
            </div>
            {progress && (
              <div className="flex w-min m-auto mt-3">{progress}%</div>
            )}
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

            <div className="text-center text-[#5F5F5F] my-5 ">
              {descriptionEdit}
            </div>
            {data.is_official && (
              <div
                className="w-max m-auto text-[#5F5F5F] border-2 p-2 rounded-md cursor-pointer"
                onClick={() => setIsOpenEdit(true)}
              >
                {content['edit-description']}
              </div>
            )}

            <div className="flex m-auto w-max gap-5 mt-5">
              <div>
                <div className="text-center font-[500]">
                  {data.pending__count}
                </div>
                <div className="text-center text-[#5F5F5F]">
                  {content.pending}
                </div>
              </div>
              <div className="h-11 w-[1px] rounded-full bg-slate-300"></div>
              <div>
                <div className="text-center font-[500]">
                  {data.rejected__count}
                </div>
                <div className="text-center text-[#5F5F5F]">
                  {content.rejected}
                </div>
              </div>
              <div className="h-11 w-[1px] rounded-full bg-slate-300"></div>
              <div>
                <div className="text-center font-[500]">
                  {data.active__count}
                </div>
                <div className="text-center text-[#5F5F5F]">
                  {content.active}
                </div>
              </div>
            </div>
            {data.is_official && (
              <div className="flex m-auto w-max gap-5 mt-5">
                <div>
                  <div className="text-center font-[500]">
                    {data.followers__count}
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
                    {data.active__count}
                  </div>
                  <div className="text-center text-[#5F5F5F]">
                    {content['like-count']}
                  </div>
                </div>
              </div>
            )}
            {/* <Link href={`/users/wallet`}> */}
            <div className="flex mt-7 justify-center gap-3 ">
              <Link href={`/users/wallet?tab=1`}>
                <div className="bg-green-500 border-green-500 border-2 w-max flex m-auto  rounded-md py-2 px-16 text-white gap-2">
                  <Image
                    src="/arzansurat/coinIcon.svg"
                    width={20}
                    height={20}
                    alt=""
                  />
                  {data.balance}
                </div>
              </Link>
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
              {/* </Link> */}
            </div>
          </div>
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
            <PostCards
              pending={content.pending}
              rejected={content.rejected}
              data={myPosts}
              grid={3}
              title={content['my-posts']}
            />
          )}
        </div>
        {isOpenEdit && (
          <div
            className="fixed top-0 left-0 w-full h-full bg-black/25 backdrop-blur-md z-50"
            onClick={() => setIsOpenEdit(false)}
          ></div>
        )}

        {isOpenEdit && (
          <div className="fixed lg:w-[500px] h-max  bg-white m-auto z-50   inset-0 flex flex-col  p-10 rounded-md">
            <textarea
              rows="4"
              cols="50"
              value={descriptionEdit}
              placeholder="description"
              onChange={(e) => setDescriptionEdit(e.target.value)}
              className="border-2 h-full rounded-md p-3"
            />
            <div
              className="text-white bg-green-500 rounded-md p-2 text-center mt-3 cursor-pointer"
              onClick={() => updateDescription()}
            >
              Send
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default UserProfil;
