import { getCollection } from 'astro:content';

export async function GET() {
  try {
    const posts = await getCollection('blog');
    const searchIndex = posts.map(post => ({
      title: post.data.title,
      description: post.data.description || '',
      category: post.data.category || '',
      slug: post.slug,
      pubDate: post.data.pubDate
    }));

    return new Response(JSON.stringify(searchIndex), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
