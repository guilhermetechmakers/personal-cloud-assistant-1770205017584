import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 block text-center text-2xl font-bold text-accent">
          ClawCloud
        </Link>
        <Outlet />
      </div>
    </div>
  )
}
