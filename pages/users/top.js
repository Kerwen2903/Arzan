import Image from 'next/image';
import Container from '../../components/Container';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { hostname } from '../../setting';
import { parse } from 'cookie';
import { useRouter } from 'next/router';
import tk from '../../static/locales/tk.json';
import ru from '../../static/locales/ru.json';
import en from '../../static/locales/en.json';
import { getCookie } from 'cookies-next';
import InfiniteScroll from 'react-infinite-scroll-component';
import TopsSkeleton from '../../components/skeleton/TopsSkeleton';

export async function getServerSideProps(context) {
  const { req, query } = context;
  const cookies = parse(req.headers.cookie || '');

  let location = '';
  if (cookies.location) {
    location = `?location=${cookies.location}`;
  }
  let tab = query.tab;
  if (tab == 'officials') {
    tab = 2;
  } else tab = 1;
  try {
    const headers = {
      'Content-Type': 'application/json',

      'Accept-language': cookies.language || 'tk',
    };

    const url =
      `${hostname}/api/users/tops/?type=${tab}&ordering=${query.filter}` +
      location;
    const response = await fetch(url, {
      headers,
    });

    const data = await response.json();
    return { props: { data, tab, url } };
  } catch (error) {
    return { props: { data: null } };
  }
}
const Top = ({ data, tab, url }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState();
  const [hasMore, setHasMore] = useState(true);
  const [pageCount, setPageCount] = useState(2);
  const [nextPage, setNextPage] = useState(data.next);
  const [isLoading, setIsLoading] = useState(true);
  // ===========================================
  useEffect(() => {
    setUsers(data.results);
    setPageCount(2);
    setHasMore(true);
  }, [router.query]);
  const getMorePost = async () => {
    setIsLoading(false);
    let page = '';
    let poz = '&';
    if (getCookie('location') || router.query) poz = '&';
    else poz = '&';

    page = poz + `page=${pageCount}`;

    fetch(`${url}${page}`).then((response) =>
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
  const [officialChanger, setOfficialChanger] = useState(false);
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
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold my-10">{content.tops}</h1>
        <div>
          <button
            onClick={() => setIsOpen(true)}
            className="border-[1px] border-gray-400 rounded-md text-xl px-3 text-gray-500"
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
                    href={`${router.pathname}?tab=${router.query.tab}&filter=username`}
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="menu-item-1"
                  >
                    A-Z
                  </Link>

                  <Link
                    href={`${router.pathname}?tab=${router.query.tab}&filter=-username`}
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="menu-item-1"
                  >
                    Z-A
                  </Link>
                  <Link
                    href={`${router.pathname}?tab=${router.query.tab}&filter=date_joined`}
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="menu-item-1"
                  >
                    {content['log-in-date']}
                  </Link>

                  <Link
                    href={`${router.pathname}?tab=${router.query.tab}&filter=posts__like_count__sum`}
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="menu-item-1"
                  >
                    {content['like-count']}
                  </Link>
                  <Link
                    href={`${router.pathname}?tab=${router.query.tab}&filter=-balance`}
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="menu-item-1"
                  >
                    {content['balance-count']}
                  </Link>

                  <Link
                    href={`${router.pathname}?tab=${router.query.tab}&filter=followers_count`}
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
      </div>
      <div className="w-full">
        <Image
          src={`/arzansurat/topBanner.png`}
          width={500}
          height={500}
          alt=""
          className="w-full"
        />
      </div>
      <div className="mt-10">
        <div className="w-10/11 grid grid-cols-2 ">
          <Link href={`/users/top?tab=users&filter=-balance`}>
            <div
              onClick={() => setOfficialChanger(true)}
              className={
                tab == 1
                  ? 'bg-green-500 border-green-500 border-2   text-white text-center rounded-l-md p-3 font-[600]'
                  : 'bg-[#F9FAFC] text-[#AAAAAA] border-2  border-[#E5E5E5]  text-center rounded-l-md p-3 font-[600]'
              }
            >
              {content.users}
            </div>
          </Link>
          <Link href={`/users/top?tab=officials&filter=-balance`}>
            <div
              onClick={() => setOfficialChanger(false)}
              className={
                tab !== 2
                  ? 'bg-[#F9FAFC]  text-[#AAAAAA] border-2 border-[#E5E5E5] text-center rounded-r-md p-3 font-[600]'
                  : 'bg-green-500  text-white text-center  border-green-500  border-2 rounded-r-md p-3 font-[600]'
              }
            >
              {content.officials}
            </div>
          </Link>
        </div>
        <div className="mt-10">
          <InfiniteScroll
            dataLength={(pageCount - 1) * 10 || 1}
            pullDownToRefreshThreshold={50}
            next={getMorePost}
            loader={<TopsSkeleton />}
            hasMore={hasMore}
          >
            {users &&
              users.map((tops, index) => (
                <div
                  key={index}
                  className={
                    0 <= index && index <= 2
                      ? 'border-[3px] border-[#FFB800] w-full p-2 pl-6 flex mt-5 rounded-md gap-5 justify-between'
                      : 'border-[3px] border-[#E5E5E5] w-full p-2 pl-6 flex mt-5 rounded-md gap-5 justify-between'
                  }
                >
                  <div className="flex items-center gap-5">
                    <div className="text-3xl h-full flex items-center">
                      {index + 1}
                    </div>

                    <div>
                      <Image
                        src={
                          !tops.avatar
                            ? `/pets/${tops.id % 10}.png`
                            : tops.avatar
                        }
                        width={50}
                        height={50}
                        alt=""
                        className="object-cover rounded-full w-14 h-14 border-2 border-green-600"
                      />
                    </div>
                    <div className="my-auto text-xl">{tops.username}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>{tops.balance}</div>
                    <Image
                      src="/arzansurat/coinIcon.svg"
                      width={20}
                      height={20}
                      alt=""
                    />
                  </div>
                </div>
              ))}
          </InfiniteScroll>
        </div>
      </div>
    </Container>
  );
};
export default Top;
