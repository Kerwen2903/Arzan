import Link from 'next/link';
import Container from '../components/Container';
import setting, { hostname } from '../setting';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { parse } from 'cookie';
import { useRouter } from 'next/router';
import { getCookie } from 'cookies-next';
import tk from '../static/locales/tk.json';
import ru from '../static/locales/ru.json';
import en from '../static/locales/en.json';
import InfiniteScroll from 'react-infinite-scroll-component';
import OfficialsSkeleton from '../components/skeleton/OfficialsSkeleton';
import axios from 'axios';

export async function getServerSideProps(context) {
  const { req, query } = context;
  const cookies = parse(req.headers.cookie || '');
  let location = '';
  if (cookies.location) location = `&location=${cookies.location}`;
  if (location != '' && query.filter) {
    location = `&location=${cookies.location}&ordering=${query.filter}`;
  }
  if (location == '' && query.filter) {
    location = `&ordering=${query.filter}`;
  }
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept-language': cookies.language || 'tk',
    };
    if (cookies.token) {
      headers.Authorization = `Token ${cookies.token}`;
    }
    const url = `${hostname}/api/users/?type=2` + location;
    const response = await fetch(url, {
      headers,
    });

    const data = await response.json();
    let hasMoreServer = true;
    if (data.count < 10) {
      hasMoreServer = false;
    }
    return { props: { data, url, hasMoreServer } };
  } catch (error) {
    return { props: { data: null } };
  }
}

const Officials = ({ data, url, hasMoreServer }) => {
  const router = useRouter();
  const [nextPage, setNextPage] = useState(data.next);
  const [users, setUsers] = useState();
  const [hasMore, setHasMore] = useState(false);
  const [pageCount, setPageCount] = useState(2);
  // ===========================================
  useEffect(() => {
    setUsers(data.results);
    setPageCount(2);
    setHasMore(hasMoreServer);
  }, [router.query]);
  const getMorePost = async () => {
    let page = '';
    let poz = '&';
    getCookie('location') || router.query ? (poz = '&') : (poz = '&');

    page = poz + `page=${pageCount}`;
    const token = getCookie('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept-language': 'tk',
    };
    if (token) {
      headers.Authorization = `Token ${token}`;
    }
    fetch(`${url}${page}`, headers).then((response) =>
      response.json().then((data) => {
        setPageCount(pageCount + 1);
        setNextPage(data.next);
        setUsers([...users, ...data.results]);
        if (!data.next) setHasMore(false);
      })
    );
  };
  // =============================================

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
  const handleFollow = async (index) => {
    const updatedUserList = [...users];
    updatedUserList[index].is_following = !updatedUserList[index].is_following;
    setUsers(updatedUserList);
    const token = getCookie('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept-language': 'tk',
    };
    if (token) {
      headers.Authorization = `Token ${token}`;
    }
    const { follow } = await axios.post(
      `${hostname}/api/users/${users[index].id}/follow/`,
      {
        is_following: users[index].is_following,
      },
      {
        headers,
      }
    );
  };
  // useEffect(() => {
  //   handleFollow;
  // });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);
  return (
    <Container>
      <button
        onClick={() => router.back()}
        className="bg-green-500 w-[50px] text-white text-2xl rounded-md mb-5"
      >
        &#8249;
      </button>
      <h1 className="font-bold text-4xl my-3 flex gap-1 justify-between">
        <div className="flex">
          {content.officials}
          <div className="text-green-700">({data.count})</div>
        </div>
        <div>
          <button
            onClick={() => setIsOpen(true)}
            className="border-[1px] border-gray-500 rounded-md text-xl px-3"
          >
            {content.filter}
          </button>
          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-5 lg:right-24   z-40 mt-2 w-36 lg:w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
              tabIndex="-1"
            >
              <div className="py-1" role="none">
                <>
                  <Link
                    href={`/officials?filter=username`}
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="menu-item-1"
                  >
                    A-Z
                  </Link>

                  <Link
                    href={`/officials?filter=-username`}
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="menu-item-1"
                  >
                    Z-A
                  </Link>
                  <Link
                    href={`/officials?filter=date_joined`}
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="menu-item-1"
                  >
                    {content['log-in-date']}
                  </Link>

                  <Link
                    href={`/officials?filter=posts__like_count__sum`}
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="menu-item-1"
                  >
                    {content['like-count']}
                  </Link>
                  <Link
                    href={`/officials?filter=-balance`}
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="menu-item-1"
                  >
                    {content['balance-count']}
                  </Link>

                  <Link
                    href={`/officials?filter=followers_count`}
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="menu-item-1"
                  >
                    {content.followers}
                  </Link>
                </>
              </div>
            </div>
          )}
        </div>
      </h1>
      <div>
        <InfiniteScroll
          dataLength={nextPage ? (pageCount - 1) * 10 : 11}
          next={getMorePost}
          hasMore={hasMore}
          loader={<OfficialsSkeleton />}
        >
          {users &&
            users.map((user, index) => {
              console.log(users);
              return (
                <div
                  key={index}
                  className="shadow-md p-3 rounded-md flex justify-between"
                >
                  <Link
                    href={`/users/${user.username}-${user.id}`}
                    className="flex gap-5"
                  >
                    {data && (
                      <Image
                        src={
                          !user.avatar
                            ? `/pets/${user.id % 10}.png`
                            : `${user.avatar}`
                        }
                        width={500}
                        height={500}
                        className="w-14 h-14 rounded-full border-2 object-cover border-green-600 "
                        alt=""
                      />
                    )}
                    <div className="font-regular">
                      {user.username}
                      <div className="text-sm text-[#747474]">
                        {content.followers}: {user.followers__count}
                      </div>
                    </div>
                  </Link>
                  <div
                    onClick={() => {
                      handleFollow(index);
                    }}
                    className={
                      !users[index].is_following
                        ? 'bg-green-500 w-max flex  rounded-sm py-1 px-5 my-auto text-white gap-2 border-2 border-green-500'
                        : 'bg-gray-200 border-2 border-gray-400 w-min flex my-auto rounded-sm py-1 px-5 text-gray-400'
                    }
                  >
                    {!users[index].is_following ? 'Yzarla' : 'Yzarlama'}
                  </div>
                </div>
              );
            })}
        </InfiniteScroll>
      </div>
    </Container>
  );
};
export default Officials;
