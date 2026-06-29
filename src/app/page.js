import HomeHero from '@/components/home-hero';
import { DividerSlash } from '@/components/frame';
import { PostGrid } from '@/components/post-card';
import { getAllPosts } from '@/lib/posts';

export default function Home() {
  const posts = getAllPosts();

  return (
    <div id="home-view">
      <HomeHero />
      <DividerSlash />
      <PostGrid posts={posts} activeCategory="首页" />
    </div>
  );
}
