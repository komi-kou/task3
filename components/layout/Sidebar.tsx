"use client"

import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  CheckCircle, 
  Activity,
  LogOut,
  Target,
  BarChart3,
  Briefcase
} from "lucide-react"

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: Activity },
  { name: '顧客管理', href: '/customers', icon: Users },
  { name: 'タスク管理', href: '/tasks', icon: CheckCircle },
  { name: 'リード管理', href: '/leads', icon: Target },
  { name: '商談管理', href: '/opportunities', icon: Briefcase },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-gradient-to-b from-blue-700 to-blue-800 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center">
          <BarChart3 className="w-8 h-8 mr-2" />
          CRM Pro
        </h1>
      </div>
      <nav className="mt-6 flex-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-blue-900 bg-opacity-50 border-l-4 border-white'
                  : 'hover:bg-blue-600'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </a>
          )
        })}
      </nav>
      <div className="p-6">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-blue-600"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="w-5 h-5 mr-3" />
          ログアウト
        </Button>
      </div>
    </div>
  )
}