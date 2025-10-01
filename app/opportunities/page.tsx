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
  DollarSign,
  Calendar,
  TrendingUp,
  Building,
  AlertCircle
} from "lucide-react"

interface Opportunity {
  id: string
  name: string
  amount: number
  stage: string
  probability: number
  closeDate: string | null
  description: string
  customer?: {
    id: string
    name: string
    company: string
  }
  createdAt: string
}

interface Customer {
  id: string
  name: string
  company: string
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [filterStage, setFilterStage] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    amount: 0,
    stage: "qualification",
    probability: 0,
    closeDate: "",
    description: "",
    customerId: "none"
  })

  useEffect(() => {
    fetchOpportunities()
    fetchCustomers()
  }, [])

  const fetchOpportunities = async () => {
    try {
      const res = await fetch("/api/opportunities")
      if (res.ok) {
        const data = await res.json()
        setOpportunities(data)
      }
    } catch (error) {
      console.error("Failed to fetch opportunities:", error)
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

  const handleAddOpportunity = async () => {
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        fetchOpportunities()
        setIsAddDialogOpen(false)
        resetForm()
        toast.success("商談を追加しました")
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error("API Error:", errorData)
        toast.error(errorData.error || "商談の追加に失敗しました")
      }
    } catch (error) {
      console.error("Failed to add opportunity:", error)
      toast.error("ネットワークエラーが発生しました")
    }
  }

  const handleEditOpportunity = async () => {
    if (!selectedOpportunity) return
    
    try {
      const res = await fetch(`/api/opportunities/${selectedOpportunity.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        fetchOpportunities()
        setIsEditDialogOpen(false)
        resetForm()
        toast.success("商談を更新しました")
      } else {
        toast.error("商談の更新に失敗しました")
      }
    } catch (error) {
      console.error("Failed to edit opportunity:", error)
    }
  }

  const handleDeleteOpportunity = async (id: string) => {
    if (!confirm("この商談を削除してもよろしいですか？")) return
    
    try {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        fetchOpportunities()
        toast.success("商談を削除しました")
      } else {
        toast.error("商談の削除に失敗しました")
      }
    } catch (error) {
      console.error("Failed to delete opportunity:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      amount: 0,
      stage: "qualification",
      probability: 0,
      closeDate: "",
      description: "",
      customerId: "none"
    })
    setSelectedOpportunity(null)
  }

  const openEditDialog = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity)
    setFormData({
      name: opportunity.name,
      amount: opportunity.amount || 0,
      stage: opportunity.stage,
      probability: opportunity.probability,
      closeDate: opportunity.closeDate ? opportunity.closeDate.split('T')[0] : "",
      description: opportunity.description || "",
      customerId: opportunity.customer?.id || "none"
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

  // Group opportunities by month
  const opportunitiesByMonth: Record<string, Opportunity[]> = {}
  opportunities.forEach(opportunity => {
    const monthKey = opportunity.closeDate 
      ? format(new Date(opportunity.closeDate), 'yyyy年M月', { locale: ja })
      : format(new Date(opportunity.createdAt), 'yyyy年M月', { locale: ja })
    if (!opportunitiesByMonth[monthKey]) {
      opportunitiesByMonth[monthKey] = []
    }
    opportunitiesByMonth[monthKey].push(opportunity)
  })

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = 
      opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStage = filterStage === "all" || opp.stage === filterStage
    const matchesMonth = selectedMonth === 'all' || 
      (opp.closeDate ? format(new Date(opp.closeDate), 'yyyy-MM') === selectedMonth : 
       format(new Date(opp.createdAt), 'yyyy-MM') === selectedMonth)
    return matchesSearch && matchesStage && matchesMonth
  })

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "qualification": return "bg-blue-100 text-blue-800"
      case "proposal": return "bg-yellow-100 text-yellow-800"
      case "negotiation": return "bg-orange-100 text-orange-800"
      case "closed": return "bg-green-100 text-green-800"
      case "lost": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case "qualification": return "検討"
      case "proposal": return "提案"
      case "negotiation": return "交渉"
      case "closed": return "成約"
      case "lost": return "失注"
      default: return stage
    }
  }

  const updateProbabilityByStage = (stage: string) => {
    const probabilities: { [key: string]: number } = {
      "qualification": 20,
      "proposal": 40,
      "negotiation": 60,
      "closed": 100,
      "lost": 0
    }
    setFormData({...formData, stage, probability: probabilities[stage] || 0})
  }

  return (
    <DashboardLayout title="商談管理">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="商談名、顧客名で検索"
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
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="ステージ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="qualification">検討</SelectItem>
            <SelectItem value="proposal">提案</SelectItem>
            <SelectItem value="negotiation">交渉</SelectItem>
            <SelectItem value="closed">成約</SelectItem>
            <SelectItem value="lost">失注</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              新規商談追加
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新規商談追加</DialogTitle>
              <DialogDescription>
                商談情報を入力してください
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">商談名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="〇〇システム導入案件"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerId">顧客</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">金額</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                    placeholder="1000000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="closeDate">成約予定日</Label>
                  <Input
                    id="closeDate"
                    type="date"
                    value={formData.closeDate}
                    onChange={(e) => setFormData({...formData, closeDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stage">ステージ</Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(value) => updateProbabilityByStage(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualification">検討</SelectItem>
                      <SelectItem value="proposal">提案</SelectItem>
                      <SelectItem value="negotiation">交渉</SelectItem>
                      <SelectItem value="closed">成約</SelectItem>
                      <SelectItem value="lost">失注</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="probability">確度 (%)</Label>
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({...formData, probability: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="商談の詳細説明"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddOpportunity}>追加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Opportunities List */}
      {selectedMonth === 'all' ? (
        // Group by month
        <div className="space-y-6">
          {Object.entries(opportunitiesByMonth)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([month, monthOpportunities]) => {
              const filtered = monthOpportunities.filter(opp => {
                const matchesSearch = 
                  opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  opp.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
                const matchesStage = filterStage === "all" || opp.stage === filterStage
                return matchesSearch && matchesStage
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map((opportunity) => (
                      <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{opportunity.name}</CardTitle>
                  {opportunity.customer && (
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <Building className="w-3 h-3 mr-1" />
                      {opportunity.customer.name}
                    </div>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(opportunity)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteOpportunity(opportunity.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-2xl font-bold">
                    <DollarSign className="w-5 h-5 mr-1 text-gray-500" />
                    ¥{opportunity.amount.toLocaleString()}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(opportunity.stage)}`}>
                    {getStageLabel(opportunity.stage)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    確度: {opportunity.probability}%
                  </div>
                  {opportunity.closeDate && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(opportunity.closeDate), 'MM/dd', { locale: ja })}
                    </div>
                  )}
                </div>

                {opportunity.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {opportunity.description}
                  </p>
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>期待値: ¥{((opportunity.amount * opportunity.probability) / 100).toLocaleString()}</span>
                    <span>作成: {format(new Date(opportunity.createdAt), 'yyyy/MM/dd')}</span>
                  </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{opportunity.name}</CardTitle>
                    {opportunity.customer && (
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <Building className="w-3 h-3 mr-1" />
                        {opportunity.customer.name}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(opportunity)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteOpportunity(opportunity.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-2xl font-bold">
                      <DollarSign className="w-5 h-5 mr-1 text-gray-500" />
                      ¥{opportunity.amount.toLocaleString()}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(opportunity.stage)}`}>
                      {getStageLabel(opportunity.stage)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      確度: {opportunity.probability}%
                    </div>
                    {opportunity.closeDate && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(opportunity.closeDate), 'MM/dd', { locale: ja })}
                      </div>
                    )}
                  </div>

                  {opportunity.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {opportunity.description}
                    </p>
                  )}

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>期待値: ¥{((opportunity.amount * opportunity.probability) / 100).toLocaleString()}</span>
                      <span>作成: {format(new Date(opportunity.createdAt), 'yyyy/MM/dd')}</span>
                    </div>
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
            <DialogTitle>商談情報編集</DialogTitle>
            <DialogDescription>
              商談情報を更新してください
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">商談名 *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-customerId">顧客</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-amount">金額</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-closeDate">成約予定日</Label>
                <Input
                  id="edit-closeDate"
                  type="date"
                  value={formData.closeDate}
                  onChange={(e) => setFormData({...formData, closeDate: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-stage">ステージ</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => updateProbabilityByStage(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qualification">検討</SelectItem>
                    <SelectItem value="proposal">提案</SelectItem>
                    <SelectItem value="negotiation">交渉</SelectItem>
                    <SelectItem value="closed">成約</SelectItem>
                    <SelectItem value="lost">失注</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-probability">確度 (%)</Label>
                <Input
                  id="edit-probability"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({...formData, probability: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">説明</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditOpportunity}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}