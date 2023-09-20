import React, { useEffect, useState } from 'react';
import {
  BookmarkIcon,
  CalendarIcon,
  ChatIcon,
  EyeIcon,
  HeartIcon,
  PhoneIcon,
  PhotographIcon,
} from '@heroicons/react/outline';
import Image from 'next/image';
import { getCookie } from 'cookies-next';
import Container from '../../components/Container';
import { useRouter } from 'next/router';
import { hostname } from '../../setting';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';
import 'swiper/swiper-bundle.css';
import { ToastContainer, toast } from 'react-toastify';
import tk from '../../static/locales/tk.json';
import ru from '../../static/locales/ru.json';
import en from '../../static/locales/en.json';
SwiperCore.use([Navigation, Pagination, Autoplay]);
function ImageList({}) {
  const router = useRouter();
  // -----------------------------
  const [isBeforeView, setIsBeforeView] = useState(false);
  const [errorMessage, setErrorMessage] = useState([]);
  const [imageTodos, setImageTodos] = useState([]);
  // -------------------------------------------------
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
  // ---------------------------------
  const [parentCatId, setParentCatId] = useState('');
  const [categories, setCategories] = useState();
  const [checked, setChecked] = useState(false);
  function handleChangeCAt(event) {
    setParentCatId(event.target.value);
  }
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`${hostname}/api/posts/categories/`);
      const data = await response.json();
      setCategories(data.results);
    }
    fetchData();
  }, []);
  const [imageId, setImageid] = useState([]);
  const [tags, setTags] = useState('');

  // _______________________________________________post
  const [postData, setPostData] = useState({});
  const [or, setOr] = useState(0);
  const notify = () => {
    toast.success('Wow so easy!', {
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
  const handleChange = (event) => {
    handleNewImageTodoChange;
    const { name, value } = event.target;
    setPostData({ ...postData, tags: tags, images: imageId, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch(`${hostname}/api/posts/`, {
      method: 'POST',
      headers: {
        Authorization: `token ${getCookie('token')}`,
        'Content-Type': 'application/json',

        'Accept-language': 'tk',
      },
      body: JSON.stringify(postData),
    })
      .then((response) => {
        if (response.status == 201) {
          router.push(`/users/me?created=success`);
          notify();
        }
        return response.json().then((data) => {
          if (response.status == 400) {
            throw data;
          }
        });
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };
  // ________________________________________________

  const handleNewImageTodoChange = async (event) => {
    const file = event.target.files[0];

    try {
      const imageUrl = await uploadImage(file);

      setImageTodos([...imageTodos, imageUrl]);
      setImageid([...imageId, imageUrl.id]);
      setOr(or + 1);
    } catch (error) {}
  };

  const uploadImage = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('order', or);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        const percent = (event.loaded / event.total) * 100;
        console.log(`Progress: ${percent}%`);
        // Update progress bar here
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 201) {
            const imageUrl = JSON.parse(xhr.responseText);

            resolve(imageUrl);
            handleChange;
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
  return (
    <Container>
      <button
        onClick={() => router.back()}
        className="bg-green-500 w-[50px] text-white text-2xl rounded-md mb-5"
      >
        &#8249;
      </button>
      <div className=" w-full mt-10">
        <div className="flex flex-col ">
          <div className="text-red-500">{errorMessage?.images}</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {imageTodos.map((imageUrl, index) => {
              return <ImageTodoItem TodoItem key={index} imageUrl={imageUrl} />;
            })}
            <div className="relative h-56">
              <label
                className="absolute bg-white w-full h-full border-dashed border-2 border-[#AAAAAA] rounded-md flex flex-col items-center justify-center text-green-500"
                htmlFor="input-file"
              >
                <PhotographIcon className="w-7 h-7" />
                {content['add-photo']}
              </label>
            </div>
          </div>
        </div>
        <form>
          <div className="flex flex-col w-3/5 m-auto gap-5 mt-11">
            <input
              type="file"
              onChange={handleNewImageTodoChange}
              className="hidden"
              id="input-file"
            />
          </div>
        </form>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="text-red-500 -mb-5">{errorMessage?.name}</div>
          <input
            type="text"
            name="name"
            placeholder={content['post-name']}
            className="border-2 p-2 rounded-md"
            onChange={handleChange}
          />
          <div className="text-red-500 -mb-5">{errorMessage?.description}</div>

          <textarea
            name="description"
            id="w3review"
            rows="4"
            cols="50"
            placeholder={content.description}
            className="border-2 p-2 rounded-md"
            onChange={handleChange}
          />
          <div className="-mb-5">{content.category}</div>
          <select
            name="category"
            placeholder="kategoriyany saylan"
            className="border-2 p-2 rounded-md"
            onChange={handleChangeCAt}
            onClick={handleChangeCAt}
          >
            {categories &&
              categories.map((category, index) => (
                <option key={index} value={index}>
                  {category.name}
                </option>
              ))}
          </select>
          <div className="text-red-500 -mb-5">{errorMessage?.category}</div>
          <div className="-mb-5">{content.subcategory}</div>

          <select
            name="category"
            placeholder="kategoriyany saylan"
            className="border-2 p-2 rounded-md"
            onChange={handleChange}
            onClick={handleChange}
          >
            {categories &&
              parentCatId &&
              categories[parentCatId].subcategories.map(
                (subcategory, index) => (
                  <option key={index} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                )
              )}
          </select>
          <div className="text-red-500 -mb-5">{errorMessage?.tags}</div>

          <input
            type="text"
            placeholder="Hash tag (tag, tag2) "
            className="border-2 p-2 rounded-md"
            onChange={(e) => {
              setTags(e.target.value.split(','));
              handleChange(e);
            }}
          />
          <div className="text-red-500 -mb-5">{errorMessage?.phone}</div>

          <div className="flex gap-5 relative">
            <input
              type="tel"
              name="phone"
              pattern="[0-9]*"
              placeholder={content['phone-number']}
              className="pl-24 border-2 rounded-md w-full p-2"
              onChange={handleChange}
            />
            <div className="absolute left-5 top-[1px] flex items-center h-[40px] text-gray-400 gap-4">
              <PhoneIcon className="h-5 w-5" />
              +993
            </div>
          </div>
          <div className="text-red-500 -mb-5">
            {errorMessage?.price || errorMessage?.discount}
          </div>

          <div className="flex gap-5 relative">
            <input
              name="price"
              type="number"
              placeholder={content.price}
              className="pl-2 border-2 rounded-md w-full p-2"
              onChange={handleChange}
            />
            <input
              name="discount"
              type="number"
              placeholder={content['discount-price']}
              className="pl-2 border-2 rounded-md w-full p-2"
              onChange={handleChange}
            />
          </div>
          <div className="text-red-500 -mb-5">
            {errorMessage?.date_started || errorMessage?.date_finished}
          </div>
          <div className="flex gap-5 relative">
            <input
              name="date_started"
              type="date"
              placeholder="gg.aa.ýýýý"
              className="pl-2 border-2 rounded-md w-full p-2"
              onChange={handleChange}
            />
            <input
              name="date_finished"
              type="date"
              placeholder="gg.aa.ýýýý"
              className="pl-2 border-2 rounded-md w-full p-2"
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-between">
            {/* <div className="flex gap-4">
              <input type="checkbox" onChange={() => setChecked(!checked)} />
              <div>Düzgünleri okadym</div>
            </div> */}
            <div
              className="flex items-center text-[#0EC243] cursor-pointer"
              onClick={() => setIsBeforeView(true)}
            >
              <EyeIcon className="w-5 h-5" />
              {content.preview}
            </div>
          </div>
          {/* <div className="bg-red-500"> {errorMessage.category}</div> */}
          <button
            disabled={checked}
            onClick={() => {
              handleChange;
            }}
            type="submit"
            className={
              !checked
                ? 'w-3/5 bg-green-500 text-white rounded-md p-4 flex m-auto justify-center'
                : 'w-3/5 bg-gray-300 text-white rounded-md p-4 flex m-auto justify-center'
            }
          >
            {content.add}
          </button>
        </form>
        {isBeforeView && (
          <div
            className="fixed w-full p-12 right-0 top-0 bg-white overflow-y-auto h-[100vh]"
            onClick={() => setIsBeforeView(false)}
          >
            <div className="lg:w-9/12 w-11/12 m-auto">
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
                  {imageTodos?.map((imageUrl, index) => (
                    <SwiperSlide key={index} className="md:h-2/3">
                      <Image
                        height={500}
                        width={1000}
                        alt=" "
                        className=" w-full h-[300px] md:h-[600px] object-contain   rounded-md"
                        src={`${imageUrl?.file}`}
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
              <div className="flex justify-between  m-auto mt-5">
                <BookmarkIcon className="w-7 h-7" />

                <label>
                  <HeartIcon className="w-7 h-7 text-red-600 cursor-pointer" />
                </label>
              </div>
              <div className="flex  m-auto gap-5 mt-5 text-gray-500">
                <div>07.01.2023</div>
                <div className="flex items-center">
                  <EyeIcon className="w-5 h-5" /> 0
                </div>
                <div className="flex items-center">
                  <HeartIcon className="w-5 h-5" />0
                </div>
                <div className="flex items-center">
                  <ChatIcon className="w-5 h-5" /> 0
                </div>
              </div>
              <div className="">
                <h1 className="md:text-4xl text-xl mb-5 mt-5">
                  {postData?.name}
                </h1>
                <div className="w-full h-[1px] bg-[#E5E5E5]"></div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex text-4xl items-end text-green-500 font-bold gap-3 mt-6">
                      {postData?.discount}
                      <h1 className="text-xl text-black font-[400]">
                        {' '}
                        manat
                      </h1>{' '}
                      <h1 className="line-through text-xl text-[#AAAAAA] ml-10 font-[400]">
                        {postData?.price} manat
                      </h1>
                    </div>
                    <div className="flex items-center mt-5 gap-2 text-[#AAAAAA]">
                      <CalendarIcon className="w-5 h-5 " />
                      {postData?.date_started} - {postData?.date_finished}
                    </div>
                  </div>
                  <div className="flex w-16 h-16 bg-green-500 text-white justify-center text-2xl rounded-full items-center">
                    {(postData?.discount / postData.price) * 100}%
                  </div>
                </div>
                <div className="w-full h-[1px] bg-[#E5E5E5] mt-7"></div>
                <h1 className="my-5 text-justify">{postData?.description}</h1>
                <div className="flex flex-wrap gap-2">
                  {postData.tags &&
                    postData?.tags.map((tags, index) => (
                      <div
                        className="bg-green-100 text-green-600 rounded-md px-2 w-max"
                        key={index}
                      >
                        <div>#{tags}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}

function ImageTodoItem({ imageUrl }) {
  return (
    <Image
      height={1000}
      width={1000}
      src={imageUrl.file}
      alt="Todo item"
      className="rounded-md h-56 w-full object-cover"
    />
  );
}

export default ImageList;
