import ContentLoader from 'react-content-loader';

const PostsSkeleton = () => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return numbers.map((number, i) => (
    <ContentLoader
      key={i}
      speed={4}
      width={`100%`}
      height={315}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      className="w-full h-min rounded-md"
    >
      <rect x="0" y="0" rx="15" ry="0" width="100%" height="70%" />
      <rect x="10" y="240" rx="0" ry="0" width="200" height="7%" />
      <rect x="10" y="280" rx="0" ry="0" width="150" height="15" />
    </ContentLoader>
  ));
};
export default PostsSkeleton;
