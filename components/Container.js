import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import {
  ChevronDownIcon,
  SearchIcon,
  ChevronUpIcon,
  BellIcon,
  ExclamationCircleIcon,
  PlayIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  UserIcon,
  UsersIcon,
  UserAddIcon,
  PhoneIcon,
  LogoutIcon,
} from '@heroicons/react/outline';
import { LocationMarkerIcon } from '@heroicons/react/outline';
import { GlobeAltIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { hostname } from '../setting';
import Joi from 'joi';
import tk from '../static/locales/tk.json';
import ru from '../static/locales/ru.json';
import en from '../static/locales/en.json';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MutatingDots, TailSpin } from 'react-loader-spinner';

const Container = ({ children }) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url) => url !== router.asPath && setLoading(true);
    const handleComplete = (url) => url === router.asPath && setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  });

  const [content, setContent] = useState(tk);
  const [isOpenVerificationCode, setIsOpenVerificationCode] = useState(false);
  const [
    isOpenVerificationCodeForResetCode,
    setIsOpenVerificationCodeForResetCode,
  ] = useState(false);
  const [phoneNumberForVerify, setPhoneNumberForVerify] = useState();
  const [VerifyCode, setVerifyCode] = useState();
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
  const [locationData, setLocationData] = useState('');
  const [phoneNumberForResetPassword, setPhoneNumberForResetPassword] =
    useState();
  const [newPassword, setNewPassword] = useState();
  const [isOpenResetPassword, setIsOpenResetPassword] = useState();
  const handlePasswordReset = async () => {
    fetch(`${hostname}/api/authentication/password_reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',

        'Accept-language': getCookie('language') || 'tk',
      },
      body: JSON.stringify({
        phone: phoneNumberForResetPassword,
        password: newPassword,
      }),
    })
      .then((response) =>
        response.json().then((data) => {
          if (response.status == 400 && data.non_field_errors) {
            throw data.non_field_errors;
          }
          setIsOpenVerificationCodeForResetCode(true);
          setIsOpenResetPassword(false);
          setPhoneNumberForResetPassword(data.phone);
        })
      )
      .catch((error) => {
        // setError(error);
      });
  };
  const handleChangeLanguage = (name, lang) => {
    setCookie('language', `${lang}`, {
      maxAge: 30 * 24 * 60 * 60, // Expires after 30 days
      path: '/',
    });
    setCookie('languageName', `${name}`, {
      maxAge: 30 * 24 * 60 * 60, // Expires after 30 days
      path: '/',
    });
    setIsLanguage(name);
    router.reload();
  };

  useEffect(() => {
    setIsLanguage(getCookie('languageName'));
    async function fetchLocation() {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Accept-language': getCookie('language') || 'tk',
        };

        const response = await fetch(`${hostname}/api/locations/`, {
          headers,
        });

        const data = await response.json();
        const locations = [{ id: null, name: 'Global' }, ...data];
        setLocationData(locations);
      } catch (error) {}
    }
    fetchLocation();
  }, []);

  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen3(false);
        setIsOpen(false);
        setIsOpen1(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const [data, setData] = useState([]);

  useEffect(() => {
    if (getCookie('token')) {
      async function fetchData() {
        const headers = {
          'Content-Type': 'application/json',
          'Accept-language': 'tk',
          Authorization: `token ${getCookie('token')}`,
        };

        const response = await fetch(`${hostname}/api/users/me/`, {
          headers,
        });
        const newData = await response.json();
        setData(newData);
        document.cookie = `userId=${newData.id}; path=/`;
      }
      fetchData();
    }
    if (getCookie('locationName')) setIsLocation(getCookie('locationName'));
  }, []);

  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginUser, setLoginUser] = useState('');
  const [isLogined, setIsLogined] = useState(false);
  const handleLogOut = async () => {
    router.push('/');
    setIsLogined(false);
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie =
      'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };
  useEffect(() => {
    if (getCookie('token')) {
      setIsLogined(true);
    }
  }, []);
  const handleVerifyCode = async () => {
    fetch(`${hostname}/api/authentication/otp/activate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',

        'Accept-language': getCookie('language') || 'tk',
      },
      body: JSON.stringify({
        phone: phoneNumberForVerify,
        code: VerifyCode,
      }),
    })
      .then((response) =>
        response.json().then((data) => {
          if (response.status == 400 && data.non_field_errors) {
            throw data.non_field_errors;
          }
          if (response.status == 200) {
            setChangeAuthToLog(false);
            setIsOpenVerificationCode(false);
            setToggleAuth(true);
          }
        })
      )
      .catch((error) => {});
  };
  const handleVerifyCodeForResetPassword = async () => {
    fetch(`${hostname}/api/authentication/otp/password_reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',

        'Accept-language': getCookie('language') || 'tk',
      },
      body: JSON.stringify({
        phone: phoneNumberForResetPassword,
        code: VerifyCode,
      }),
    })
      .then((response) =>
        response.json().then((data) => {
          if (response.status == 400 && data.non_field_errors) {
            throw data.non_field_errors;
          }
          if (response.status == 200) {
            setChangeAuthToLog(false);
            setIsOpenVerificationCode(false);
            setToggleAuth(true);
          }
        })
      )
      .catch((error) => {});
  };
  // const handleResetPassword = async () => {
  //   fetch(`${hostname}/api/authentication/password_reset/`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',

  //       'Accept-language': getCookie('language') || 'tk',
  //     },
  //     body: JSON.stringify({
  //       phone: phoneNumberForVerify,
  //       code: VerifyCode,
  //     }),
  //   })
  //     .then((response) =>
  //       response.json().then((data) => {
  //         if (response.status == 400 && data.non_field_errors) {
  //           throw data.non_field_errors;
  //         }
  //         if (response.status == 200) {
  //           setChangeAuthToLog(false);
  //           setIsOpenVerificationCode(false);
  //           setToggleAuth(true);
  //         }
  //       })
  //     )
  //     .catch((error) => {});
  // };

  const [isOpen, setIsOpen] = useState(false);
  const [isOpen1, setIsOpen1] = useState(false);
  const [isLocation, setIsLocation] = useState('Global');
  const [isLanguage, setIsLanguage] = useState();
  const [isOpen3, setIsOpen3] = useState(false);
  const [toggleAuth, setToggleAuth] = useState(false);
  const [changeAuthToLog, setChangeAuthToLog] = useState(false);
  const [eye, setEye] = useState('password');
  const [eye1, setEye1] = useState('password');
  const [error, setError] = useState(null);
  const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    const validation = loginSchema.validate({
      username: loginUser,
      password: loginPassword,
    });
    if (validation.error) {
      setError(validation.error.details[0].message);
      return;
    }

    fetch(`${hostname}/api/authentication/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',

        'Accept-language': getCookie('language') || 'tk',
      },
      body: JSON.stringify({
        username: loginUser,
        password: loginPassword,
      }),
    })
      .then((response) =>
        response.json().then((data) => {
          if (response.status == 400 && data.non_field_errors) {
            throw data.non_field_errors;
          }
          router.reload();
          document.cookie = `token=${data.token}; path=/`;
          setIsLogined(true);
          setToggleAuth(false);
          document.cookie = `username=${loginUser}; path=/`;
        })
      )
      .catch((error) => {
        setError(error);
      });
  };

  const schema = Joi.object({
    username: Joi.string().empty().min(3).required().messages({
      'string.base': `Username should be a type of 'text'`,
      'string.empty': `Username cannot be an empty field`,
      'string.min': `Username should have a minimum length of {3}`,
    }),
    phone: Joi.number()
      .integer()
      .min(10000000)
      .max(99999999)
      .required()
      .messages({
        'number.base': 'Telefon nomer dine sanlardan duzulen bolmaly',
        'number.empty': 'Phone number cannot be an empty field',
        'number.integer': 'Telefon nomer bitin san bolmaly',
        'number.min': 'Phone number must be at least 8 digits long',
        'number.max': 'telefon nomer 8 elementden kop bolmaly dal',
        'any.required': 'Phone number is a required field',
      }),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .required()
      .messages({
        'string.base': `Password should be a type of 'text'`,
        'string.empty': `Password cannot be an empty field`,
        'string.pattern.base': `Password should have a length between 3 and 30 and contain only alphanumeric characters`,
      }),
  });
  const [errors, setErrors] = useState();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = schema.validate({ username, phone, password });
    if (error) {
      setErrors(error.details[0].message);
      return;
    }

    const response = await fetch(`${hostname}/api/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',

        'Accept-language': getCookie('language') || 'tk',
      },
      body: JSON.stringify({
        username,
        phone,
        password,
        location,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      setIsOpenVerificationCode(true);
      setPhoneNumberForVerify(data.phone);
      setToggleAuth(false);
      // fetch(`${hostname}/api/authentication/token/`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Accept-language': getCookie('language') || 'tk',
      //   },
      //   body: JSON.stringify({
      //     username: data.username,
      //     password: password,
      //   }),
      // })
      // .then((response) => {
      //   if (!response.ok) {
      //     throw new Error('Failed to log in');
      //   }
      //   return response.json();
      // })
      // .then((data) => {
      //   document.cookie = `token=${data.token}; path=/`;
      //   setIsLogined(true);
      //   setToggleAuth(false);
      //   document.cookie = `username=${loginUser}; path=/`;
      //   router.reload();
      // })
      // .catch((error) => {});
    } else {
      // Display any validation errors returned by the server
      if (data.phone) {
        setErrors(data.phone);
      }
      if (data.password) {
        setErrors(data.password);
      }
      if (data.username) {
        setErrors(data.username);
      }
    }
  };

  const toggleDropdown = () => {
    setIsOpen3(!isOpen3);
  };
  const [searchEdit, setSearchEdit] = useState(router.query.search);

  return (
    <div>
      {loading && (
        <div className="fixed bg-white h-[100vh] w-[100vw] z-[999] flex items-center justify-center">
          <MutatingDots
            height="100"
            width="100"
            color="#4fa94d"
            secondaryColor="#4fa94d"
            radius="12.5"
            ariaLabel="mutating-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      )}
      <Head>
        <title>Arzan TM</title>
        <meta
          name="description"
          content="This is the description of my page."
        />

        <link rel="icon" href="" />
      </Head>
      <div className="flex items-center w-full justify-between py-2 sm:pb-2 pb-28  fixed z-[50] bg-white ">
        <div className="flex items-center justify-between mx-auto w-11/12 xl:w-[1200px]">
          <div className="flex  items-center gap-6">
            <div className=" min-w-[100px] w-[100px]  sm:w-[110px] md:w-[120px]">
              <Link href={'/'}>
                <Image
                  height={400}
                  width={400}
                  alt=" "
                  src="/logo1.d2b73f29.svg"
                />
              </Link>
            </div>
            {/* dropdawn of location */}
            <div className="absolute sm:static top-32 -mt-2 left-5  sm:mt-0 flex-2">
              <div
                className="  text-[#1B1B1B] py-2  rounded flex cursor-pointer    items-center text-sm gap-1"
                onClick={() => setIsOpen(!isOpen)}
              >
                <LocationMarkerIcon className=" h-5 w-5 text-[#0EC243]" />
                {isLocation}
                {!isOpen ? (
                  <ChevronDownIcon className="h-3 w-3  text-[#AAAAAA]" />
                ) : (
                  <ChevronUpIcon className="h-3 w-3  text-[#AAAAAA]" />
                )}
              </div>
              {isOpen && (
                <ul
                  ref={dropdownRef}
                  className="absolute bg-white  ml-4 rounded-lg shadow-lg py-2 list-none cursor-pointer  z-50"
                >
                  {locationData &&
                    locationData.map((location, i) => (
                      <li
                        key={i}
                        onClick={() => {
                          setIsLocation(location.name);
                          setIsOpen(!isOpen);
                          deleteCookie('location');
                          deleteCookie('locationName');
                          if (location.id) {
                            setCookie('location', `${location.id}`, {
                              maxAge: 30 * 24 * 60 * 60, // Expires after 30 days
                              path: '/',
                            });
                            setCookie('locationName', `${location.name}`, {
                              maxAge: 30 * 24 * 60 * 60, // Expires after 30 days
                              path: '/',
                            });
                          }
                          router.reload();
                        }}
                        className="cursor-pointer block px-4 py-2 text-gray-800 hover:bg-gray-300 hover:text-gray-900"
                      >
                        {location.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
          {/* search  */}
          <div className="absolute mt-28 sm:mt-0 sm:sticky w-[90%]">
            <div className="relative   h-[40px] min-w-[200px] w-full px-2  lg:px-10 flex-2">
              <div className="absolute inset-y-0 left-0 pl-4 lg:pl-12 flex items-center pointer-events-none h-[40px] ">
                <SearchIcon
                  className="h-5 w-5 text-[#777777]"
                  aria-hidden="true"
                />
              </div>
              <form method="get" action="/search">
                <input
                  onChange={(e) => setSearchEdit(e.target.value)}
                  value={searchEdit}
                  className="block w-full pl-10 pr-3 py-2  placeholder-[#777777]   focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-[40px] border-[1px] border-[#747474] border-t-black"
                  type="text"
                  name="search"
                  placeholder="Gozle..."
                />
              </form>
            </div>
          </div>
          {/* dropdawn of language */}
          <div className="flex  items-center flex-2 ">
            <div className=" absolute sm:static top-32 right-5">
              <div
                className="  text-[#1B1B1B]  lg:px-4 rounded flex cursor-pointer  text-sm  items-center gap-1 "
                onClick={() => setIsOpen1(!isOpen1)}
              >
                <GlobeAltIcon className="h-5 w-5 text-[#0EC243] " />
                {isLanguage}
                {!isOpen1 ? (
                  <ChevronDownIcon className="h-3 w-3  text-[#AAAAAA]" />
                ) : (
                  <ChevronUpIcon className="h-3 w-3  text-[#AAAAAA]" />
                )}
              </div>
              {isOpen1 && (
                <ul
                  ref={dropdownRef}
                  className="absolute bg-white  ml-4 rounded-lg shadow-lg py-2 list-none cursor-pointer z-50"
                >
                  <li
                    onClick={() => {
                      let name = 'Turkmen';
                      let lang = 'tk';
                      handleChangeLanguage(name, lang);
                      setIsOpen1(!isOpen1);
                    }}
                    className="cursor-pointer block px-4 py-2 text-gray-800 hover:bg-gray-300 hover:text-gray-900"
                  >
                    Turkmen
                  </li>
                  <li
                    onClick={() => {
                      let name = 'English';
                      let lang = 'en';
                      handleChangeLanguage(name, lang);
                      setIsOpen1(!isOpen1);
                    }}
                    className="cursor-pointer block px-4 py-2 text-gray-800 hover:bg-gray-300 hover:text-gray-900"
                  >
                    English
                  </li>
                  <li
                    onClick={() => {
                      let name = 'Russian';
                      let lang = 'ru';
                      handleChangeLanguage(name, lang);
                      setIsOpen1(!isOpen1);
                    }}
                    className="cursor-pointer block px-4 py-2 text-gray-800 hover:bg-gray-300 hover:text-gray-900"
                  >
                    Russian
                  </li>
                </ul>
              )}
            </div>
            <div className="relative cursor-pointer ">
              <BellIcon className="h-7 w-7 text-[#747474]" />
              {/* <div className="absolute rounded-full bg-red-600 w-5 h-5 flex items-center justify-center right-0 top-0 text-white text-xs">
              23
            </div> */}
            </div>

            <div>
              <div
                className="border-[#1FD655] border-[5px] rounded-full w-12 h-12 flex-col text-center lg:mx-10 cursor-pointer "
                onClick={toggleDropdown}
              >
                {!isLogined ? (
                  <div>
                    <Image
                      height={100}
                      width={100}
                      alt=" "
                      src="/footerLogo.20d40a88.svg"
                      className="h-6 w-6 flex m-auto mb-0"
                    />
                    <div className="flex m-auto mt-[-0.4rem] text-xs w-min text-[#1FD655]">
                      Arzan
                    </div>
                  </div>
                ) : (
                  <Image
                    src={
                      !data.avatar && data.id
                        ? `/pets/${data.id % 10}.png`
                        : data.avatar
                    }
                    className="rounded-full h-full w-full object-cover"
                    alt=""
                    width={100}
                    height={100}
                  />
                )}
              </div>
            </div>
            {isOpen3 && (
              <div
                ref={dropdownRef}
                className="absolute right-2 lg:right-auto top-16 z-40 mt-2 w-36 lg:w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
                tabIndex="-1"
              >
                <div className="py-1" role="none">
                  {!isLogined && (
                    <div
                      onClick={() => setToggleAuth(!toggleAuth)}
                      className="text-gray-700 block px-4 py-2 text-sm cursor-pointer hover:bg-gray-400 hover:text-white"
                      role="menuitem"
                      tabIndex="-1"
                      id="menu-item-0"
                    >
                      {content.logIn}
                    </div>
                  )}
                  {isLogined && (
                    <>
                      <Link
                        href={`/users/me`}
                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                        role="menuitem"
                        tabIndex="-1"
                        id="menu-item-1"
                      >
                        {content.profil}
                      </Link>
                      {/* <Link
                        href={`/users/wallet`}
                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                        role="menuitem"
                        tabIndex="-1"
                        id="menu-item-1"
                      >
                        Gapjyk
                      </Link> */}
                      <Link
                        href={`/posts/add`}
                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                        role="menuitem"
                        tabIndex="-1"
                        id="menu-item-1"
                      >
                        {content.addPost}
                      </Link>
                    </>
                  )}
                </div>
                {isLogined && (
                  <div className="py-1" role="none">
                    <Link
                      href="/posts/?is_saved=true"
                      className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                      role="menuitem"
                      tabIndex="-1"
                      id="menu-item-2"
                    >
                      {content.bookmarks}
                    </Link>
                    {/* <a
                    href="#"
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="menu-item-3"
                  >
                    Move
                  </a>
                </div>
                <div className="py-1" role="none">
                  <a
                    href="#"
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="menu-item-4"
                  >
                    Share
                  </a>
                  <a
                    href="#"
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="menu-item-5"
                  >
                    Add to favorites
                  </a> */}
                  </div>
                )}
                <div className="py-1" role="none">
                  {isLogined && (
                    <div
                      onClick={() => handleLogOut()}
                      className="flex cursor-pointer text-red-600   px-4 py-2 text-sm hover:bg-gray-400 hover:text-white"
                      role="menuitem"
                      tabIndex="-1"
                      id="menu-item-6"
                    >
                      <LogoutIcon className="w-5 mr-4" />
                      {content.logOut}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isOpenResetPassword && (
        <div className=" flex justify-center  ">
          <div
            className=" fixed backdrop-blur-sm bg-[#00000045] top-0 w-full h-full z-50"
            onClick={() => setIsOpenResetPassword(false)}
          ></div>

          <div className="fixed bg-white top-16  p-5 rounded-md flex flex-col m-auto z-50">
            <h1>Reset password</h1>
            <div className="relative">
              <div className="absolute left-2 top-1 flex items-center h-[40px] text-gray-400">
                <PhoneIcon className="h-5 w-5" />
                <div className="text-xs ">+993</div>
              </div>
              <input
                required
                minLength="8"
                onChange={(e) =>
                  setPhoneNumberForResetPassword(parseInt(e.target.value))
                }
                className=" mt-1 border-[1px] border-[#AAAAAA] mb-5 rounded-md block w-full pl-16 pr-3 py-3 text-xs  placeholder-gray-500  focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="61 000000"
              />
            </div>
            <input
              className="border-[1px] border-gray-400 p-2 rounded-md text-sm"
              type="text"
              placeholder="New password"
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              className="bg-green-500 rounded-md mt-5 text-white"
              onClick={handlePasswordReset}
            >
              Send
            </button>
          </div>
        </div>
      )}
      {isOpenVerificationCodeForResetCode && (
        <div className=" flex justify-center  ">
          <div
            className=" fixed backdrop-blur-sm bg-[#00000045] top-0 w-full h-full z-50"
            onClick={() => setIsOpenVerificationCodeForResetCode(false)}
          ></div>
          <div className=" fixed top-10 bg-white  p-5 rounded-md flex flex-col m-auto z-50">
            <h1>Code verification for reset password</h1>
            <input
              className="border-[1px] border-gray-400 p-3 rounded-md"
              type="text"
              maxLength={6}
              minLength={5}
              onChange={(e) => setVerifyCode(e.target.value)}
            />
            <button
              className="bg-green-500 rounded-md mt-5 text-white"
              onClick={handleVerifyCodeForResetPassword}
            >
              Send
            </button>
          </div>
        </div>
      )}
      {isOpenVerificationCode && (
        <div className=" flex justify-center  ">
          <div
            className=" fixed backdrop-blur-sm bg-[#00000045] top-0 w-full h-full z-50"
            onClick={() => setIsOpenVerificationCode(false)}
          ></div>
          <div className="fixed bg-white top-10 p-5 rounded-md flex flex-col m-auto z-50">
            <h1>Code verification</h1>
            <input
              className="border-[1px] border-gray-400 p-3 rounded-md"
              type="text"
              maxLength={6}
              minLength={5}
              onChange={(e) => setVerifyCode(e.target.value)}
            />
            <button
              className="bg-green-500 rounded-md mt-5 text-white"
              onClick={handleVerifyCode}
            >
              Send
            </button>
          </div>
        </div>
      )}
      {toggleAuth && (
        <div className=" flex  justify-center ">
          <div
            className=" fixed backdrop-blur-sm bg-[#00000045] top-0 w-full h-full z-50"
            onClick={() => setToggleAuth(!toggleAuth)}
          ></div>
          <div className="fixed top-10 flex m-auto bg-white p-5  rounded-md z-50 md:min-w-[500px]">
            <div className="p-5 w-full">
              <div className="grid grid-cols-2 mb-5">
                <div
                  className={
                    changeAuthToLog
                      ? 'text-[#AAAAAA] text-center cursor-pointer  border-[1px] rounded-l-md p-2'
                      : 'text-white text-center bg-green-500 rounded-l-md cursor-pointer p-2'
                  }
                  onClick={() => setChangeAuthToLog(false)}
                >
                  {content.logIn}
                </div>
                <div
                  className={
                    changeAuthToLog
                      ? 'text-white text-center bg-green-500 rounded-r-md cursor-pointer p-2'
                      : 'text-center text-[#AAAAAA] cursor-pointer border-[1px] rounded-r-md p-2'
                  }
                  onClick={() => setChangeAuthToLog(true)}
                >
                  {content.registration}
                </div>
              </div>
              {!changeAuthToLog ? (
                <form onSubmit={handleLogin}>
                  <div>
                    <div className="relative">
                      <div className="absolute left-2 top-[0.1rem] flex items-center h-[40px] text-gray-400">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <input
                        required
                        onChange={(e) => setLoginUser(e.target.value)}
                        className="border-[1px] border-[#AAAAAA] mb-5 rounded-md block w-full pl-10 pr-3 py-3 text-xs  placeholder-gray-500  focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder={content.username}
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-2 top-[0.1rem] flex items-center h-[40px] text-gray-400">
                        <KeyIcon className="h-5 w-5" />
                      </div>
                      <input
                        required
                        minLength="8"
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="border-[1px] border-[#AAAAAA] rounded-md block w-full pl-10 pr-3 py-3 text-xs  placeholder-gray-500  focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder={content.password}
                        type={eye}
                      />
                      <div className="absolute right-1 top-[0.1rem] flex items-center cursor-pointer h-[40px] ">
                        {eye == 'password' ? (
                          <EyeIcon
                            onClick={() => setEye('text')}
                            className="h-5 w-5 text-[#747474]"
                          />
                        ) : (
                          <EyeOffIcon
                            onClick={() => setEye('password')}
                            className="h-5 w-5 text-[#747474]"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2 mt-5">
                        <input
                          type="checkbox"
                          id="my-checkbox"
                          className="form-checkbox  checked:bg-green-500"
                        />
                        <label
                          htmlFor="my-checkbox"
                          className=" text-xs text-gray-500 font-medium"
                        >
                          {content['remember-me']}
                        </label>
                      </div>
                      <h4
                        onClick={() => {
                          setIsOpenResetPassword(true), setToggleAuth(false);
                        }}
                        className="text-xs text-gray-400 mt-5 cursor-pointer"
                      >
                        {content['forget-password']}
                      </h4> */}
                    </div>
                    {error && (
                      <div className="text-red-400 border-2 border-red-400 rounded-md text-center mt-5 py-2">
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="bg-green-500 text-white p-2 text-center rounded-md mt-5 px-11 w-full"
                    >
                      {content.logIn}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div>
                    {/* <div className="relative">
                      <label className="text-xs ">
                        Çagyranyň linki, QR-kody ýa-da nomeri
                      </label>
                      <div className="absolute left-2 top-7 flex items-center h-[40px] text-gray-400">
                        <UserAddIcon className="h-5 w-5" />
                        <div className="text-xs ">+993</div>
                      </div>
                      <input
                        className="mt-1 border-[1px] border-[#AAAAAA] mb-5 rounded-md block w-full pl-16 pr-3 py-3 text-xs  placeholder-gray-500  focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="XXXXXX"
                      />
                    </div> */}

                    <div className="relative">
                      <label className="text-sm ">{content.username}</label>

                      <div className="absolute left-2 top-7 flex items-center h-[40px] text-gray-400">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <input
                        required
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 border-[1px] border-[#AAAAAA] mb-5 rounded-md block w-full pl-10 pr-3 py-3 text-xs  placeholder-gray-500  focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder={content.username}
                      />
                    </div>
                    <select
                      name="location"
                      placeholder="kategoriyany saylan"
                      className="border-[1px] border-[#AAAAAA] p-2 rounded-md w-full"
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      {locationData &&
                        locationData.map((location, index) => (
                          <option key={index} value={location.id}>
                            {location.name != 'Global' && location.name}
                          </option>
                        ))}
                    </select>
                    <div className="relative">
                      <label className="text-sm ">
                        {content['phone-number']}
                      </label>
                      <div className="absolute left-2 top-7 flex items-center h-[40px] text-gray-400">
                        <PhoneIcon className="h-5 w-5" />
                        <div className="text-xs ">+993</div>
                      </div>
                      <input
                        required
                        minLength="8"
                        onChange={(e) =>
                          setPhoneNumber(parseInt(e.target.value))
                        }
                        className=" mt-1 border-[1px] border-[#AAAAAA] mb-5 rounded-md block w-full pl-16 pr-3 py-3 text-xs  placeholder-gray-500  focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="61 000000"
                      />
                    </div>
                    <div className="relative mb-5">
                      <div className="absolute left-2 top-[0.1rem] flex items-center h-[40px] text-gray-400">
                        <KeyIcon className="h-5 w-5" />
                      </div>
                      <input
                        required
                        minLength="8"
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-[1px] border-[#AAAAAA] rounded-md block w-full pl-10 pr-3 py-3 text-xs  placeholder-gray-500  focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder={content.password}
                        type={eye}
                      />
                      <div className="absolute right-1 top-[0.1rem] flex items-center cursor-pointer h-[40px] ">
                        {eye == 'password' ? (
                          <EyeIcon
                            onClick={() => setEye('text')}
                            className="h-5 w-5 text-[#747474]"
                          />
                        ) : (
                          <EyeOffIcon
                            onClick={() => setEye('password')}
                            className="h-5 w-5 text-[#747474]"
                          />
                        )}
                      </div>
                    </div>
                    <div className="relative mb-5">
                      <div className="absolute left-2 top-[0.1rem] flex items-center h-[40px] text-gray-400">
                        <KeyIcon className="h-5 w-5" />
                      </div>
                      <input
                        required
                        minLength="8"
                        className="border-[1px] border-[#AAAAAA] rounded-md block w-full pl-10 pr-3 py-3 text-xs  placeholder-gray-500  focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder={content['verify-password']}
                        type={eye}
                      />
                      <div className="absolute right-1 top-[0.1rem] flex items-center cursor-pointer h-[40px] ">
                        {eye1 == 'password' ? (
                          <EyeIcon
                            onClick={() => setEye1('text')}
                            className="h-5 w-5 text-[#747474]"
                          />
                        ) : (
                          <EyeOffIcon
                            onClick={() => setEye1('password')}
                            className="h-5 w-5 text-[#747474]"
                          />
                        )}
                      </div>
                    </div>
                    {/* <div className="flex items-center gap-2 mt-5">
                      <input
                        required
                        type="checkbox"
                        id="my-checkbox"
                        className="form-checkbox  checked:bg-green-500"
                      />
                      <label
                        htmlFor="my-checkbox"
                        className=" text-xs text-gray-500 font-medium"
                      >
                        Düzgunnamany okadym we kabul etdim
                      </label>
                    </div> */}
                    {errors && (
                      <div className="text-red-400 border-2 rounded-md text-center mt-5 py-2">
                        {errors}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="bg-green-500 text-white p-2 text-center rounded-md mt-5 px-11 cursor-pointer w-full"
                    >
                      {content.registration}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* --------------------------------main place ------------------- */}
      <div className="xl:w-[1200px] w-11/12 m-auto min-h-[100vh] pt-44 sm:pt-24 ">
        {children}
      </div>
      {/* --------------footer-------------- */}
      <div>
        <div className="bg-gradient-to-r from-[#FAFAFA] to-[#E5E5E5] mt-28 flex h-full">
          <div className="flex-1 flex flex-col items-center p-14">
            <div className="text-4xl mb-5 font-[600] text-center">
              Mobil goşundyny ýükläp alyň!
            </div>
            <div className="flex gap-7 ">
              <div>
                <Image src="/appstore.png" width={200} height={500} alt="" />
              </div>
              <div>
                <Image src="/googleplay.png" width={200} height={500} alt="" />
              </div>
            </div>
          </div>
          <div className="flex-1 hidden lg:flex  h-full mt-auto ">
            <Image
              src="/footerPhone-gap.png"
              className="h-full w-full object-contain flex items-end"
              width={1000}
              height={500}
              alt=""
            />
          </div>
        </div>
        <div className="bg-black text-white block md:flex p-10 md:px-36">
          <div className="flex-1 grid grid-cols-3 gap-4 mt-5 text-[#AAAAAA]">
            {/* <div>Habarlar</div> */}
            <Link href={`/users/top?tab=officials`}>{content.tops}</Link>
            {/* <Link href={``}>Ulanyş düzgünleri</Link> */}
            {/* <div>Dükan</div> */}
            <Link href={`/officials`}>{content.officials}</Link>
            {/* <Link href={``}>Habarlaşmak</Link> */}
            <Link href={`/galleries`}>{content.photo}</Link>
            <Link href={`/posts/?is_selected=true`}>{content.selected}</Link>
            <Link href={``}>{content['about-us']}</Link>
          </div>
          <div className="flex-1   flex flex-col justify-end md:items-end items-center mt-5 md:mt-0">
            <Image
              className="w-56"
              height={1000}
              width={1000}
              alt=" "
              src="/logo1.d2b73f29.svg"
            />

            <div className="text-[#747474]">
              @2022 ArzanTM, Turkmenistan. All rights reserved.
            </div>
          </div>
        </div>
        <div className="flex bg-black text-[#747474] gap-5 justify-center p-5">
          <div className="flex gap-4">
            <Image
              src={`/YouTube_dark.svg`}
              width={20}
              height={20}
              alt=""
              className="h-4"
            />
            <Image
              src={`/tiktok-logo.svg`}
              width={20}
              height={20}
              alt=""
              className="h-4"
            />
            <Image
              src={`/black-instagram-transparent-logo-10671 (1).svg`}
              width={20}
              height={20}
              alt=""
              className="h-4"
            />
          </div>
          <div></div>
          <div></div>
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Container;
