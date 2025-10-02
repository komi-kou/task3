"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"
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
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Users as UsersIcon,
  TrendingUp
} from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  status: string
  notes: string
  contractDate: string | null
  contractAmount: number
  contractDetails: string
  industry: string
  employeeCount: number
  annualRevenue: number
  createdAt: string
  contacts: any[]
  tasks: any[]
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    status: "active",
    notes: "",
    contractDate: "",
    contractAmount: 0,
    contractDetails: "",
    industry: "",
    employeeCount: 0,
    annualRevenue: 0
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

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

  const handleAddCustomer = async () => {
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        fetchCustomers()
        setIsAddDialogOpen(false)
        resetForm()
        toast.success("顧客を追加しました")
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error("API Error:", errorData)
        toast.error(errorData.error || "顧客の追加に失敗しました")
      }
    } catch (error) {
      console.error("Failed to add customer:", error)
      toast.error("ネットワークエラーが発生しました")
    }
  }

  const handleEditCustomer = async () => {
    if (!selectedCustomer) return
    
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        fetchCustomers()
        setIsEditDialogOpen(false)
        resetForm()
        toast.success("顧客情報を更新しました")
      } else {
        toast.error("顧客情報の更新に失敗しました")
      }
    } catch (error) {
      console.error("Failed to edit customer:", error)
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("この顧客を削除してもよろしいですか？")) return
    
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        fetchCustomers()
        toast.success("顧客を削除しました")
      } else {
        toast.error("顧客の削除に失敗しました")
      }
    } catch (error) {
      console.error("Failed to delete customer:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      status: "active",
      notes: "",
      contractDate: "",
      contractAmount: 0,
      contractDetails: "",
      industry: "",
      employeeCount: 0,
      annualRevenue: 0
    })
    setSelectedCustomer(null)
  }

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      company: customer.company || "",
      address: customer.address || "",
      status: customer.status,
      notes: customer.notes || "",
      contractDate: customer.contractDate ? customer.contractDate.split('T')[0] : "",
      contractAmount: customer.contractAmount || 0,
      contractDetails: customer.contractDetails || "",
      industry: customer.industry || "",
      employeeCount: customer.employeeCount || 0,
      annualRevenue: customer.annualRevenue || 0
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

  // Group customers by contract month
  const customersByMonth: Record<string, Customer[]> = {}
  customers.forEach(customer => {
    const monthKey = customer.contractDate 
      ? format(new Date(customer.contractDate), 'yyyy年M月', { locale: ja })
      : '契約日未設定'
    if (!customersByMonth[monthKey]) {
      customersByMonth[monthKey] = []
    }
    customersByMonth[monthKey].push(customer)
  })

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesMonth = selectedMonth === 'all' || 
      (customer.contractDate && format(new Date(customer.contractDate), 'yyyy-MM') === selectedMonth)
    
    return matchesSearch && matchesMonth
  })

  return (
    <DashboardLayout title="顧客管理">
      <>
            {/* Filters and Add */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="顧客名、会社名、メールアドレスで検索"
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={selectedMonth}
                  onValueChange={setSelectedMonth}
                >
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
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    新規顧客追加
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>新規顧客追加</DialogTitle>
                    <DialogDescription>
                      顧客情報を入力してください
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">顧客名 *</Label>
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
                    <div className="grid gap-2">
                      <Label htmlFor="address">住所</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="東京都渋谷区..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">ステータス</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({...formData, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="ステータスを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">アクティブ</SelectItem>
                          <SelectItem value="inactive">非アクティブ</SelectItem>
                          <SelectItem value="prospect">見込み客</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="industry">業界</Label>
                        <Input
                          id="industry"
                          value={formData.industry}
                          onChange={(e) => setFormData({...formData, industry: e.target.value})}
                          placeholder="IT、製造業など"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="employeeCount">従業員数</Label>
                        <Input
                          id="employeeCount"
                          type="number"
                          value={formData.employeeCount}
                          onChange={(e) => setFormData({...formData, employeeCount: parseInt(e.target.value) || 0})}
                          placeholder="100"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="contractDate">契約日</Label>
                        <Input
                          id="contractDate"
                          type="date"
                          value={formData.contractDate}
                          onChange={(e) => setFormData({...formData, contractDate: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="contractAmount">契約金額</Label>
                        <Input
                          id="contractAmount"
                          type="number"
                          value={formData.contractAmount}
                          onChange={(e) => setFormData({...formData, contractAmount: parseFloat(e.target.value) || 0})}
                          placeholder="1000000"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contractDetails">契約内容</Label>
                      <Textarea
                        id="contractDetails"
                        value={formData.contractDetails}
                        onChange={(e) => setFormData({...formData, contractDetails: e.target.value})}
                        placeholder="契約内容の詳細を入力"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="annualRevenue">年間売上高</Label>
                      <Input
                        id="annualRevenue"
                        type="number"
                        value={formData.annualRevenue}
                        onChange={(e) => setFormData({...formData, annualRevenue: parseFloat(e.target.value) || 0})}
                        placeholder="10000000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">備考</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="顧客に関する備考を入力"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleAddCustomer}>追加</Button>
                  </DialogFooter>
                </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Customers List */}
            {selectedMonth === 'all' ? (
              // グループ化して表示
              <div className="space-y-6">
                {Object.entries(customersByMonth)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([month, monthCustomers]) => (
                    <div key={month}>
                      <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {month}
                        <span className="text-sm font-normal text-gray-500">
                          ({monthCustomers.length}件)
                        </span>
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {monthCustomers
                          .filter(customer =>
                            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((customer) => (
                <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{customer.name}</CardTitle>
                        {customer.company && (
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <Building className="w-3 h-3 mr-1" />
                            {customer.company}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(customer)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {customer.email && (
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-3 h-3 mr-2" />
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-3 h-3 mr-2" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.contractAmount > 0 && (
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-3 h-3 mr-2" />
                          契約金額: ¥{customer.contractAmount.toLocaleString()}
                        </div>
                      )}
                      {customer.contractDate && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-3 h-3 mr-2" />
                          契約日: {new Date(customer.contractDate).toLocaleDateString('ja-JP')}
                        </div>
                      )}
                      {customer.industry && (
                        <div className="flex items-center text-gray-600">
                          <TrendingUp className="w-3 h-3 mr-2" />
                          業界: {customer.industry}
                        </div>
                      )}
                      <div className="pt-2 border-t flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          customer.status === 'active' ? 'bg-green-100 text-green-800' :
                          customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {customer.status === 'active' ? 'アクティブ' :
                           customer.status === 'inactive' ? '非アクティブ' : '見込み客'}
                        </span>
                        <span className="text-xs text-gray-500">
                          タスク: {customer.tasks?.length || 0}件
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              // 通常の表示
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map((customer) => (
                  <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{customer.name}</CardTitle>
                          {customer.company && (
                            <div className="flex items-center mt-1 text-sm text-gray-600">
                              <Building className="w-3 h-3 mr-1" />
                              {customer.company}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(customer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCustomer(customer.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {customer.email && (
                          <div className="flex items-center text-gray-600">
                            <Mail className="w-3 h-3 mr-2" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-3 h-3 mr-2" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.contractAmount > 0 && (
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="w-3 h-3 mr-2" />
                            契約金額: ¥{customer.contractAmount.toLocaleString()}
                          </div>
                        )}
                        {customer.contractDate && (
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-3 h-3 mr-2" />
                            契約日: {new Date(customer.contractDate).toLocaleDateString('ja-JP')}
                          </div>
                        )}
                        {customer.industry && (
                          <div className="flex items-center text-gray-600">
                            <TrendingUp className="w-3 h-3 mr-2" />
                            業界: {customer.industry}
                          </div>
                        )}
                        <div className="pt-2 border-t flex justify-between items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            customer.status === 'active' ? 'bg-green-100 text-green-800' :
                            customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {customer.status === 'active' ? 'アクティブ' :
                             customer.status === 'inactive' ? '非アクティブ' : '見込み客'}
                          </span>
                          <span className="text-xs text-gray-500">
                            タスク: {customer.tasks?.length || 0}件
                          </span>
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
                  <DialogTitle>顧客情報編集</DialogTitle>
                  <DialogDescription>
                    顧客情報を更新してください
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">顧客名 *</Label>
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
                  <div className="grid gap-2">
                    <Label htmlFor="edit-address">住所</Label>
                    <Input
                      id="edit-address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
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
                        <SelectItem value="active">アクティブ</SelectItem>
                        <SelectItem value="inactive">非アクティブ</SelectItem>
                        <SelectItem value="prospect">見込み客</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-industry">業界</Label>
                      <Input
                        id="edit-industry"
                        value={formData.industry}
                        onChange={(e) => setFormData({...formData, industry: e.target.value})}
                        placeholder="IT、製造業など"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-employeeCount">従業員数</Label>
                      <Input
                        id="edit-employeeCount"
                        type="number"
                        value={formData.employeeCount}
                        onChange={(e) => setFormData({...formData, employeeCount: parseInt(e.target.value) || 0})}
                        placeholder="100"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-contractDate">契約日</Label>
                      <Input
                        id="edit-contractDate"
                        type="date"
                        value={formData.contractDate}
                        onChange={(e) => setFormData({...formData, contractDate: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-contractAmount">契約金額</Label>
                      <Input
                        id="edit-contractAmount"
                        type="number"
                        value={formData.contractAmount}
                        onChange={(e) => setFormData({...formData, contractAmount: parseFloat(e.target.value) || 0})}
                        placeholder="1000000"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-contractDetails">契約内容</Label>
                    <Textarea
                      id="edit-contractDetails"
                      value={formData.contractDetails}
                      onChange={(e) => setFormData({...formData, contractDetails: e.target.value})}
                      placeholder="契約内容の詳細を入力"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-annualRevenue">年間売上高</Label>
                    <Input
                      id="edit-annualRevenue"
                      type="number"
                      value={formData.annualRevenue}
                      onChange={(e) => setFormData({...formData, annualRevenue: parseFloat(e.target.value) || 0})}
                      placeholder="10000000"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-notes">備考</Label>
                    <Textarea
                      id="edit-notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="顧客に関する備考を入力"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleEditCustomer}>更新</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
      </>
    </DashboardLayout>
  )
}