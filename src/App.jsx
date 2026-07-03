import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import TagPosts from './pages/TagPosts'
import About from './pages/About'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Dashboard from './pages/admin/Dashboard'
import PostEditor from './pages/admin/PostEditor'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="posts/:slug" element={<PostDetail />} />
        <Route path="tags/:slug" element={<TagPosts />} />
        <Route path="about" element={<About />} />
        <Route path="login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="admin" element={<Dashboard />} />
          <Route path="admin/write" element={<PostEditor />} />
          <Route path="admin/edit/:id" element={<PostEditor />} />
        </Route>
        <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
