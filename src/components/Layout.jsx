import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main
        key={location.pathname}
        className="fade-up mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
