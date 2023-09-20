import ContentLoader from 'react-content-loader';

const OfficialsSkeleton = () => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return numbers.map((number, i) => (
    <ContentLoader
      key={i}
      speed={4}
      width={`100%`}
      height={100}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      className="w-full h-min rounded-md"
    >
      <rect x="13" y="20" rx="100%" ry="100%" width="60" height="60" />
      <rect x="90" y="28" rx="0" ry="0" width="200" height="14" />
      <rect x="90" y="50" rx="0" ry="0" width="150" height="15" />
    </ContentLoader>
  ));
};
export default OfficialsSkeleton;
