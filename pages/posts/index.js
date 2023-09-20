import { useEffect, useState } from 'react';
import Container from '../../components/Container';
import PostCards from '../../components/PostCards';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { hostname } from '../../setting';
import { parse } from 'cookie';

export async function getServerSideProps(context) {
  const { query, req } = context;
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.token;
  let categoryId;
  categoryId = null;
  if (query.category) {
    const slugArray = query.category.split('-');
    const lengthSlugArray = slugArray.length - 1;
    categoryId = slugArray[lengthSlugArray];
  }
  let location = '';
  if (cookies.location) {
    location = `?location=${cookies.location}`;
  }
  // TODO: migrate to then instead of await
  try {
    const categoriesUrl = `${hostname}/api/posts/subcategories/`;
    let postsUrl = `${hostname}/api/posts/` + location;
    if (categoryId !== -1 && categoryId && location != '') {
      postsUrl += `&category=${categoryId}`;
    } else if (categoryId !== -1 && categoryId && location == '') {
      postsUrl += `?category=${categoryId}`;
    }
    if (query.is_selected && location != '') {
      postsUrl += `&is_selected=true`;
    } else if (query.is_selected && location == '') {
      postsUrl += `?is_selected=true`;
    }
    if (query.is_saved && location != '') {
      postsUrl += `&is_saved=true`;
    } else if (query.is_saved && location == '') {
      postsUrl += `?is_saved=true`;
    }
    const headers = {
      'Content-Type': 'application/json',

      'Accept-language': 'tk',
    };
    if (token) {
      headers.Authorization = `Token ${token}`;
    }
    const categoriesResponse = await fetch(categoriesUrl, {
      headers: {
        'Accept-language': cookies.language || 'tk',
      },
    });
    const postsResponse = await fetch(postsUrl, {
      headers,
    });
    const data = await categoriesResponse.json();
    const postedData = await postsResponse.json();
    let count = 0;

    // for (i = 0; i < data.results.length; i++) {
    //   count += data.results[i].posts__count;
    // }

    data.results.forEach((category) => {
      count += category.posts__count;
    });

    return { props: { data, postedData, categoryId, count, postsUrl } };
  } catch (error) {
    return { props: { data: null } };
  }
}
const PostPage = ({ data, postedData, categoryId, count, postsUrl }) => {
  const router = useRouter();
  const reloed = () => {
    router.reload();
  };
  useEffect(() => {});
  return (
    <Container>
      <>
        <button
          onClick={() => router.back()}
          className="bg-green-500 w-[50px] text-white text-2xl rounded-md mb-5"
        >
          &#8249;
        </button>
        {!(router.query.is_selected || router.query.is_saved) && (
          <div className="flex gap-4 flex-wrap">
            <Link href={`/posts`}>
              <div
                className={
                  !categoryId
                    ? 'bg-green-500 cursor-pointer border-2 border-green-500 text-white px-2 py-1 rounded-3xl w-max'
                    : 'bg-[#F9FAFC] border-2 border-[#E5E5E5] cursor-pointer px-2 py-1 rounded-3xl text-[#545454] font-[400] w-max'
                }
              >
                Hemmesi ({count})
              </div>
            </Link>
            {data.results &&
              data.results.map((category, index) => (
                <Link
                  key={index}
                  href={`/posts?category=${category.slug}-${category.id}`}
                >
                  <div
                    className={
                      categoryId == category.id
                        ? 'bg-green-500 cursor-pointer border-2 border-green-500 text-white px-2 py-1 rounded-3xl w-max'
                        : 'bg-[#F9FAFC] border-2 border-[#E5E5E5] cursor-pointer px-2 py-1 rounded-3xl text-[#545454] font-[400] w-max'
                    }
                  >
                    {category.name} ({category.posts__count})
                  </div>
                </Link>
              ))}
          </div>
        )}
        {postedData && (
          <PostCards data={postedData} postsUrl={postsUrl} grid={3} />
        )}
      </>
    </Container>
  );
};
export default PostPage;
