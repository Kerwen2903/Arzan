import { PhoneIcon, PhotographIcon } from '@heroicons/react/outline';
import Container from '../../../components/Container';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { parse } from 'cookie';
import { getCookie } from 'cookies-next';
import { hostname } from '../../../setting';
import tk from '../../../static/locales/tk.json';
import ru from '../../../static/locales/ru.json';
import en from '../../../static/locales/en.json';
export async function getServerSideProps(context) {
  const { req, query } = context;

  try {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.token;
    const username = cookies.username;

    const headers = {
      'Content-Type': 'application/json',

      'Accept-language': 'tk',
    };

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
    const changeData = await response.json();
    if (username !== changeData.owner.username) {
      return {
        redirect: {
          destination: '/users/me',
          permanent: true,
        },
      };
    }

    return { props: { changeData } };
  } catch (error) {
    return { props: { changeData: null } };
  }
}

const Edit = ({ changeData }) => {
  const imagesIds = changeData?.images.map((image) => image.id);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState([]);

  // -----------------------------
  const [name, setName] = useState(changeData.name);
  const [description, setDescription] = useState(changeData.description);
  const [subCategory, setSubCategory] = useState(changeData.category);
  const [tag, setTag] = useState(changeData.tags.join(','));
  const [phoneNumber, setPhoneNumber] = useState(changeData.phone);
  const [price, setPrice] = useState(changeData.price);
  const [discountPrice, setDiscountPrice] = useState(changeData.discount);
  const [startedDate, setStartedDate] = useState(changeData.date_started);
  const [finishedDate, setFinishedDate] = useState(changeData.date_finished);
  const [imageTodos, setImageTodos] = useState(changeData.images);

  // ---------------------------------
  const [parentCatId, setParentCatId] = useState('');
  const [categories, setCategories] = useState();
  const [checked, setChecked] = useState(false);
  function handleChangeCAt(event) {
    setParentCatId(event.target.value);
  }
  const [imageId, setImageid] = useState(imagesIds);
  useEffect(() => {
    handleChange;
    async function fetchData() {
      const response = await fetch(`${hostname}/api/posts/categories/`);
      const data = await response.json();
      setCategories(data.results);
    }
    fetchData();
    handleChange();
  }, [
    setPrice,
    setName,
    setDescription,
    setTag,
    setPhoneNumber,
    setDiscountPrice,
    setStartedDate,
    setFinishedDate,
  ]);

  // _______________________________________________post
  const [postData, setPostData] = useState({});
  const [or, setOr] = useState(0);

  const handleChange = () => {
    handleNewImageTodoChange;
    setPostData({
      name: name,
      description: description,
      phone: phoneNumber,
      price: price,
      discount: discountPrice,
      date_started: startedDate,
      date_finished: finishedDate,
      tags: tag.split(','),
      images: imageId,
      category: subCategory,
    });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const tags = tag.split(',');
    setPostData({ ...postData, tags: tags });

    fetch(`${hostname}/api/posts/${changeData.id}/`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${getCookie('token')}`,
        'Content-Type': 'application/json',

        'Accept-language': 'tk',
      },
      body: JSON.stringify(postData),
    })
      .then((response) => {
        if (response.status == 200) {
          router.push(
            `/posts/${changeData.name}-${changeData.id}?edit=success`
          );
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
        <div className="flex flex-col">
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
          <div className="text-red-500">{errorMessage?.name}</div>

          <input
            value={name}
            type="text"
            name="name"
            placeholder={content['post-name']}
            className="border-2 p-2 rounded-md"
            onChange={(e) => {
              handleChange;
              setName(e.target.value);
            }}
          />
          <div className="text-red-500">{errorMessage?.description}</div>

          <textarea
            value={description}
            name={content.description}
            id="w3review"
            rows="4"
            cols="50"
            placeholder="Doly maglumaty"
            className="border-2 p-2 rounded-md"
            onChange={(e) => {
              handleChange;
              setDescription(e.target.value);
            }}
          />
          <select
            name="category"
            placeholder="kategoriyany saylan"
            className="border-2 p-2 rounded-md"
            onChange={handleChangeCAt}
          >
            {categories &&
              categories.map((category, index) => (
                <option key={index} value={index}>
                  {category.name}
                </option>
              ))}
          </select>
          <div className="text-red-500">{errorMessage?.category}</div>

          <select
            name="category"
            placeholder="subkategoriyany saylan"
            className="border-2 p-2 rounded-md"
            onChange={handleChange}
          >
            {categories &&
              parentCatId &&
              categories[parentCatId].subcategories.map(
                (subcategory, index) => (
                  <option
                    key={index}
                    value={subcategory.id}
                    onChange={(e) => setSubCategory(e.targetvalue)}
                  >
                    {subcategory.name}
                  </option>
                )
              )}
          </select>
          <div className="text-red-500">{errorMessage?.tags}</div>

          <input
            value={tag}
            type="text"
            placeholder="Hash tag (tag, tag2) "
            className="border-2 p-2 rounded-md"
            onChange={(e) => {
              setTag(e.target.value);
              handleChange(e);
            }}
          />
          <div className="text-red-500">{errorMessage?.phone}</div>

          <div className="flex gap-5 relative">
            <input
              value={phoneNumber}
              type="tel"
              name="phone"
              pattern="[0-9]*"
              placeholder={content['phone-number']}
              className="pl-11 border-2 rounded-md w-full p-2"
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                handleChange(e);
              }}
            />
            <div className="absolute left-5 top-0 flex items-center h-[40px] text-gray-400">
              <PhoneIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="text-red-500">
            {errorMessage?.price || errorMessage?.discount}
          </div>
          <div className="flex gap-5 relative">
            <input
              value={price}
              name="price"
              type="number"
              placeholder={content.price}
              className="pl-2 border-2 rounded-md w-full p-2"
              onChange={(e) => {
                setPrice(e.target.value);
                handleChange(e);
              }}
            />
            <input
              value={discountPrice}
              name="discount"
              type="number"
              placeholder={content['discount-price']}
              className="pl-2 border-2 rounded-md w-full p-2"
              onChange={(e) => {
                setDiscountPrice(e.target.value);
                handleChange(e);
              }}
            />
          </div>
          <div className="text-red-500">
            {errorMessage?.date_started || errorMessage?.date_finished}
          </div>
          <div className="flex gap-5 relative">
            <input
              value={startedDate}
              name="date_started"
              type="date"
              placeholder="gg.aa.ýýýý"
              className="pl-2 border-2 rounded-md w-full p-2"
              onChange={(e) => {
                setStartedDate(e.target.value);
                handleChange(e);
              }}
            />
            <input
              value={finishedDate}
              name="date_finished"
              type="date"
              placeholder="gg.aa.ýýýý"
              className="pl-2 border-2 rounded-md w-full p-2"
              onChange={(e) => {
                setFinishedDate(e.target.value);
                handleChange(e);
              }}
            />
          </div>
          {/* <div className="flex gap-4">
            <input type="checkbox" onChange={() => setChecked(!checked)} />
            <div>Düzgünleri okadym</div>
          </div> */}
          <button
            disabled={checked}
            type="submit"
            className={
              !checked
                ? 'w-3/5 bg-green-500 text-white rounded-md p-4 flex m-auto justify-center'
                : 'w-3/5 bg-gray-300 text-white rounded-md p-4 flex m-auto justify-center'
            }
            onClick={() => {
              handleChange();
            }}
          >
            {content.edit}
          </button>
        </form>
      </div>
    </Container>
  );
};
export default Edit;
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
