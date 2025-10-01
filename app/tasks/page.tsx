"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { format, subMonths } from "date-fns"
import { ja } from "date-fns/locale"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Users, 
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  PauseCircle,
  XCircle,
  Tag,
  BarChart3,
  Timer
} from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string | null
  startDate: string | null
  completedAt: string | null
  estimatedHours: number | null
  actualHours: number | null
  assignee: string | null
  category: string | null
  tags: string | null
  progress: number
  createdAt: string
  customer?: {
    id: string
    name: string
    company: string
  }
}

interface Customer {
  id: string
  name: string
  company: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "not_started",
    priority: "medium",
    dueDate: "",
    startDate: "",
    estimatedHours: 0,
    assignee: "",
    category: "none",
    tags: "",
    progress: 0,
    customerId: "none"
  })

  useEffect(() => {
    fetchTasks()
    fetchCustomers()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks")
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers")
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    }
  }

  const handleAddTask = async () => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        fetchTasks()
        setIsAddDialogOpen(false)
        resetForm()
        toast.success("タスクを追加しました")
      } else {
        toast.error("タスクの追加に失敗しました")
      }
    } catch (error) {
      console.error("Failed to add task:", error)
    }
  }

  const handleEditTask = async () => {
    if (!selectedTask) return
    
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        fetchTasks()
        setIsEditDialogOpen(false)
        resetForm()
        toast.success("タスクを更新しました")
      } else {
        toast.error("タスクの更新に失敗しました")
      }
    } catch (error) {
      console.error("Failed to edit task:", error)
    }
  }

  const handleToggleStatus = async (task: Task) => {
    // ステータス遷移のロジック
    let newStatus = task.status
    if (task.status === "not_started") {
      newStatus = "in_progress"
    } else if (task.status === "in_progress") {
      newStatus = "completed"
    } else if (task.status === "completed") {
      newStatus = "not_started"
    }
    
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          startDate: newStatus === "in_progress" && !task.startDate ? new Date().toISOString() : task.startDate,
          completedAt: newStatus === "completed" ? new Date().toISOString() : null,
          progress: newStatus === "completed" ? 100 : task.progress
        })
      })
      if (res.ok) {
        fetchTasks()
        toast.success("タスクステータスを更新しました")
      } else {
        toast.error("ステータスの更新に失敗しました")
      }
    } catch (error) {
      console.error("Failed to toggle task status:", error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm("このタスクを削除してもよろしいですか？")) return
    
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        fetchTasks()
        toast.success("タスクを削除しました")
      } else {
        toast.error("タスクの削除に失敗しました")
      }
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "not_started",
      priority: "medium",
      dueDate: "",
      startDate: "",
      estimatedHours: 0,
      assignee: "",
      category: "none",
      tags: "",
      progress: 0,
      customerId: "none"
    })
    setSelectedTask(null)
  }

  const openEditDialog = (task: Task) => {
    setSelectedTask(task)
    setFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : "",
      startDate: task.startDate ? task.startDate.split('T')[0] : "",
      estimatedHours: task.estimatedHours || 0,
      assignee: task.assignee || "",
      category: task.category || "none",
      tags: task.tags || "",
      progress: task.progress || 0,
      customerId: task.customer?.id || "none"
    })
    setIsEditDialogOpen(true)
  }

  // Generate month options for the last 12 months
  const monthOptions = []
  for (let i = 0; i < 12; i++) {
    const date = subMonths(new Date(), i)
    monthOptions.push({
      value: format(date, 'yyyy-MM'),
      label: format(date, 'yyyy年M月', { locale: ja })
    })
  }

  // Group tasks by month
  const tasksByMonth: Record<string, Task[]> = {}
  tasks.forEach(task => {
    const monthKey = format(new Date(task.createdAt), 'yyyy年M月', { locale: ja })
    if (!tasksByMonth[monthKey]) {
      tasksByMonth[monthKey] = []
    }
    tasksByMonth[monthKey].push(task)
  })

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    const matchesMonth = selectedMonth === 'all' || 
      format(new Date(task.createdAt), 'yyyy-MM') === selectedMonth
    return matchesSearch && matchesStatus && matchesPriority && matchesMonth
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100"
      case "medium": return "text-yellow-600 bg-yellow-100"
      case "low": return "text-green-600 bg-green-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high": return "高"
      case "medium": return "中"
      case "low": return "低"
      default: return priority
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "not_started": return <Clock className="w-5 h-5 text-gray-400" />
      case "in_progress": return <Timer className="w-5 h-5 text-blue-600" />
      case "completed": return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "on_hold": return <PauseCircle className="w-5 h-5 text-yellow-600" />
      case "cancelled": return <XCircle className="w-5 h-5 text-red-600" />
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "not_started": return "着手前"
      case "in_progress": return "着手中"
      case "completed": return "完了"
      case "on_hold": return "保留"
      case "cancelled": return "キャンセル"
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not_started": return "bg-gray-100 text-gray-800"
      case "in_progress": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-green-100 text-green-800"
      case "on_hold": return "bg-yellow-100 text-yellow-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string | null) => {
    if (!category) return null
    switch (category) {
      case "development": return "💻"
      case "design": return "🎨"
      case "meeting": return "👥"
      case "testing": return "🔧"
      case "documentation": return "📝"
      default: return "📋"
    }
  }

  return (
    <DashboardLayout title="タスク管理">
      <>
            {/* Filters and Search */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="タスクを検索..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="月を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="not_started">着手前</SelectItem>
                  <SelectItem value="in_progress">着手中</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="on_hold">保留</SelectItem>
                  <SelectItem value="cancelled">キャンセル</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="優先度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    新規タスク追加
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>新規タスク追加</DialogTitle>
                    <DialogDescription>
                      タスク情報を入力してください
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">タイトル *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="タスクのタイトル"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">説明</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="タスクの詳細説明"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="status">ステータス</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData({...formData, status: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="ステータス" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_started">着手前</SelectItem>
                            <SelectItem value="in_progress">着手中</SelectItem>
                            <SelectItem value="completed">完了</SelectItem>
                            <SelectItem value="on_hold">保留</SelectItem>
                            <SelectItem value="cancelled">キャンセル</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="priority">優先度</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) => setFormData({...formData, priority: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="優先度" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">高</SelectItem>
                            <SelectItem value="medium">中</SelectItem>
                            <SelectItem value="low">低</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="startDate">開始日</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">期限</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="estimatedHours">予定工数(時間)</Label>
                        <Input
                          id="estimatedHours"
                          type="number"
                          step="0.5"
                          min="0"
                          value={formData.estimatedHours}
                          onChange={(e) => setFormData({...formData, estimatedHours: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="progress">進捗率(%)</Label>
                        <Input
                          id="progress"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.progress}
                          onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">カテゴリ</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({...formData, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="カテゴリを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">なし</SelectItem>
                          <SelectItem value="development">開発</SelectItem>
                          <SelectItem value="design">設計</SelectItem>
                          <SelectItem value="testing">テスト</SelectItem>
                          <SelectItem value="meeting">ミーティング</SelectItem>
                          <SelectItem value="documentation">ドキュメント</SelectItem>
                          <SelectItem value="other">その他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="assignee">担当者</Label>
                      <Input
                        id="assignee"
                        value={formData.assignee}
                        onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                        placeholder="担当者名"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tags">タグ (カンマ区切り)</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        placeholder="例: 重要, 急ぎ, バグ修正"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="customerId">関連顧客</Label>
                      <Select
                        value={formData.customerId}
                        onValueChange={(value) => setFormData({...formData, customerId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="顧客を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">なし</SelectItem>
                          {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} {customer.company && `(${customer.company})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleAddTask}>追加</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Tasks List */}
            {selectedMonth === 'all' ? (
              // Group by month
              <div className="space-y-6">
                {Object.entries(tasksByMonth)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([month, monthTasks]) => {
                    const filtered = monthTasks.filter(task => {
                      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
                      const matchesStatus = filterStatus === "all" || task.status === filterStatus
                      const matchesPriority = filterPriority === "all" || task.priority === filterPriority
                      return matchesSearch && matchesStatus && matchesPriority
                    })

                    if (filtered.length === 0) return null

                    return (
                      <div key={month}>
                        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          {month}
                          <span className="text-sm font-normal text-gray-500">
                            ({filtered.length}件)
                          </span>
                        </h2>
                        <div className="space-y-4">
                          {filtered.map((task) => (
                            <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mt-1"
                          onClick={() => handleToggleStatus(task)}
                        >
                          {getStatusIcon(task.status)}
                        </Button>
                        <div className="flex-1">
                          <h3 className={`font-semibold text-lg ${
                            task.status === "completed" ? "line-through text-gray-500" : ""
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-gray-600 mt-1">{task.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 mt-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              優先度: {getPriorityLabel(task.priority)}
                            </span>
                            {task.dueDate && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-1" />
                                期限: {format(new Date(task.dueDate), "yyyy年MM月dd日", { locale: ja })}
                              </div>
                            )}
                            {task.customer && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Users className="w-4 h-4 mr-1" />
                                {task.customer.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(task)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                          ))}
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              // Regular display for specific month
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="mt-1"
                            onClick={() => handleToggleStatus(task)}
                          >
                            {getStatusIcon(task.status)}
                          </Button>
                          <div className="flex-1">
                            <h3 className={`font-semibold text-lg ${
                              task.status === "completed" ? "line-through text-gray-500" : ""
                            }`}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-gray-600 mt-1">{task.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 mt-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {getStatusLabel(task.status)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                優先度: {getPriorityLabel(task.priority)}
                              </span>
                              {task.dueDate && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  期限: {format(new Date(task.dueDate), "yyyy年MM月dd日", { locale: ja })}
                                </div>
                              )}
                              {task.assignee && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Users className="w-4 h-4 mr-1" />
                                  {task.assignee}
                                </div>
                              )}
                              {task.category && (
                                <span className="text-sm text-gray-600">
                                  {getCategoryIcon(task.category)} {task.category}
                                </span>
                              )}
                            </div>
                            {task.progress > 0 && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-600">進捗</span>
                                  <span className="text-xs font-medium">{task.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      task.progress === 100 ? 'bg-green-600' : 
                                      task.progress >= 70 ? 'bg-blue-600' : 
                                      task.progress >= 30 ? 'bg-yellow-600' : 'bg-gray-400'
                                    }`}
                                    style={{ width: `${task.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {task.tags && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {task.tags.split(',').map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                    <Tag className="w-3 h-3 inline mr-1" />
                                    {tag.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(task)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>タスク編集</DialogTitle>
                  <DialogDescription>
                    タスク情報を更新してください
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-title">タイトル *</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">説明</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-status">ステータス</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({...formData, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_started">着手前</SelectItem>
                          <SelectItem value="in_progress">着手中</SelectItem>
                          <SelectItem value="completed">完了</SelectItem>
                          <SelectItem value="on_hold">保留</SelectItem>
                          <SelectItem value="cancelled">キャンセル</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-priority">優先度</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({...formData, priority: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">高</SelectItem>
                          <SelectItem value="medium">中</SelectItem>
                          <SelectItem value="low">低</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-startDate">開始日</Label>
                      <Input
                        id="edit-startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-dueDate">期限</Label>
                      <Input
                        id="edit-dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-estimatedHours">予定工数(時間)</Label>
                      <Input
                        id="edit-estimatedHours"
                        type="number"
                        step="0.5"
                        min="0"
                        value={formData.estimatedHours}
                        onChange={(e) => setFormData({...formData, estimatedHours: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-progress">進捗率(%)</Label>
                      <Input
                        id="edit-progress"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category">カテゴリ</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">なし</SelectItem>
                        <SelectItem value="development">開発</SelectItem>
                        <SelectItem value="design">設計</SelectItem>
                        <SelectItem value="testing">テスト</SelectItem>
                        <SelectItem value="meeting">ミーティング</SelectItem>
                        <SelectItem value="documentation">ドキュメント</SelectItem>
                        <SelectItem value="other">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-assignee">担当者</Label>
                    <Input
                      id="edit-assignee"
                      value={formData.assignee}
                      onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                      placeholder="担当者名"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-tags">タグ (カンマ区切り)</Label>
                    <Input
                      id="edit-tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="例: 重要, 急ぎ, バグ修正"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-customerId">関連顧客</Label>
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) => setFormData({...formData, customerId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">なし</SelectItem>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} {customer.company && `(${customer.company})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleEditTask}>更新</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
      </>
    </DashboardLayout>
  )
}

