import Link from 'next/link';

const Home = () => {
  return (
    <div className="flex flex-col w-full justify-center items-center pt-20 gap-20">
      <h1>Visihire</h1>
      <Link href="/signup">Sign up</Link>
      <Link href="/login">Log in</Link>
    </div>
  );
};
export default Home;
