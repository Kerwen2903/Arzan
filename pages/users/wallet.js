import { useEffect, useState } from 'react';
import { HeartIcon, LocationMarkerIcon } from '@heroicons/react/outline';
import { DocumentTextIcon } from '@heroicons/react/outline';
import { UsersIcon } from '@heroicons/react/outline';
import { UserAddIcon } from '@heroicons/react/outline';
import { CalendarIcon } from '@heroicons/react/outline';
import Container from '../../components/Container';
import { parse } from 'cookie';

import Image from 'next/image';
import { hostname } from '../../setting';
import Link from 'next/link';
import { useRouter } from 'next/router';
import tk from '../../static/locales/tk.json';
import ru from '../../static/locales/ru.json';
import en from '../../static/locales/en.json';
import { getCookie } from 'cookies-next';

export async function getServerSideProps(context) {
  const { req, query } = context;
  try {
    const tab = query.tab;
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
    const user = await response.json();
    const response2 = await fetch(
      `${hostname}/api/analytics/activities/?days=${tab}`,
      {
        headers,
      }
    );
    const data = await response2.json();

    return { props: { user, data, tab } };
  } catch (error) {
    return { props: { data: null, user: null } };
  }
}

const UserHasabym = ({ data, user, tab }) => {
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
  return (
    <Container>
      <button
        onClick={() => router.back()}
        className="bg-green-500 w-[50px] text-white text-2xl rounded-md mb-5"
      >
        &#8249;
      </button>
      <div>
        <div className=" sm:flex items-center justify-between w-full">
          <div className="flex items-center gap-5 sm:mb-0 mb-5">
            <Image
              height={1000}
              width={1000}
              alt=" "
              src={!user.avatar ? `/pets/${user.id % 10}.png` : user.avatar}
              className="border-green-500 border-4 rounded-full w-28 h-28 object-cover"
            />
            <div>
              <div className="w-full text-center font-[700] text-2xl">
                {user.username}
              </div>
              <div className="flex items-center gap-2  text-[#5F5F5F] mt-5">
                <LocationMarkerIcon className="w-5 h-5" />
                Ashgabat
              </div>
            </div>
          </div>
          <div className=" bg-[#fdba741f] font-[700] text-orange-300 border-orange-300 border-2 text-center rounded-md p-2 px-11 h-max flex gap-2 justify-center">
            {user.balance}
            <Image
              src="/arzansurat/coinIcon.svg"
              width={20}
              height={20}
              alt=""
            />
          </div>
        </div>
      </div>
      <div className=" flex justify-between mt-10 text-[#AAAAAA]">
        <Link
          href={`/users/wallet?tab=1`}
          className={
            !(tab == '1')
              ? 'text-center w-full border-[1px] bg-[#F9FAFC] border-[#E5E5E5] p-3 rounded-l-md'
              : 'bg-green-500 text-center text-white w-full border-[1px]  border-[#E5E5E5] p-3 rounded-l-md'
          }
        >
          <div>{content.day}</div>
        </Link>
        <Link
          href={`/users/wallet?tab=7`}
          className={
            !(tab == '7')
              ? 'text-center w-full border-[1px] bg-[#F9FAFC] border-[#E5E5E5] p-3'
              : 'bg-green-500 text-center text-white w-full border-[1px]  border-[#E5E5E5] p-3'
          }
        >
          <div>{content.week}</div>
        </Link>
        <Link
          href={`/users/wallet?tab=30`}
          className={
            !(tab == '30')
              ? 'text-center w-full border-[1px] bg-[#F9FAFC] border-[#E5E5E5] p-3 rounded-r-md'
              : 'bg-green-500 text-center text-white w-full border-[1px]  border-[#E5E5E5] p-3 rounded-r-md'
          }
        >
          <div>{content.month}</div>
        </Link>
      </div>
      <div className=" flex  mt-10">
        <table className=" w-full">
          <thead>
            <tr className="border-b-2">
              <th className="p-3 text-left">Ady</th>
              <th className="p-3 text-right">Mukdar</th>
              <th className="p-3 text-right">Ball</th>
            </tr>
          </thead>
          {data && (
            <tbody>
              <tr className="border-b-2">
                <td className="p-3 flex items-center gap-3">
                  <HeartIcon className="w-11 h-11 bg-red-100 text-red-600 p-2 rounded-xl" />
                  Like
                </td>
                <td className="p-3 text-right">{data.like_count}</td>
                <td className="p-3  ">
                  <div className="flex gap-2 justify-end">
                    {data.like_count_coin}
                    <Image
                      src="/arzansurat/coinIcon.svg"
                      width={20}
                      height={20}
                      alt=""
                    />
                  </div>
                </td>
              </tr>
              <tr className="border-b-2">
                <td className="p-3 flex items-center gap-3">
                  <DocumentTextIcon className="w-11 h-11 bg-blue-100 text-blue-400 p-2 rounded-xl" />
                  Teswir
                </td>
                <td className="p-3 text-right">{data.comment_count}</td>
                <td className="p-3  ">
                  <div className="flex gap-2 justify-end">
                    {data.comment_count_coin}
                    <Image
                      src="/arzansurat/coinIcon.svg"
                      width={20}
                      height={20}
                      alt=""
                    />
                  </div>
                </td>
              </tr>
              <tr className="border-b-2">
                <td className="p-3 flex items-center gap-3">
                  <HeartIcon className="w-11 h-11 bg-black-100 text-black-600 p-2 rounded-xl" />
                  Myhmanlar
                </td>
                <td className="p-3 text-right">{data.visit_count}</td>
                <td className="p-3  ">
                  <div className="flex gap-2 justify-end">
                    {data.visit_count_coin}
                    <Image
                      src="/arzansurat/coinIcon.svg"
                      width={20}
                      height={20}
                      alt=""
                    />
                  </div>
                </td>
              </tr>
              <tr className="border-b-2">
                <td className="p-3 flex items-center gap-3">
                  <UsersIcon className="w-11 h-11 bg-green-100 text-green-600 p-2 rounded-xl" />
                  Yzarlaýjylar
                </td>
                <td className="p-3 text-right">{data.follow_count}</td>
                <td className="p-3  ">
                  <div className="flex gap-2 justify-end">
                    {data.follow_count_coin}
                    <Image
                      src="/arzansurat/coinIcon.svg"
                      width={20}
                      height={20}
                      alt=""
                    />
                  </div>
                </td>
              </tr>
              <tr className="border-b-2">
                <td className="p-3 flex items-center gap-3">
                  <UserAddIcon className="w-11 h-11 bg-red-100 text-red-600 p-2 rounded-xl" />
                  Çagyrma
                </td>
                <td className="p-3 text-right">{data.invite_count}</td>
                <td className="p-3  ">
                  <div className="flex gap-2 justify-end">
                    {data.invite_count_coin}
                    <Image
                      src="/arzansurat/coinIcon.svg"
                      width={20}
                      height={20}
                      alt=""
                    />
                  </div>
                </td>
              </tr>
              <tr className="border-b-2">
                <td className="p-3 flex items-center gap-3">
                  <CalendarIcon className="w-11 h-11 bg-blue-100 text-blue-600 p-2 rounded-xl" />
                  Girilen gün
                </td>
                <td className="p-3 text-right">{data.daily_count}</td>
                <td className="p-3  ">
                  <div className="flex gap-2 justify-end">
                    {data.daily_count_coin}
                    <Image
                      src="/arzansurat/coinIcon.svg"
                      width={20}
                      height={20}
                      alt=""
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </Container>
  );
};

export default UserHasabym;
