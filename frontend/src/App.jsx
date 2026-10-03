import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Pricing from './pages/Pricing.jsx';
import { Blog, BlogPost } from './pages/Blog.jsx';
import Widget from './pages/Widget.jsx';
import { Login, Register } from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GstDeadlineChecker from './pages/tools/GstDeadlineChecker.jsx';
import TdsRateFinder from './pages/tools/TdsRateFinder.jsx';
import ComplianceScore from './pages/tools/ComplianceScore.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/widget" element={<Widget />} />
        <Route path="/embed" element={<Widget />} />
        <Route path="/tools/gst-deadline-checker" element={<GstDeadlineChecker />} />
        <Route path="/tools/tds-rate-finder" element={<TdsRateFinder />} />
        <Route path="/tools/compliance-score" element={<ComplianceScore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<p>Page not found.</p>} />
      </Routes>
    </Layout>
  );
}
