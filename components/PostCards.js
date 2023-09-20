import { EyeIcon } from '@heroicons/react/outline';
import EveryButton from './miniComponents/EveryButton';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { hostname } from '../setting';
import { useRouter } from 'next/router';
import { getCookie } from 'cookies-next';
import PostsSkeleton from './skeleton/PostsSkeleton';

const PostCards = ({
  users,
  grid,
  data,
  title,
  link,
  postsUrl,
  pending,
  rejected,
}) => {
  console.log(data);
  const router = useRouter();
  const [posts, setPosts] = useState();
  const [hasMore, setHasMore] = useState(false);
  const [pageCount, setPageCount] = useState(2);
  const [nextPage, setNextPage] = useState(data.next);
  const [trigger, setTrigger] = useState(posts?.length);
  console.log(data);
  useEffect(() => {
    setPosts(data.results);
    setPageCount(2);
    if (data.next) {
      setHasMore(true);
    }
  }, [router.query]);
  const getMorePost = () => {
    let page = '';
    let poz = '';
    getCookie('location') || router.query.category ? (poz = '&') : (poz = '?');
    if (router.query.is_saved) {
      poz = '&';
    }
    if (router.query.is_selected) {
      poz = '&';
    }
    if (router.route == '/') {
      poz = '&';
    }
    if (nextPage) {
      page = poz + `page=${pageCount}`;
    }
    fetch(`${postsUrl}${page}`).then((response) =>
      response.json().then((data) => {
        setPageCount(pageCount + 1);
        setNextPage(data.next);
        setPosts([...posts, ...data.results]);
        if (!data.next) setHasMore(false);
      })
    );
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between mb-3 ">
        <div className="text-xl md:text-2xl font-[500]">{title}</div>
        {users && <EveryButton link={link} />}
      </div>
      <div className="grid grid-cols-4"></div>
      <InfiniteScroll
        dataLength={(pageCount - 1) * 10 || 10}
        next={getMorePost}
        hasMore={hasMore}
        className={`grid grid-cols-2 md:grid-cols-4 gap-4 `}
        loader={nextPage && <PostsSkeleton />}
      >
        {posts &&
          posts.map((info, index) => {
            let color = '';
            if (info.status === 1)
              color = (
                <div className="text-blue-400 bg-white p-1 rounded-md absolute top-2 left-2">
                  {pending}
                </div>
              );
            if (info.status === 2)
              color = (
                <div className="text-orange-400 bg-white p-1 rounded-md absolute top-2 left-2">
                  {rejected}
                </div>
              );
            if (info.status === 3)
              color = (
                <div className="text-red-400 bg-white p-1 rounded-md absolute top-2 left-2">
                  banned
                </div>
              );
            return (
              <Link key={index} href={`/posts/${info.slug}-${info.id}`}>
                <div
                  className={`relative h-full border-2 rounded-lg border-${color} bg-${color}`}
                >
                  <Image
                    height={1000}
                    width={1000}
                    alt=" "
                    src={`${info.thumbnail}`}
                    className="w-full rounded-t-lg h-32 md:h-56 object-cover"
                  />
                  <div className="">
                    <div className="p-3 text-sm md:text-md">{info.name}</div>
                    <div className=" flex justify-between text-[#747474] text-xs p-3">
                      <div>{info.date_started}</div>
                      <div className="flex items-center gap-3">
                        <EyeIcon className="h-4 w-4" />
                        {info.view_count}
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 bg-green-500 rounded-full flex items-center justify-center w-8 h-8 md:w-10 md:h-10 text-white text-sm md:text-md">
                    {info.discount_percent}%
                  </div>
                  {color}
                </div>
              </Link>
            );
          })}
      </InfiniteScroll>
    </div>
  );
};

export default PostCards;
