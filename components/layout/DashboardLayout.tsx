"use client"

import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import Sidebar from "./Sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="px-8 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {format(new Date(), 'yyyy年MM月dd日 (E)', { locale: ja })}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  {session?.user?.name || session?.user?.email}
                </span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}