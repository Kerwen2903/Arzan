import Link from 'next/link';
import tk from '../../static/locales/tk.json';
import ru from '../../static/locales/ru.json';
import en from '../../static/locales/en.json';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
const EveryButton = ({ link }) => {
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
  return (
    <Link href={`${link}`}>
      <div className="bg-green-500 rounded-full text-white text-center w-[8rem] p-1 text-md ">
        {content.all} &raquo;
      </div>
    </Link>
  );
};

export default EveryButton;
