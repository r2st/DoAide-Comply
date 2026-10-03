import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { setMeta } from './Home.jsx';

export function Blog() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    setMeta('Compliance Blog | DoAide Comply', 'GST, TDS, ROC and payroll compliance guides for Indian businesses.');
    api('/public/blog').then(setPosts).catch(() => {});
  }, []);
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-white">Compliance guides</h1>
      <div className="space-y-4">
        {posts.map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="card block hover:border-gold">
            <h2 className="font-semibold text-white">{p.title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{p.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    api(`/public/blog/${slug}`).then((p) => { setPost(p); setMeta(`${p.title} | DoAide Comply`, p.description); }).catch(() => setMissing(true));
  }, [slug]);
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
    </article>
  );
}
