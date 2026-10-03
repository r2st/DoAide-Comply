import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { setMeta } from './Home.jsx';
import { staticPosts } from '../data/blogPosts.js';
import ShareButtons from '../components/ShareButtons.jsx';

export function Blog() {
  const [apiPosts, setApiPosts] = useState([]);
  useEffect(() => {
    setMeta('Compliance Blog | DoAide Comply', 'GST, TDS, ROC and payroll compliance guides for Indian businesses.');
    api('/public/blog').then(setApiPosts).catch(() => {});
  }, []);
  const allPosts = [...apiPosts.filter((p) => !staticPosts.some((s) => s.slug === p.slug)), ...staticPosts]
    .sort((a, b) => b.published.localeCompare(a.published));
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-white">Compliance guides</h1>
      <div className="space-y-4">
        {allPosts.map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="card block hover:border-gold">
            <h2 className="font-semibold text-white">{p.title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{p.description}</p>
            <p className="mt-1 text-xs text-zinc-500">{p.published}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const staticPost = staticPosts.find((p) => p.slug === slug);
  const [post, setPost] = useState(staticPost || null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (staticPost) {
      setMeta(`${staticPost.title} | DoAide Comply`, staticPost.description);
      return;
    }
    api(`/public/blog/${slug}`)
      .then((p) => { setPost(p); setMeta(`${p.title} | DoAide Comply`, p.description); })
      .catch(() => setMissing(true));
  }, [slug, staticPost]);

  useEffect(() => {
    if (!post) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      datePublished: post.published,
      author: { '@type': 'Organization', name: 'DoAide Comply' },
      publisher: { '@type': 'Organization', name: 'DoAide Comply', url: 'https://comply.doaide.com' },
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [post]);

  if (missing) return <p>Post not found. <Link to="/blog" className="text-gold">Back to blog</Link></p>;
  if (!post) return <p>Loading…</p>;
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold text-white">{post.title}</h1>
      <time className="text-xs text-zinc-500">{post.published}</time>
      <div className="mt-6 space-y-4 text-zinc-300">{post.body.map((para, i) => <p key={i}>{para}</p>)}</div>
      <div className="card mt-10 text-center">
        <p className="mb-3 text-white">Get your full personalised compliance calendar, free.</p>
        <Link to="/" className="btn">Run the free health check</Link>
      </div>
      <div className="mt-6">
        <ShareButtons text={`${post.title} — read on DoAide Comply`} />
      </div>
    </article>
  );
}
