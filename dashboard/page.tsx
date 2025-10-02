"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  Activity,
  Calendar
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart
} from "recharts"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface DashboardStats {
  customers: {
    total: number
    currentMonth: number
    lastMonth: number
    growthRate: number
    totalContractAmount: number
    averageContractAmount: number
    customersWithContracts: number
    totalAnnualRevenue: number
    byIndustry: Record<string, number>
  }
  tasks: {
    total: number
    completed: number
    pending: number
    inProgress: number
    high: number
    medium: number
    low: number
  }
  leads: {
    total: number
    new: number
    contacted: number
    qualified: number
    averageScore: number
  }
  opportunities: {
    total: number
    totalValue: number
    averageValue: number
    byStage: {
      qualification: number
      proposal: number
      negotiation: number
      closed: number
    }
  }
  monthlyData: Array<{
    month: string
    customers: number
    tasks: number
    revenue: number
  }>
  monthlyRevenue: Array<{
    month: string
    amount: number
    deals: number
  }>
  recentActivities: any[]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const taskPriorityData = stats ? [
    { name: '高', value: stats.tasks.high, color: '#EF4444' },
    { name: '中', value: stats.tasks.medium, color: '#F59E0B' },
    { name: '低', value: stats.tasks.low, color: '#10B981' }
  ] : []

  const taskStatusData = stats ? [
    { name: '完了', value: stats.tasks.completed, color: '#10B981' },
    { name: '進行中', value: stats.tasks.inProgress, color: '#3B82F6' },
    { name: '未完了', value: stats.tasks.pending, color: '#6B7280' }
  ] : []

  const opportunityStageData = stats ? [
    { stage: '検討', value: stats.opportunities.byStage.qualification },
    { stage: '提案', value: stats.opportunities.byStage.proposal },
    { stage: '交渉', value: stats.opportunities.byStage.negotiation },
    { stage: '成約', value: stats.opportunities.byStage.closed }
  ] : []

  const formattedMonthlyData = stats?.monthlyData.map(item => ({
    ...item,
    monthLabel: format(new Date(item.month), 'MMM', { locale: ja })
  })) || []

  const formattedRevenueData = stats?.monthlyRevenue?.map(item => ({
    ...item,
    monthLabel: format(new Date(item.month), 'MMM', { locale: ja })
  })) || []

  const industryData = stats ? Object.entries(stats.customers.byIndustry || {})
    .map(([industry, count]) => ({
      name: industry,
      value: count as number,
      percentage: ((count as number / stats.customers.total) * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) : []

  return (
    <DashboardLayout title="ダッシュボード">
      <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-t-4 border-t-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">顧客数</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.customers.total || 0}</div>
                  <div className="flex items-center text-xs mt-2">
                    {stats && stats.customers.growthRate >= 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                        <span className="text-green-600">+{stats.customers.growthRate.toFixed(1)}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                        <span className="text-red-600">{stats?.customers.growthRate.toFixed(1)}%</span>
                      </>
                    )}
                    <span className="text-gray-500 ml-1">前月比</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-green-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">契約総額</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ¥{(stats?.customers.totalContractAmount || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {stats?.customers.customersWithContracts || 0} 件の契約
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-yellow-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">リード数</CardTitle>
                  <Target className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.leads.total || 0}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    平均スコア: {stats?.leads.averageScore.toFixed(1) || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-purple-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">商談総額</CardTitle>
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ¥{(stats?.opportunities.totalValue || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {stats?.opportunities.total || 0} 件の商談
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-t-4 border-t-indigo-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">タスク完了率</CardTitle>
                  <CheckCircle className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats && stats.tasks.total > 0 
                      ? ((stats.tasks.completed / stats.tasks.total) * 100).toFixed(0)
                      : 0}%
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {stats?.tasks.completed || 0} / {stats?.tasks.total || 0} 完了
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-orange-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均契約額</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ¥{(stats?.customers.averageContractAmount || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    顧客あたり平均
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-teal-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">進行中タスク</CardTitle>
                  <Activity className="h-4 w-4 text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.tasks.inProgress || 0}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    高優先度: {stats?.tasks.high || 0} 件
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-pink-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">年間売上総額</CardTitle>
                  <DollarSign className="h-4 w-4 text-pink-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ¥{(stats?.customers.totalAnnualRevenue || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    全顧客合計
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    月次契約トレンド
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={formattedMonthlyData}>
                      <defs>
                        <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="monthLabel" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="customers" 
                        name="契約数"
                        stroke="#3B82F6" 
                        fillOpacity={1}
                        fill="url(#colorCustomers)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="tasks" 
                        name="タスク数"
                        stroke="#10B981" 
                        fillOpacity={1}
                        fill="url(#colorTasks)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Task Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-orange-600" />
                    タスク優先度分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={taskPriorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {taskPriorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Chart */}
            <div className="grid grid-cols-1 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                    月次契約金額推移
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={formattedRevenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="monthLabel" stroke="#6B7280" />
                      <YAxis yAxisId="left" stroke="#6B7280" />
                      <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" />
                      <Tooltip 
                        formatter={(value: any, name: string) => {
                          if (name === '契約金額') {
                            return `¥${value.toLocaleString()}`
                          }
                          return `${value}件`
                        }}
                        labelFormatter={(label) => `月: ${label}`}
                      />
                      <Legend />
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="amount" 
                        name="契約金額"
                        stroke="#8B5CF6" 
                        fillOpacity={1}
                        fill="url(#colorRevenue)" 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="deals" 
                        name="契約件数"
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        dot={{ fill: '#F59E0B' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Second Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Task Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">タスクステータス</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={taskStatusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6">
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Industry Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">業界別顧客分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <RePieChart>
                      <Pie
                        data={industryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {industryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Third Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Opportunity Pipeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">商談パイプライン</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={opportunityStageData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="stage" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Lead Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">リードステータス</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">新規</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${stats && stats.leads.total > 0 ? (stats.leads.new / stats.leads.total * 100) : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats?.leads.new || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">連絡済み</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full" 
                            style={{ width: `${stats && stats.leads.total > 0 ? (stats.leads.contacted / stats.leads.total * 100) : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats?.leads.contacted || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">適格</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${stats && stats.leads.total > 0 ? (stats.leads.qualified / stats.leads.total * 100) : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats?.leads.qualified || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">最近のアクティビティ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.recentActivities.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            {activity.title}
                            {activity.customer && (
                              <span className="text-gray-500"> - {activity.customer.name}</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(activity.updatedAt), 'MM/dd HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Performance Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    月次タスク完了率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={formattedMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="monthLabel" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
                      <Line 
                        type="monotone" 
                        dataKey="taskCompletionRate" 
                        name="完了率"
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ fill: '#10B981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-yellow-600" />
                    月次リード転換率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={formattedRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="monthLabel" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
                      <Line 
                        type="monotone" 
                        dataKey="leadConversionRate" 
                        name="転換率"
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        dot={{ fill: '#F59E0B' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">パフォーマンス指標</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats?.tasks.high || 0}</p>
                    <p className="text-sm text-gray-600">優先度高タスク</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {stats && stats.leads.total > 0 
                        ? ((stats.leads.qualified / stats.leads.total) * 100).toFixed(0)
                        : 0}%
                    </p>
                    <p className="text-sm text-gray-600">リード転換率</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      ¥{((stats?.opportunities.averageValue || 0) / 1000).toFixed(0)}K
                    </p>
                    <p className="text-sm text-gray-600">平均商談額</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {stats?.customers.currentMonth || 0}
                    </p>
                    <p className="text-sm text-gray-600">今月の新規顧客</p>
                  </div>
                </div>
              </CardContent>
            </Card>
      </>
    </DashboardLayout>
  )
}