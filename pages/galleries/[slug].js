import { useRouter } from 'next/router';
import Container from '../../components/Container';
import PhotoList from '../../components/PhotoList';
import { hostname } from '../../setting';
import { parse } from 'cookie';

export async function getServerSideProps(context) {
  const { query, req } = context;
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.token;
  let location = '';
  const slugArray = query.slug.split('-');
  const lengthSlugArray = slugArray.length - 1;
  const queryId = slugArray[lengthSlugArray];
  if (cookies.location) location = `?location=${cookies.location}`;
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept-language': cookies.language || 'tk',
    };
    if (token) {
      headers.Authorization = `Token ${token}`;
    }
    const url = `${hostname}/api/galleries/images/?gallery=${queryId}`;
    const response = await fetch(url, {
      headers,
    });
    const data = await response.json();
    const username = query.slug;

    return { props: { data, username } };
  } catch (error) {
    return { props: { data: null } };
  }
}

export default function GalleryIn({ data, username }) {
  const router = useRouter();
  return (
    <>
      <Container>
        <button
          onClick={() => router.back()}
          className="bg-green-500 w-[50px] text-white text-2xl rounded-md mb-5"
        >
          &#8249;
        </button>
        <PhotoList data={data.results} username={username} grid={4} />
      </Container>
    </>
  );
}
