"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InfoIcon, Plus, Star } from "lucide-react"

// Define interfaces for our data models
interface User {
  id: number
  name: string
  email: string
  role: "ADMIN" | "STAFF" | "CUSTOMER"
  password: string  
}

interface Product {
  id: number
  name: string
  price: string
  stock: number
  category: string
  image: string
}

interface Order {
  id: number
  customerName: string
  email: string
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED"
  total: string
  date: string
}

interface Testimonial {
  id: number
  name: string
  testimonial: string
  role:string
  rating: number
  videoUrl: string
}

interface UsersTabProps {
  isAdmin: boolean
}

function UsersTab({ isAdmin }: UsersTabProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/users')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`)
        }
        
        const data = await response.json()
        setUsers(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        console.error('Error fetching users:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const handleAddUser = (): void => {
    setCurrentUser(null)
    setActionError(null)
    setIsDialogOpen(true)
  }

  const handleEditUser = (user: User): void => {
    setCurrentUser(user)
    setActionError(null)
    setIsDialogOpen(true)
  }

  const handleDeleteUser = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`)
      }

      setUsers(users.filter((user) => user.id !== id))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete user')
      console.error('Error deleting user:', err)
    }
  }

  const handleSaveUser = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setIsSaving(true)
    setActionError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const userData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        role: formData.get("role") as "ADMIN" | "STAFF" | "CUSTOMER",
        password: formData.get("password") as string,
      }

      let response: Response
      let updatedData: User

      if (currentUser) {
        // Update existing user
        response = await fetch(`/api/users/${currentUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        })

        if (!response.ok) {
          throw new Error(`Failed to update user: ${response.status}`)
        }

        updatedData = await response.json()
        setUsers(users.map((user) => (user.id === currentUser.id ? updatedData : user)))
      } else {
        // Create new user
        response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        })

        if (!response.ok) {
          throw new Error(`Failed to create user: ${response.status}`)
        }

        updatedData = await response.json()
        setUsers([...users, updatedData])
      }

      setIsDialogOpen(false)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'An error occurred while saving user data')
      console.error('Error saving user:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="border-none bg-white shadow-md rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 pb-8">
        <div>
          <CardTitle className="text-emerald-700 text-2xl font-bold">Users Management</CardTitle>
          <CardDescription className="text-emerald-600/80">Manage system users and their roles</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:shadow-lg"
              onClick={handleAddUser}
              disabled={!isAdmin}
            >
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-emerald-700 text-xl">
                {currentUser ? "Edit User" : "Add New User"}
              </DialogTitle>
              <DialogDescription>{currentUser ? "Update user details" : "Create a new user account"}</DialogDescription>
            </DialogHeader>
            {actionError && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <InfoIcon className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-700 font-medium">Error</AlertTitle>
                <AlertDescription className="text-red-600">{actionError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSaveUser}>
              <div className="grid gap-5 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-gray-700">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={currentUser?.name || ""}
                    className="col-span-3 border-gray-300"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={currentUser?.email || ""}
                    className="col-span-3 border-gray-300"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    defaultValue={currentUser?.password || ""}
                    className="col-span-3 border-gray-300"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right text-gray-700">
                    Role
                  </Label>
                  <Select name="role" defaultValue={currentUser?.role || "CUSTOMER"}>
                    <SelectTrigger className="col-span-3 border-gray-300">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="CUSTOMER">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : currentUser ? "Update User" : "Save User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <InfoIcon className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-700 font-medium">Error</AlertTitle>
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-emerald-50">
              <TableRow>
                <TableHead className="text-emerald-700">ID</TableHead>
                <TableHead className="text-emerald-700">Name</TableHead>
                <TableHead className="text-emerald-700">Email</TableHead>
                <TableHead className="text-emerald-700">Role</TableHead>
                <TableHead className="text-right text-emerald-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">Loading users...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">No users found</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.role === "ADMIN"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : user.role === "STAFF"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                          onClick={() => handleEditUser(user)}
                          disabled={!isAdmin && user.role === "ADMIN"}
                        >
                          Edit
                        </Button>
                        <Button
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={!isAdmin}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 100
  })

  const fetchProducts = async (page = 1) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/products?page=${page}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`)
      }
      
      const responseData = await response.json()
      
      // Handle the new API response format with nested data and pagination
      if (responseData.data && Array.isArray(responseData.data)) {
        setProducts(responseData.data)
        if (responseData.pagination) {
          setPagination(responseData.pagination)
        }
      } else {
        setProducts([])
        setError('Invalid data format received from API')
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      console.error('Error fetching products:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)

  const handleAddProduct = (): void => {
    setCurrentProduct(null)
    setActionError(null)
    setIsDialogOpen(true)
  }

  const handleEditProduct = (product: Product): void => {
    setCurrentProduct(product)
    setActionError(null)
    setIsDialogOpen(true)
  }

  const handleDeleteProduct = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.status}`)
      }

      setProducts(products.filter((product) => product.id !== id))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete product')
      console.error('Error deleting product:', err)
    }
  }

  const handleChangePage = (newPage: number): void => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchProducts(newPage)
    }
  }

  const handleSaveProduct = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setIsSaving(true)
    setActionError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const stockValue = formData.get("stock") as string
      const productData = {
        id: currentProduct?.id || null,
        name: formData.get("name") as string,
        price: formData.get("price") as string,
        stock: stockValue ? Number.parseInt(stockValue, 10) : 0,
        category: formData.get("category") as string,
        image: (formData.get("image") as string) || "/placeholder.svg",
      }

      let response: Response
      let updatedData: Product

      if (currentProduct) {
        // Update existing product
        response = await fetch(`/api/products/${currentProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          throw new Error(`Failed to update product: ${response.status}`)
        }

        updatedData = await response.json()
        setProducts(products.map((product) => (product.id === currentProduct.id ? updatedData : product)))
      } else {
        // Create new product
        response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          throw new Error(`Failed to create product: ${response.status}`)
        }

        updatedData = await response.json()
        
        // Refresh the products list after adding a new product
        fetchProducts(pagination.page)
      }

      setIsDialogOpen(false)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'An error occurred while saving product data')
      console.error('Error saving product:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="border-none bg-white shadow-md rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 pb-8">
        <div>
          <CardTitle className="text-emerald-700 text-2xl font-bold">Products Management</CardTitle>
          <CardDescription className="text-emerald-600/80">Manage product inventory and categories</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:shadow-lg"
              onClick={handleAddProduct}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-emerald-700 text-xl">
                {currentProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                {currentProduct ? "Update product details" : "Enter new product information"}
              </DialogDescription>
            </DialogHeader>
            {actionError && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <InfoIcon className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-700 font-medium">Error</AlertTitle>
                <AlertDescription className="text-red-600">{actionError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSaveProduct}>
              <div className="grid gap-5 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-gray-700">
                    Product Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={currentProduct?.name || ""}
                    className="col-span-3 border-gray-300"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right text-gray-700">
                    Price
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    defaultValue={currentProduct?.price || ""}
                    className="col-span-3 border-gray-300"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right text-gray-700">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    defaultValue={currentProduct?.stock.toString() || ""}
                    className="col-span-3 border-gray-300"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right text-gray-700">
                    Category
                  </Label>
                  <Select name="category" defaultValue={currentProduct?.category || ""}>
                    <SelectTrigger className="col-span-3 border-gray-300">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Supplements">Supplements</SelectItem>
                      <SelectItem value="Tea">Tea</SelectItem>
                      <SelectItem value="Wellness">Wellness</SelectItem>
                      <SelectItem value="Herbs">Herbs</SelectItem>
                      <SelectItem value="Organic">Organic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right text-gray-700">
                    Image URL
                  </Label>
                  <Input
                    id="image"
                    name="image"
                    defaultValue={currentProduct?.image || "/placeholder.svg"}
                    className="col-span-3 border-gray-300"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : currentProduct ? "Update Product" : "Save Product"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <InfoIcon className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-700 font-medium">Error</AlertTitle>
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-6 text-gray-500">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-6 text-gray-500">No products found</div>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="overflow-hidden border border-gray-200 transition-all hover:shadow-md">
                <div className="aspect-video bg-gray-100 relative">
                  {product.image && product.image !== "/placeholder.svg" ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.parentElement!.querySelector('div')!.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Product Image
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-emerald-800">{product.name}</h3>
                      <p className="text-emerald-700 font-bold">{product.price}</p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">Stock: {product.stock} units</div>
                </CardContent>
                <div className="flex border-t border-gray-100">
                  <Button
                    className="flex-1 rounded-none text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                    onClick={() => handleEditProduct(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    className="flex-1 rounded-none text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
        
        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button 
              onClick={() => handleChangePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {pagination.page} of {pagination.pages}
              {pagination.total > 0 && ` (${pagination.total} products)`}
            </div>
            <Button 
              onClick={() => handleChangePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/orders')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`)
        }
        
        const data = await response.json()
        setOrders(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        console.error('Error fetching orders:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)

  const handleAddOrder = (): void => {
    setCurrentOrder(null)
    setActionError(null)
    setIsDialogOpen(true)
  }

  const handleEditOrder = (order: Order): void => {
    setCurrentOrder(order)
    setActionError(null)
    setIsDialogOpen(true)
  }

  const handleDeleteOrder = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete order: ${response.status}`)
      }

      setOrders(orders.filter((order) => order.id !== id))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete order')
      console.error('Error deleting order:', err)
    }
  }

  const handleSaveOrder = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSaving(true);
    setActionError(null);
    enum OrderStatus {
      PENDING = "PENDING",
      PROCESSING = "PROCESSING",
      SHIPPED = "SHIPPED",
      DELIVERED = "DELIVERED",
      CANCELLED = "CANCELLED",
      REFUNDED = "REFUNDED",
      ON_HOLD = "ON_HOLD"
    }
    try {
      const formData = new FormData(e.currentTarget);
      const userIdValue = formData.get("userId") as string;
      const orderData = {
        userId: userIdValue ? parseInt(userIdValue, 10) : undefined,
        customerName: formData.get("customerName") as string,
        email: formData.get("email") as string,
        status: formData.get("status") as OrderStatus,
        total: parseFloat(formData.get("total") as string) || 0,
      };
  
      // Validate orderData
      if (!orderData.userId || isNaN(orderData.userId)) {
        throw new Error("Invalid or missing user ID");
      }
      if (!orderData.customerName || !orderData.email || !orderData.status || isNaN(orderData.total)) {
        throw new Error("All fields (customer name, email, status, total) are required");
      }
  
      let response: Response;
      let updatedData: Order;
  
      if (currentOrder) {
        // Validate order ID
        console.log("Updating order with ID:", currentOrder.id, "userId:", orderData.userId); // Log for debugging
        if (!currentOrder.id || isNaN(currentOrder.id)) {
          throw new Error("Invalid or missing order ID");
        }
  
        // Update existing order
        response = await fetch(`/api/admin/orders/${currentOrder.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to update order: ${response.status} - ${errorData.details || errorData.error || "Unknown error"}`);
        }
  
        updatedData = await response.json();
        setOrders(orders.map((order) => (order.id === currentOrder.id ? updatedData : order)));
      } else {
        // Create new order
        console.log("Creating new order with data:", orderData); // Log for debugging
        response = await fetch("/api/admin/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...orderData,
            date: new Date().toISOString().split("T")[0],
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to create order: ${response.status} - ${errorData.details || errorData.error || "Unknown error"}`);
        }
  
        updatedData = await response.json();
        setOrders([...orders, updatedData]);
      }
  
      setIsDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while saving order data";
      setActionError(errorMessage);
      console.error("Error saving order:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-none bg-white shadow-md rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 pb-8">
        <div>
          <CardTitle className="text-emerald-700 text-2xl font-bold">Orders Management</CardTitle>
          <CardDescription className="text-emerald-600/80">View and manage customer orders</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:shadow-lg"
              onClick={handleAddOrder}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Order
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-emerald-700 text-xl">
                {currentOrder ? "Edit Order" : "Create New Order"}
              </DialogTitle>
              <DialogDescription>
                {currentOrder ? "Update order details" : "Enter new order information"}
              </DialogDescription>
            </DialogHeader>
            {actionError && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <InfoIcon className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-700 font-medium">Error</AlertTitle>
                <AlertDescription className="text-red-600">{actionError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSaveOrder}>
              <div className="grid gap-5 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="userId" className="text-right text-gray-700">
                    User ID
                  </Label>
                  <Input
                    id="userId"
                    name="userId"
                    type="number"
                    defaultValue={currentOrder?.id || "1"}
                    className="col-span-3 border-gray-300"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customerName" className="text-right text-gray-700">
                    Customer Name
                  </Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    defaultValue={currentOrder?.customerName || ""}
                    className="col-span-3 border-gray-300"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    defaultValue={currentOrder?.email || ""}
                    className="col-span-3 border-gray-300"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right text-gray-700">
                    Status
                  </Label>
                  <Select name="status" defaultValue={currentOrder?.status || "PENDING"}>
                    <SelectTrigger className="col-span-3 border-gray-300">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {Object.entries({
                        PENDING: "Pending",
                        PROCESSING: "Processing",
                        SHIPPED: "Shipped",
                        DELIVERED: "Delivered",
                        CANCELLED: "Cancelled",
                        REFUNDED: "Refunded",
                        ON_HOLD: "On Hold"
                      }).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="total" className="text-right text-gray-700">
                    Total
                  </Label>
                  <Input
                    id="total"
                    name="total"
                    defaultValue={currentOrder?.total || ""}
                    className="col-span-3 border-gray-300"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : currentOrder ? "Update Order" : "Save Order"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <InfoIcon className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-700 font-medium">Error</AlertTitle>
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-emerald-50">
              <TableRow>
                <TableHead className="text-emerald-700">ID</TableHead>
                <TableHead className="text-emerald-700">Customer</TableHead>
                <TableHead className="text-emerald-700">Email</TableHead>
                <TableHead className="text-emerald-700">Status</TableHead>
                <TableHead className="text-emerald-700">Total</TableHead>
                <TableHead className="text-emerald-700">Date</TableHead>
                <TableHead className="text-right text-emerald-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">Loading orders...</TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">No orders found</TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          order.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : order.status === "PROCESSING"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : order.status === "PENDING"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-red-50 text-red-700 border-red-200"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{order.total}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                          onClick={() => handleEditOrder(order)}
                        >
                          Edit
                        </Button>
                        <Button
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 

function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/testimonials')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch testimonials: ${response.status}`)
        }
        
        const data = await response.json()
        setTestimonials(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        console.error('Error fetching testimonials:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | null>(null)

  const handleAddTestimonial = (): void => {
    setCurrentTestimonial(null)
    setActionError(null)
    setIsDialogOpen(true)
  }

  const handleEditTestimonial = (testimonial: Testimonial): void => {
    setCurrentTestimonial(testimonial)
    setActionError(null)
    setIsDialogOpen(true)
  }

  const handleDeleteTestimonial = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete testimonial: ${response.status}`)
      }

      setTestimonials(testimonials.filter((testimonial) => testimonial.id !== id))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete testimonial')
      console.error('Error deleting testimonial:', err)
    }
  }

  const handleSaveTestimonial = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setIsSaving(true)
    setActionError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const ratingValue = formData.get("rating") as string
      const testimonialData = {
        name: formData.get("name") as string,
        testimonial: formData.get("testimonial") as string,
        role: formData.get("role") as string,
        rating: ratingValue ? Number.parseInt(ratingValue, 10) : 5,
        videoUrl: formData.get("videoUrl") as string,
      }

      let response: Response
      let updatedData: Testimonial

      if (currentTestimonial) {
        // Update existing testimonial
        response = await fetch(`/api/testimonials/${currentTestimonial.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testimonialData),
        })

        if (!response.ok) {
          throw new Error(`Failed to update testimonial: ${response.status}`)
        }

        updatedData = await response.json()
        setTestimonials(testimonials.map((testimonial) => (testimonial.id === currentTestimonial.id ? updatedData : testimonial)))
      } else {
        // Create new testimonial
        response = await fetch('/api/testimonials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testimonialData),
        })

        if (!response.ok) {
          throw new Error(`Failed to create testimonial: ${response.status}`)
        }

        updatedData = await response.json()
        setTestimonials([...testimonials, updatedData])
      }

      setIsDialogOpen(false)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'An error occurred while saving testimonial data')
      console.error('Error saving testimonial:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="border-none bg-white shadow-md rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 pb-8">
        <div>
          <CardTitle className="text-emerald-700 text-2xl font-bold">Testimonials Management</CardTitle>
          <CardDescription className="text-emerald-600/80">Manage customer testimonials and reviews</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:shadow-lg"
              onClick={handleAddTestimonial}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-emerald-700 text-xl">
                {currentTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
              </DialogTitle>
              <DialogDescription>
                {currentTestimonial ? "Update testimonial details" : "Enter new testimonial information"}
              </DialogDescription>
            </DialogHeader>
            {actionError && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <InfoIcon className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-700 font-medium">Error</AlertTitle>
                <AlertDescription className="text-red-600">{actionError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSaveTestimonial}>
              <div className="grid gap-5 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-gray-700">
                    Customer Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={currentTestimonial?.name || ""}
                    className="col-span-3 border-gray-300"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="testimonial" className="text-right text-gray-700 pt-2">
                    Testimonial
                  </Label>
                  <textarea
                    id="testimonial"
                    name="testimonial"
                    defaultValue={currentTestimonial?.testimonial || ""}
                    className="col-span-3 border-gray-300 rounded-md min-h-[100px] p-2"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right text-gray-700">
                    Role
                  </Label>
                  <Input
                    id="role"
                    name="role"
                    defaultValue={currentTestimonial?.role || ""}
                    className="col-span-3 border-gray-300"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rating" className="text-right text-gray-700">
                    Rating
                  </Label>
                  <Select name="rating" defaultValue={currentTestimonial?.rating.toString() || "5"}>
                    <SelectTrigger className="col-span-3 border-gray-300">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="1">1 Star</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="videoUrl" className="text-right text-gray-700">
                    Video URL
                  </Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    defaultValue={currentTestimonial?.videoUrl || ""}
                    className="col-span-3 border-gray-300"
                    placeholder="https://www.youtube.com/watch?v=example"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : currentTestimonial ? "Update Testimonial" : "Save Testimonial"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <InfoIcon className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-700 font-medium">Error</AlertTitle>
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-6">
          {isLoading ? (
            <div className="text-center py-6 text-gray-500">Loading testimonials...</div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-6 text-gray-500">No testimonials found</div>
          ) : (
            testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="overflow-hidden border border-gray-200 transition-all hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-emerald-800">{testimonial.name}</h3>
                        <div className="flex">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          {Array.from({ length: 5 - testimonial.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-gray-300" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                        onClick={() => handleEditTestimonial(testimonial)}
                      >
                        Edit
                      </Button>
                      <Button
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 text-gray-700">&quot;{testimonial.testimonial}&quot;</div>
                  {testimonial.videoUrl && (
                    <div className="mt-4 text-sm">
                      <span className="font-medium text-emerald-700">Video:</span>
                      <a
                        href={testimonial.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-emerald-600 hover:underline"
                      >
                        {testimonial.videoUrl}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}



export default function Dashboard() {
  const [showAdminWarning, setShowAdminWarning] = useState<boolean>(false)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)

  const handleConfirmAdmin = (): void => {
    setIsAdmin(true)
    setShowAdminWarning(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-emerald-950/30 py-12 px-6 overflow-hidden relative">
      {/* Background elements for visual interest */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-600/20 rounded-full filter blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full filter blur-3xl animate-pulse" style={{animationDuration: '12s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-5xl font-extrabold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 drop-shadow-lg animate-in slide-in-from-top duration-700">
          Executive Dashboard
        </h1>

        {showAdminWarning && !isAdmin && (
          <Alert className="mb-10 border border-emerald-800/30 bg-gray-900/80 backdrop-blur-md shadow-xl shadow-emerald-900/30 rounded-xl animate-in slide-in-from-top duration-500">
            <InfoIcon className="h-5 w-5 text-emerald-400" />
            <AlertTitle className="text-emerald-300 font-medium text-lg">Restricted Access</AlertTitle>
            <AlertDescription className="text-emerald-200/90">
              You are accessing privileged management features. Please verify your authorization.
              <Button 
                onClick={handleConfirmAdmin} 
                className="ml-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/40 transition-all duration-300 font-medium"
              >
                Authenticate Access
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-4 gap-3 h-16  bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-xl mb-12 shadow-2xl shadow-emerald-900/20  relative">
            {/* Enhanced glow effect inside tab list */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-500/10 to-emerald-600/10 opacity-80"></div>
            
            <TabsTrigger
              value="users"
              onClick={() => !isAdmin && setShowAdminWarning(true)}
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-600 data-[state=active]:to-teal-700 data-[state=active]:text-white rounded-lg py-3.5 transition-all duration-300 text-gray-300 hover:text-white font-medium relative z-10 shadow-md shadow-emerald-900/20 hover:shadow-lg data-[state=active]:shadow-lg"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-600 data-[state=active]:to-teal-700 data-[state=active]:text-white rounded-lg py-3.5 transition-all duration-300 text-gray-300 hover:text-white font-medium relative z-10 shadow-md shadow-emerald-900/20 hover:shadow-lg data-[state=active]:shadow-lg"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-600 data-[state=active]:to-teal-700 data-[state=active]:text-white rounded-lg py-3.5 transition-all duration-300 text-gray-300 hover:text-white font-medium relative z-10 shadow-md shadow-emerald-900/20 hover:shadow-lg data-[state=active]:shadow-lg"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="testimonials"
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-600 data-[state=active]:to-teal-700 data-[state=active]:text-white rounded-lg py-3.5 transition-all duration-300 text-gray-300 hover:text-white font-medium relative z-10 shadow-md shadow-emerald-900/20 hover:shadow-lg data-[state=active]:shadow-lg"
            >
              Testimonials
            </TabsTrigger>
            </TabsList>

          <div className="relative z-10">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600/20 via-teal-600/10 to-gray-800/20 rounded-2xl blur-2xl opacity-40"></div>
            <div className="relative bg-gray-950/30 backdrop-blur-sm rounded-xl p-2 border border-gray-800/50 shadow-2xl shadow-emerald-900/10">
              <TabsContent value="users" className="animate-in fade-in-50 slide-in-from-bottom-5 duration-700 delay-100">
                <UsersTab isAdmin={isAdmin} />
              </TabsContent>

              <TabsContent value="products" className="animate-in fade-in-50 slide-in-from-bottom-5 duration-700 delay-100">
                <ProductsTab />
              </TabsContent>

              <TabsContent value="orders" className="animate-in fade-in-50 slide-in-from-bottom-5 duration-700 delay-100">
                <OrdersTab />
              </TabsContent>

              <TabsContent value="testimonials" className="animate-in fade-in-50 slide-in-from-bottom-5 duration-700 delay-100">
                <TestimonialsTab />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </main>
  )
}
