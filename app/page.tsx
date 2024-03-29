import cn from 'classnames';
import Container from '../components/container';
import MoreStories from '../components/more-stories';
import Intro from '../components/intro';
import Layout from '../components/layout';
import { getAllPosts } from '../lib/mdn2html/api';

export default function Index() {
  const allPosts = getAllPosts(['title', 'date', 'slug', 'author', 'coverImage', 'excerpt']);
  return (
    <>
      <Layout>
        <Container>
          <Intro />
          <img
            src={'/assets/sky.webp'}
            alt={`Cover Image for Top`}
            className={cn('shadow-sm', {
              'hover:shadow-lg transition-shadow duration-200 w-screen': true,
            })}
          />
          {(allPosts || []).length > 0 && <MoreStories posts={allPosts || []} />}
        </Container>
      </Layout>
    </>
  );
}
