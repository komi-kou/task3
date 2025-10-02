"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { format, subMonths } from "date-fns"
import { ja } from "date-fns/locale"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  Star,
  TrendingUp,
  User,
  Calendar
} from "lucide-react"

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  source: string
  status: string
  notes: string
  score: number
  createdAt: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "website",
    status: "new",
    notes: "",
    score: 0
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads")
      if (res.ok) {
        const data = await res.json()
        setLeads(data)
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error)
    }
  }

  const handleAddLead = async () => {
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        fetchLeads()
        setIsAddDialogOpen(false)
        resetForm()
        toast.success("リードを追加しました")
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error("API Error:", errorData)
        toast.error(errorData.error || "リードの追加に失敗しました")
      }
    } catch (error) {
      console.error("Failed to add lead:", error)
      toast.error("ネットワークエラーが発生しました")
    }
  }

  const handleEditLead = async () => {
    if (!selectedLead) return
    
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        fetchLeads()
        setIsEditDialogOpen(false)
        resetForm()
        toast.success("リードを更新しました")
      } else {
        toast.error("リードの更新に失敗しました")
      }
    } catch (error) {
      console.error("Failed to edit lead:", error)
    }
  }

  const handleDeleteLead = async (id: string) => {
    if (!confirm("このリードを削除してもよろしいですか？")) return
    
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        fetchLeads()
        toast.success("リードを削除しました")
      } else {
        toast.error("リードの削除に失敗しました")
      }
    } catch (error) {
      console.error("Failed to delete lead:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "website",
      status: "new",
      notes: "",
      score: 0
    })
    setSelectedLead(null)
  }

  const openEditDialog = (lead: Lead) => {
    setSelectedLead(lead)
    setFormData({
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      source: lead.source || "website",
      status: lead.status,
      notes: lead.notes || "",
      score: lead.score
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

  // Group leads by month
  const leadsByMonth: Record<string, Lead[]> = {}
  leads.forEach(lead => {
    const monthKey = format(new Date(lead.createdAt), 'yyyy年M月', { locale: ja })
    if (!leadsByMonth[monthKey]) {
      leadsByMonth[monthKey] = []
    }
    leadsByMonth[monthKey].push(lead)
  })

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus
    const matchesMonth = selectedMonth === 'all' || 
      format(new Date(lead.createdAt), 'yyyy-MM') === selectedMonth
    return matchesSearch && matchesStatus && matchesMonth
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800"
      case "contacted": return "bg-yellow-100 text-yellow-800"
      case "qualified": return "bg-green-100 text-green-800"
      case "lost": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new": return "新規"
      case "contacted": return "接触済"
      case "qualified": return "有望"
      case "lost": return "失注"
      default: return status
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-gray-600"
  }

  return (
    <DashboardLayout title="リード管理">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="リード名、会社名、メールアドレスで検索"
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
            <SelectItem value="new">新規</SelectItem>
            <SelectItem value="contacted">接触済</SelectItem>
            <SelectItem value="qualified">有望</SelectItem>
            <SelectItem value="lost">失注</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              新規リード追加
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新規リード追加</DialogTitle>
              <DialogDescription>
                リード情報を入力してください
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">リード名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="山田太郎"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="example@email.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="090-1234-5678"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">会社名</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="株式会社サンプル"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="source">獲得元</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => setFormData({...formData, source: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">ウェブサイト</SelectItem>
                      <SelectItem value="referral">紹介</SelectItem>
                      <SelectItem value="campaign">キャンペーン</SelectItem>
                      <SelectItem value="social">SNS</SelectItem>
                      <SelectItem value="other">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">ステータス</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">新規</SelectItem>
                      <SelectItem value="contacted">接触済</SelectItem>
                      <SelectItem value="qualified">有望</SelectItem>
                      <SelectItem value="lost">失注</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="score">スコア (0-100)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={(e) => setFormData({...formData, score: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">備考</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="リードに関する備考を入力"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddLead}>追加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leads List */}
      {selectedMonth === 'all' ? (
        // Group by month
        <div className="space-y-6">
          {Object.entries(leadsByMonth)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([month, monthLeads]) => {
              const filtered = monthLeads.filter(lead => {
                const matchesSearch = 
                  lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
                const matchesStatus = filterStatus === "all" || lead.status === filterStatus
                return matchesSearch && matchesStatus
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((lead) => (
                      <Card key={lead.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {lead.name}
                  </CardTitle>
                  {lead.company && (
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <Building className="w-3 h-3 mr-1" />
                      {lead.company}
                    </div>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(lead)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteLead(lead.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {lead.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-3 h-3 mr-2" />
                    {lead.email}
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-3 h-3 mr-2" />
                    {lead.phone}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(lead.status)}`}>
                    {getStatusLabel(lead.status)}
                  </span>
                  <div className={`flex items-center ${getScoreColor(lead.score)}`}>
                    <Star className="w-4 h-4 mr-1" />
                    <span className="font-semibold">{lead.score}</span>
                  </div>
                </div>
                {lead.source && (
                  <div className="flex items-center text-xs text-gray-500 pt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    獲得元: {lead.source}
                  </div>
                )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {lead.name}
                    </CardTitle>
                    {lead.company && (
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <Building className="w-3 h-3 mr-1" />
                        {lead.company}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(lead)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteLead(lead.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {lead.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-3 h-3 mr-2" />
                      {lead.email}
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-3 h-3 mr-2" />
                      {lead.phone}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(lead.status)}`}>
                      {getStatusLabel(lead.status)}
                    </span>
                    <div className={`flex items-center ${getScoreColor(lead.score)}`}>
                      <Star className="w-4 h-4 mr-1" />
                      <span className="font-semibold">{lead.score}</span>
                    </div>
                  </div>
                  {lead.source && (
                    <div className="flex items-center text-xs text-gray-500 pt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      獲得元: {lead.source}
                    </div>
                  )}
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
            <DialogTitle>リード情報編集</DialogTitle>
            <DialogDescription>
              リード情報を更新してください
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">リード名 *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">メールアドレス</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">電話番号</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-company">会社名</Label>
              <Input
                id="edit-company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-source">獲得元</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({...formData, source: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">ウェブサイト</SelectItem>
                    <SelectItem value="referral">紹介</SelectItem>
                    <SelectItem value="campaign">キャンペーン</SelectItem>
                    <SelectItem value="social">SNS</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                    <SelectItem value="new">新規</SelectItem>
                    <SelectItem value="contacted">接触済</SelectItem>
                    <SelectItem value="qualified">有望</SelectItem>
                    <SelectItem value="lost">失注</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-score">スコア (0-100)</Label>
              <Input
                id="edit-score"
                type="number"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => setFormData({...formData, score: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">備考</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditLead}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}