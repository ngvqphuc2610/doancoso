import { getNowShowingMovies, getComingSoonMovies } from '@/lib/film';
import HomeClient from '@/components/home/HomeClient';

export default async function Home() {
  try {
    // Fetch data on the server
    const [nowShowingMovies, comingSoonMovies] = await Promise.all([
      getNowShowingMovies(),
      getComingSoonMovies()
    ]);

    // Pass data to client component
    return <HomeClient
      initialNowShowingMovies={nowShowingMovies}
      initialComingSoonMovies={comingSoonMovies}
    />;
  } catch (error) {
    console.error("Error fetching home data:", error);
    return <HomeClient />;
  }
}
