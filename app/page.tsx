"use client"

import { useState, useEffect } from "react" // Import useEffect
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { User, UserCheck, Baby, Plus, Minus, Receipt, Users, DollarSign, Trash2, X } from 'lucide-react'
import MenuManager from "@/components/menu-manager"

type CustomerType = 'man' | 'woman' | 'child'

interface Customer {
  id: string
  type: CustomerType
  displayName: string
  orders: Order[]
}

interface Order {
  id: string
  item: string
  price: number
  customerId: string
  quantity: number
  measurementType: 'amount' | 'portions'
}

interface Table {
  id: number
  capacity: number
  customers: Customer[]
  isOccupied: boolean
}

interface MenuItem {
  id: string
  name: string
  price: number
  image: string
  category: string
  isCombo: boolean
  comboItems?: string[]
  measurementType: 'amount' | 'portions' // New field
}

interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

const LOCAL_STORAGE_KEY = 'restaurantTabSystemState';

export default function RestaurantTabSystem() {
  const [isSetup, setIsSetup] = useState(false)
  const [tableCount, setTableCount] = useState(8)
  const [defaultCapacity, setDefaultCapacity] = useState(4)
  const [tables, setTables] = useState<Table[]>([])
  const [customerCounters, setCustomerCounters] = useState<{[tableId: number]: {man: number, woman: number, child: number}}>({})
  const [poolOrders, setPoolOrders] = useState<{[tableId: number]: Order[]}>({})
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', name: "Burger", price: 12.99, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmdUJKrRRYyh13ihp8eX9CPYzFG4WqmkBgPA&s", category: "mains", isCombo: false, measurementType: 'amount' },
    { id: '2', name: "Pizza", price: 18.99, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKkO0pWuqtXoqZ79Qg-jLac71RIjP3QBOAOQ&s", category: "mains", isCombo: false, measurementType: 'amount' },
    { id: '3', name: "Pasta", price: 14.99, image: "https://www.foodandwine.com/thmb/r6iPQLCsuv_TrL2YCHG9A320wjE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/201304-xl-sauce-simmered-spaghetti-al-pomodoro-2000-b60bbe3cc6ad4b029fcc75844c33b9dd.jpg", category: "mains", isCombo: false, measurementType: 'portions' },
    { id: '4', name: "Salad", price: 9.99, image: "https://www.foodandwine.com/thmb/IuZPWAXBp4YaT9hn1YLHhuijT3k=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/FAW-recipes-big-italian-salad-hero-83e6ea846722478f8feb1eea33158b00.jpg", category: "mains", isCombo: false, measurementType: 'portions' },
    { id: '5', name: "Steak", price: 24.99, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5X21V7zUr8ihio6ZHmDHLhp-e3uRDV8UD_Q&s", category: "mains", isCombo: false, measurementType: 'portions' },
    { id: '6', name: "Fish", price: 19.99, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjfslaMmhCkyolcDU0AFamF7kcphBtO-rlog&s", category: "mains", isCombo: false, measurementType: 'portions' },
    { id: '7', name: "Soup", price: 7.99, image: "https://ichef.bbci.co.uk/food/ic/food_16x9_1600/recipes/goodvegetablesoup_73412_16x9.jpg", category: "appetizers", isCombo: false, measurementType: 'portions' },
    { id: '8', name: "Sandwich", price: 8.99, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnE0Ldi547OiXtrLIMjBEHr2a0yMMStcKCLg&s", category: "mains", isCombo: false, measurementType: 'amount' },
    { id: '9', name: "Coke", price: 2.99, image: "https://atlas-content-cdn.pixelsquid.com/stock-images/coca-cola-glass-with-droplets-soda-rv2Z884-600.jpg", category: "drinks", isCombo: false, measurementType: 'amount' },
    { id: '10', name: "Coffee", price: 3.99, image: "https://cdnimg.webstaurantstore.com/images/products/large/41980/2738593.jpg", category: "drinks", isCombo: false, measurementType: 'amount' },
    { id: '11', name: "Beer", price: 4.99, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSskTrbvM_MlZz3AvDNRWGuPUYn3kqVQdoiKQ&s", category: "drinks", isCombo: false, measurementType: 'amount' },
    { id: '12', name: "Wine", price: 6.99, image: "https://images.ctfassets.net/lchawurs4uh5/73DUHb8RrG25llwbQWl1fg/9d3ac4bdc5b74f7a9b3b61496d22dbf5/GettyImages-864436992.jpg?w=1400&h=934&fl=progressive&q=50&fm=jpg", category: "drinks", isCombo: false, measurementType: 'portions' }
  ])

  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [showSeatingDialog, setShowSeatingDialog] = useState(false)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showMenuManager, setShowMenuManager] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    price: 0,
    image: '',
    category: 'mains',
    measurementType: 'amount' as 'amount' | 'portions'
  })
  const [showQuantityDialog, setShowQuantityDialog] = useState(false)
  const [selectedItemForQuantity, setSelectedItemForQuantity] = useState<MenuItem | null>(null)
  const [quantityDialogCallback, setQuantityDialogCallback] = useState<((quantity: number) => void) | null>(null)

  // Load state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setIsSetup(parsedState.isSetup || false);
        setTableCount(parsedState.tableCount || 8);
        setDefaultCapacity(parsedState.defaultCapacity || 4);
        setTables(parsedState.tables || []);
        setCustomerCounters(parsedState.customerCounters || {});
        setPoolOrders(parsedState.poolOrders || {});
        setMenuItems(parsedState.menuItems || []);
      } else {
        // If no saved state, initialize tables for the first time
        initializeTables();
      }
    } catch (error) {
      console.error("Failed to load state from localStorage:", error);
      // Fallback to initial setup if loading fails
      initializeTables();
    }
  }, []);

  // Save state to localStorage whenever relevant state changes
  useEffect(() => {
    const stateToSave = {
      isSetup,
      tableCount,
      defaultCapacity,
      tables,
      customerCounters,
      poolOrders,
      menuItems,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [isSetup, tableCount, defaultCapacity, tables, customerCounters, poolOrders, menuItems]);


  const initializeTables = () => {
    const newTables: Table[] = []
    for (let i = 1; i <= tableCount; i++) {
      const existingTable = tables.find(t => t.id === i)
      newTables.push({
        id: i,
        capacity: existingTable?.capacity || defaultCapacity,
        customers: existingTable?.customers || [],
        isOccupied: existingTable?.isOccupied || false
      })
    }
    setTables(newTables)
    setIsSetup(true)
  }

  const getCustomerIcon = (type: CustomerType) => {
    switch (type) {
      case 'man': return <User className="h-6 w-6 text-blue-600" />
      case 'woman': return <UserCheck className="h-6 w-6 text-pink-600" />
      case 'child': return <Baby className="h-6 w-6 text-green-600" />
    }
  }

  const addCustomerToTable = (tableId: number, customerType: CustomerType) => {
    setTables(prev => prev.map(table => {
      if (table.id === tableId && table.customers.length < table.capacity) {
        setCustomerCounters(prevCounters => {
          const tableCounters = prevCounters[tableId] || { man: 0, woman: 0, child: 0 }
          const newCounters = { ...tableCounters }
          newCounters[customerType] += 1
          
          return {
            ...prevCounters,
            [tableId]: newCounters
          }
        })
        
        const currentCounters = customerCounters[tableId] || { man: 0, woman: 0, child: 0 }
        const nextNumber = currentCounters[customerType] + 1
        const displayName = customerType === 'child' ? `kid${nextNumber}` : `${customerType}${nextNumber}`
        
        const newCustomer: Customer = {
          id: `${tableId}-${Date.now()}-${Math.random()}`,
          type: customerType,
          displayName,
          orders: []
        }
        return {
          ...table,
          customers: [...table.customers, newCustomer],
          isOccupied: true
        }
      }
      return table
    }))
  }

  const removeCustomerFromTable = (tableId: number, customerId: string) => {
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        const customerToRemove = table.customers.find(c => c.id === customerId)
        const updatedCustomers = table.customers.filter(c => c.id !== customerId)
        
        if (customerToRemove) {
          const newCounters = { man: 0, woman: 0, child: 0 }
          const renamedCustomers = updatedCustomers.map(customer => {
            newCounters[customer.type] += 1
            const nextNumber = newCounters[customer.type]
            const displayName = customer.type === 'child' ? `kid${nextNumber}` : `${customer.type}${nextNumber}`
            
            return {
              ...customer,
              displayName
            }
          })
          
          setCustomerCounters(prevCounters => ({
            ...prevCounters,
            [tableId]: newCounters
          }))
          
          return {
            ...table,
            customers: renamedCustomers,
            isOccupied: renamedCustomers.length > 0
          }
        }
        
        return {
          ...table,
          customers: updatedCustomers,
          isOccupied: updatedCustomers.length > 0
        }
      }
      return table
    }))
  }

  const addOrderToCustomer = (tableId: number, customerId: string, itemId: string, quantity: number = 1) => {
    const menuItem = menuItems.find(item => item.id === itemId)
    if (!menuItem) return
    
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          customers: table.customers.map(customer => {
            if (customer.id === customerId) {
              const newOrder: Order = {
                id: `${Date.now()}-${Math.random()}`,
                item: menuItem.name,
                price: menuItem.price * quantity,
                customerId,
                quantity,
                measurementType: menuItem.measurementType
              }
              return {
                ...customer,
                orders: [...customer.orders, newOrder]
              }
            }
            return customer
          })
        }
      }
      return table
    }))
  }

  const updateCustomerOrderItemQuantity = (tableId: number, customerId: string, orderId: string, newQuantity: number) => {
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          customers: table.customers.map(customer => {
            if (customer.id === customerId) {
              return {
                ...customer,
                orders: customer.orders.map(order => {
                  if (order.id === orderId) {
                    const menuItem = menuItems.find(item => item.name === order.item);
                    const newPrice = menuItem ? menuItem.price * newQuantity : order.price;
                    return { ...order, quantity: newQuantity, price: newPrice };
                  }
                  return order;
                })
              };
            }
            return customer;
          })
        };
      }
      return table;
    }));
  };

  const getTableTotal = (table: Table) => {
    const customerTotal = table.customers.reduce((total, customer) => {
      return total + customer.orders.reduce((customerTotal, order) => customerTotal + order.price, 0)
    }, 0)
    
    const poolOrdersTotal = (poolOrders[table.id] || []).reduce((total, order) => total + order.price, 0)
    
    return customerTotal + poolOrdersTotal
  }

  const clearTable = (tableId: number) => {
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          customers: [],
          isOccupied: false
        }
      }
      return table
    }))
    clearPoolOrders(tableId)
  }

  const updateTableCapacity = (tableId: number, newCapacity: number) => {
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        const updatedCustomers = table.customers.slice(0, newCapacity)
        return {
          ...table,
          capacity: newCapacity,
          customers: updatedCustomers,
          isOccupied: updatedCustomers.length > 0
        }
      }
      return table
    }))
  }

  const removeOrderFromCustomer = (tableId: number, customerId: string, orderId: string) => {
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          customers: table.customers.map(customer => {
            if (customer.id === customerId) {
              return {
                ...customer,
                orders: customer.orders.filter(order => order.id !== orderId)
              }
            }
            return customer
          })
        }
      }
      return table
    }))
  }

const addOrderToPool = (tableId: number, itemId: string, quantity: number = 1) => {
  const menuItem = menuItems.find(item => item.id === itemId)
  if (!menuItem) return

  const newOrder: Order = {
    id: `pool-${Date.now()}-${Math.random()}`,
    item: menuItem.name,
    price: menuItem.price * quantity,
    customerId: 'pool',
    quantity,
    measurementType: menuItem.measurementType
  }

  setPoolOrders(prev => ({
    ...prev,
    [tableId]: [...(prev[tableId] || []), newOrder]
  }))
}

const updatePoolOrderItemQuantity = (tableId: number, orderId: string, newQuantity: number) => {
setPoolOrders(prev => ({
  ...prev,
  [tableId]: (prev[tableId] || []).map(order => {
    if (order.id === orderId) {
      const menuItem = menuItems.find(item => item.name === order.item);
      const newPrice = menuItem ? menuItem.price * newQuantity : order.price;
      return { ...order, quantity: newQuantity, price: newPrice };
    }
    return order;
  })
}));
};

const removePoolOrder = (tableId: number, orderId: string) => {
setPoolOrders(prev => ({
  ...prev,
  [tableId]: (prev[tableId] || []).filter(order => order.id !== orderId)
}))
}

const clearPoolOrders = (tableId: number) => {
setPoolOrders(prev => ({
  ...prev,
  [tableId]: []
}))
}

if (!isSetup) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">Restaurant Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tableCount">Number of Tables</Label>
            <Input
              id="tableCount"
              type="number"
              value={tableCount}
              onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
              min="1"
              max="20"
            />
          </div>
          <div>
            <Label htmlFor="capacity">Default Table Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={defaultCapacity}
              onChange={(e) => setDefaultCapacity(parseInt(e.target.value) || 1)}
              min="1"
              max="12"
            />
          </div>
          
          {tableCount > 0 && (
            <div>
              <Label className="text-base font-medium">Individual Table Capacities</Label>
              <p className="text-sm text-gray-600 mb-3">Customize capacity for each table (or leave as default)</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                {Array.from({ length: tableCount }, (_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Label htmlFor={`table-${i + 1}`} className="text-sm min-w-[60px]">
                      Table {i + 1}:
                    </Label>
                    <Input
                      id={`table-${i + 1}`}
                      type="number"
                      defaultValue={defaultCapacity}
                      min="1"
                      max="12"
                      className="w-20"
                      onChange={(e) => {
                        const capacity = parseInt(e.target.value) || defaultCapacity
                        setTables(prev => {
                          const newTables = [...prev]
                          if (i < newTables.length) {
                            newTables[i] = { 
                              id: i + 1, 
                              capacity, 
                              customers: newTables[i]?.customers || [], 
                              isOccupied: newTables[i]?.isOccupied || false 
                            }
                          } else {
                            newTables[i] = {
                              id: i + 1,
                              capacity,
                              customers: [],
                              isOccupied: false
                            }
                          }
                          return newTables
                        })
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button onClick={initializeTables} className="w-full">
            Initialize Restaurant
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

return (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <img
              src="https://cdn-icons-png.flaticon.com/512/2872/2872222.png"
              alt="Restaurant Icon"
              className="w-8 h-8"  // Adjust size as needed
          />
          <h1 className="text-2xl md:text-3xl font-bold">Restaurant Management</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog open={showMenuManager} onOpenChange={setShowMenuManager}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none h-10 md:h-12">
                <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                <span className="text-sm md:text-base">Manage Menu</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl">Menu Management</DialogTitle>
              </DialogHeader>
              <MenuManager
                menuItems={menuItems}
                setMenuItems={setMenuItems}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                newItemForm={newItemForm}
                setNewItemForm={setNewItemForm}
              />
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => setIsSetup(false)} className="flex-1 sm:flex-none h-10 md:h-12">
            <span className="text-sm md:text-base">Reconfigure</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
        {tables.filter(table => table && typeof table === 'object').map((table) => (
          <Card key={table.id} className={`cursor-pointer transition-all hover:shadow-lg ${table.isOccupied ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg md:text-xl font-bold">Table {table.id}</CardTitle>
                <Badge variant={table.isOccupied ? "default" : "secondary"} className="text-sm px-2 py-1">
                  {table.customers.length}/{table.capacity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4 min-h-[50px] items-center justify-center">
                {table.customers.map((customer) => (
                  <div key={customer.id} className="relative group">
                    <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                      {customer.type === 'man' && <User className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />}
                      {customer.type === 'woman' && <UserCheck className="h-6 w-6 md:h-8 md:w-8 text-pink-600" />}
                      {customer.type === 'child' && <Baby className="h-6 w-6 md:h-8 md:w-8 text-green-600" />}
                    </div>
                    {customer.orders.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                        {customer.orders.length}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {table.isOccupied && (
                <div className="text-sm md:text-base text-gray-600 mb-3 text-center font-medium">
                  Total: ${getTableTotal(table).toFixed(2)}
                </div>
              )}

              <div className="flex gap-1 md:gap-2">
                <Dialog open={showSeatingDialog && selectedTable?.id === table.id} onOpenChange={(open) => {
                  setShowSeatingDialog(open)
                  if (open) setSelectedTable(table)
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1 h-8 md:h-10 text-xs md:text-sm">
                      <Users className="h-3 w-3 md:h-4 md:w-4 mr-0 md:mr-1" />
                      <span className="hidden md:inline">Manage</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Manage Table {table.id}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Label htmlFor={`capacity-${table.id}`} className="text-sm font-medium">
                          Table Capacity:
                        </Label>
                        <Input
                          id={`capacity-${table.id}`}
                          type="number"
                          value={table.capacity}
                          onChange={(e) => updateTableCapacity(table.id, parseInt(e.target.value) || 1)}
                          min="1"
                          max="12"
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">seats</span>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Add Customers</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            size="default"
                            className="h-12 md:h-14 flex flex-col space-y-1"
                            onClick={() => addCustomerToTable(table.id, 'man')}
                            disabled={table.customers.length >= table.capacity}
                          >
                            <User className="h-5 w-5 md:h-6 md:w-6" />
                            <span className="text-xs md:text-sm">Man</span>
                          </Button>
                          <Button
                            size="default"
                            className="h-12 md:h-14 flex flex-col space-y-1"
                            onClick={() => addCustomerToTable(table.id, 'woman')}
                            disabled={table.customers.length >= table.capacity}
                          >
                            <UserCheck className="h-5 w-5 md:h-6 md:w-6" />
                            <span className="text-xs md:text-sm">Woman</span>
                          </Button>
                          <Button
                            size="default"
                            className="h-12 md:h-14 flex flex-col space-y-1"
                            onClick={() => addCustomerToTable(table.id, 'child')}
                            disabled={table.customers.length >= table.capacity}
                          >
                            <Baby className="h-5 w-5 md:h-6 md:w-6" />
                            <span className="text-xs md:text-sm">Child</span>
                          </Button>
                        </div>
                      </div>

                      {table.customers.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Current Customers</h4>
                          <div className="space-y-2">
                            {table.customers.map((customer) => (
                              <div key={customer.id} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  {getCustomerIcon(customer.type)}
                                  <span className="font-medium">{customer.displayName}</span>
                                  <Badge variant="outline">{customer.orders.length} orders</Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Dialog open={showOrderDialog && selectedCustomer?.id === customer.id} onOpenChange={(open) => {
                                    setShowOrderDialog(open)
                                    if (open) setSelectedCustomer(customer)
                                  }}>
                                    <DialogTrigger asChild>
                                      <Button size="sm" variant="outline">
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-[95vw] md:max-w-5xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Order for {selectedCustomer?.displayName}</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        {/* Use the latest customer data from 'tables' state */}
                                        {(() => {
                                          const currentTable = tables.find(t => t.id === selectedTable?.id);
                                          const currentCustomer = currentTable?.customers.find(c => c.id === selectedCustomer?.id);

                                          if (!currentCustomer || currentCustomer.orders.length === 0) return null;

                                          return (
                                            <div className="border rounded p-4 bg-gray-50">
                                              <h4 className="font-medium mb-3">Current Orders</h4>
                                              <div className="space-y-2">
                                                {currentCustomer.orders.map((order) => {
                                                  const menuItem = menuItems.find(item => item.name === order.item);
                                                  const step = menuItem?.measurementType === 'portions' ? 0.5 : 1;
                                                  const min = menuItem?.measurementType === 'portions' ? 0.5 : 1;

                                                  return (
                                                    <div key={order.id} className="flex justify-between items-center p-2 bg-white rounded border">
                                                      <span>
                                                        {order.measurementType === 'amount' ? `${order.quantity}x ` : `${order.quantity} portions of `}
                                                        {order.item}
                                                      </span>
                                                      <div className="flex items-center gap-2">
                                                        <span className="font-medium">${order.price.toFixed(2)}</span>
                                                        <div className="flex items-center gap-1">
                                                          <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                              if (order.quantity > min) {
                                                                updateCustomerOrderItemQuantity(table.id, selectedCustomer.id, order.id, order.quantity - step);
                                                              }
                                                            }}
                                                          >
                                                            <Minus className="h-3 w-3" />
                                                          </Button>
                                                          <span className="text-sm min-w-[40px] text-center">
                                                            {order.measurementType === 'amount' ? Math.floor(order.quantity) : order.quantity}
                                                          </span>
                                                          <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                              updateCustomerOrderItemQuantity(table.id, selectedCustomer.id, order.id, order.quantity + step);
                                                            }}
                                                          >
                                                            <Plus className="h-3 w-3" />
                                                          </Button>
                                                          <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => removeOrderFromCustomer(table.id, selectedCustomer.id, order.id)}
                                                          >
                                                            <Trash2 className="h-3 w-3" />
                                                          </Button>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          );
                                        })()}

                                        {/* Menu Items */}
                                        <div>

                                          {['appetizers', 'mains', 'drinks'].map(category => {
                                            const categoryItems = menuItems.filter(item => item.category === category)
                                            if (categoryItems.length === 0) return null

                                            return (
                                              <div key={category}>
                                                <h3 className="font-semibold text-lg capitalize mb-3">{category}</h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                                                  {categoryItems.map((item) => (
                                                    <Button
                                                      key={item.id}
                                                      variant="outline"
                                                      className="h-auto p-3 md:p-4 flex flex-col space-y-2 min-h-[120px] md:min-h-[140px] hover:bg-gray-50 transition-colors"
                                                      onClick={() => {
                                                        setSelectedItemForQuantity(item)
                                                        setQuantityDialogCallback(() => (quantity: number) => {
                                                          if (selectedCustomer) {
                                                            addOrderToCustomer(table.id, selectedCustomer.id, item.id, quantity)
                                                          }
                                                        })
                                                        setShowQuantityDialog(true)
                                                      }}
                                                    >
                                                      <img
                                                        src={item.image || "/placeholder.svg"}
                                                        alt={item.name}
                                                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-md mx-auto"
                                                      />
                                                      <span className="font-medium text-center text-sm md:text-base leading-tight">{item.name}</span>
                                                      <span className="text-sm md:text-base text-gray-600 font-semibold">${item.price.toFixed(2)}</span>
                                                      <Badge variant="outline" className="text-xs">
                                                        {item.measurementType}
                                                      </Badge>
                                                      {item.isCombo && (
                                                        <Badge variant="secondary" className="text-xs">Combo</Badge>
                                                      )}
                                                    </Button>
                                                  ))}
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>

                                        <div className="flex gap-2 pt-4 border-t">
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setShowOrderDialog(false)
                                            }}
                                            className="flex-1"
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeCustomerFromTable(table.id, customer.id)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">Pool Orders (Shared by Group)</h4>
                        <div className="space-y-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full h-10 md:h-12">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Pool Order
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] md:max-w-5xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Pool Orders (Shared by Group)</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {(poolOrders[table.id] || []).length > 0 && (
                                  <div className="border rounded p-4 bg-gray-50">
                                    <h4 className="font-medium mb-3">Current Pool Orders</h4>
                                    <div className="space-y-2">
                                      {(poolOrders[table.id] || []).map((order) => {
                                        const menuItem = menuItems.find(item => item.name === order.item);
                                        const step = menuItem?.measurementType === 'portions' ? 0.5 : 1;
                                        const min = menuItem?.measurementType === 'portions' ? 0.5 : 1;

                                        return (
                                          <div key={order.id} className="flex justify-between items-center p-2 bg-white rounded border">
                                            <span>
                                              {order.measurementType === 'amount' ? `${order.quantity}x ` : `${order.quantity} portions of `}
                                              {order.item}
                                            </span>
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium">${order.price.toFixed(2)}</span>
                                              <div className="flex items-center gap-1">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => {
                                                    if (order.quantity > min) {
                                                      updatePoolOrderItemQuantity(table.id, order.id, order.quantity - step);
                                                    }
                                                  }}
                                                >
                                                  <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="text-sm min-w-[40px] text-center">
                                                  {order.measurementType === 'amount' ? Math.floor(order.quantity) : order.quantity}
                                                </span>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => {
                                                    updatePoolOrderItemQuantity(table.id, order.id, order.quantity + step);
                                                  }}
                                                >
                                                  <Plus className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="destructive"
                                                  onClick={() => removePoolOrder(table.id, order.id)}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <h4 className="font-medium mb-3">Add Items to Pool</h4>
                                  {['appetizers', 'mains', 'drinks'].map(category => {
                                    const categoryItems = menuItems.filter(item => item.category === category)
                                    if (categoryItems.length === 0) return null

                                    return (
                                      <div key={category}>
                                        <h3 className="font-semibold text-lg capitalize mb-3">{category}</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                                          {categoryItems.map((item) => (
                                            <Button
                                              key={item.id}
                                              variant="outline"
                                              className="h-auto p-3 md:p-4 flex flex-col space-y-2 min-h-[120px] md:min-h-[140px] hover:bg-gray-50 transition-colors"
                                              onClick={() => {
                                                setSelectedItemForQuantity(item)
                                                setQuantityDialogCallback(() => (quantity: number) => {
                                                  addOrderToPool(table.id, item.id, quantity)
                                                })
                                                setShowQuantityDialog(true)
                                              }}
                                            >
                                              <img
                                                src={item.image || "/placeholder.svg"}
                                                alt={item.name}
                                                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-md mx-auto"
                                              />
                                              <span className="font-medium text-center text-sm md:text-base leading-tight">{item.name}</span>
                                              <span className="text-sm md:text-base text-gray-600 font-semibold">${item.price.toFixed(2)}</span>
                                              <Badge variant="outline" className="text-xs">
                                                {item.measurementType}
                                              </Badge>
                                              {item.isCombo && (
                                                <Badge variant="secondary" className="text-xs">Combo</Badge>
                                              )}
                                            </Button>
                                          ))}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {(poolOrders[table.id] || []).length > 0 && (
                            <div className="border rounded p-3 bg-purple-50">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-purple-800">Pool Orders</span>
                                <Badge variant="outline" className="bg-purple-100">
                                  ${(poolOrders[table.id] || []).reduce((total, order) => total + order.price, 0).toFixed(2)}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm">
                                {(poolOrders[table.id] || []).map((order) => (
                                  <div key={order.id} className="flex justify-between items-center p-2 bg-white rounded border">
                                    <span>
                                      {order.measurementType === 'amount' ? `${order.quantity}x ` : `${order.quantity} portions of `}
                                      {order.item}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">${order.price.toFixed(2)}</span>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            if (order.quantity > (order.measurementType === 'portions' ? 0.5 : 1)) {
                                              updatePoolOrderItemQuantity(table.id, order.id, order.quantity - (order.measurementType === 'portions' ? 0.5 : 1));
                                            }
                                          }}
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="text-sm min-w-[40px] text-center">
                                          {order.measurementType === 'amount' ? Math.floor(order.quantity) : order.quantity}
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            updatePoolOrderItemQuantity(table.id, order.id, order.quantity + (order.measurementType === 'portions' ? 0.5 : 1));
                                          }}
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => removePoolOrder(table.id, order.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="mt-2 w-full"
                                onClick={() => clearPoolOrders(table.id)}
                              >
                                Clear Pool Orders
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {table.isOccupied && (
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              clearTable(table.id)
                              setShowSeatingDialog(false)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Clear Table
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {table.isOccupied && (
                  <Dialog open={showBillDialog && selectedTable?.id === table.id} onOpenChange={(open) => {
                    setShowBillDialog(open)
                    if (open) setSelectedTable(table)
                  }}>
                    <DialogTrigger asChild>
                      <Button size="default" className="flex-1 h-10 md:h-12">
                        <Receipt className="h-4 w-4 md:h-5 md:w-5 mr-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Bill for Table {table.id}</DialogTitle>
                      </DialogHeader>
                      <BillSplitComponent
                        table={table}
                        poolOrders={poolOrders[table.id] || []}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    <QuantityDialog
      item={selectedItemForQuantity}
      isOpen={showQuantityDialog}
      onClose={() => {
        setShowQuantityDialog(false)
        setSelectedItemForQuantity(null)
        setQuantityDialogCallback(null)
      }}
      onConfirm={(quantity) => {
        if (quantityDialogCallback) {
          quantityDialogCallback(quantity)
        }
      }}
    />
  </div>
)
}

const QuantityDialog = ({ 
item, 
isOpen, 
onClose, 
onConfirm 
}: { 
item: MenuItem | null
isOpen: boolean
onClose: () => void
onConfirm: (quantity: number) => void
}) => {
const [quantity, setQuantity] = useState(1)
const [inputValue, setInputValue] = useState('1')

if (!item) return null

const isPortions = item.measurementType === 'portions'
const step = isPortions ? 0.5 : 1
const min = isPortions ? 0.5 : 1

const handleIncrement = () => {
  const newQuantity = quantity + step
  setQuantity(newQuantity)
  setInputValue(newQuantity.toString())
}

const handleDecrement = () => {
  const newQuantity = Math.max(min, quantity - step)
  setQuantity(newQuantity)
  setInputValue(newQuantity.toString())
}

const handleInputChange = (value: string) => {
  setInputValue(value)
  const numValue = parseFloat(value)
  if (!isNaN(numValue) && numValue >= min) {
    if (isPortions) {
      setQuantity(numValue)
    } else {
      const wholeNumber = Math.floor(numValue)
      if (wholeNumber >= 1) {
        setQuantity(wholeNumber)
      }
    }
  }
}

return (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Select Quantity</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="text-center">
          <img 
            src={item.image || "/placeholder.svg"} 
            alt={item.name}
            className="w-24 h-24 object-cover rounded-md mx-auto mb-2"
          />
          <h3 className="font-medium text-lg">{item.name}</h3>
          <p className="text-gray-600">
            ${item.price.toFixed(2)} per {item.measurementType === 'amount' ? 'item' : 'portion'}
          </p>
          <Badge variant="outline" className="mt-1">
            {item.measurementType === 'amount' ? 'Whole numbers only' : 'Decimal portions allowed'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDecrement}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="text-center min-w-[120px]">
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className="text-center text-xl font-bold h-12 w-20 mx-auto"
              type="number"
              step={step}
              min={min}
            />
            <div className="text-sm text-gray-500 mt-1">
              {item.measurementType === 'amount' 
                ? `${Math.floor(quantity)}x ${item.name}` 
                : `${quantity} portions`
              }
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleIncrement}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-lg font-semibold">
            Total: ${(item.price * quantity).toFixed(2)}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              const finalQuantity = isPortions ? quantity : Math.floor(quantity)
              onConfirm(finalQuantity)
              setQuantity(1)
              setInputValue('1')
              onClose()
            }}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Add to Order
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)
}

function BillSplitComponent({ table, poolOrders }: { 
table: Table, 
poolOrders: Order[] 
}) {
const [paymentAssignments, setPaymentAssignments] = useState<{[customerId: string]: string}>({})
const [poolPaymentAssignments, setPoolPaymentAssignments] = useState<{[orderId: string]: string[]}>({})

const customerOrdersTotal = table.customers.reduce((total, customer) => {
  return total + customer.orders.reduce((customerTotal, order) => customerTotal + order.price, 0)
}, 0)

const poolOrdersTotal = poolOrders.reduce((total, order) => total + order.price, 0)
const tableTotal = customerOrdersTotal + poolOrdersTotal

const getCustomerTotal = (customer: Customer) => {
  return customer.orders.reduce((total, order) => total + order.price, 0)
}

const adults = table.customers.filter(c => c.type !== 'child')
const kids = table.customers.filter(c => c.type === 'child')

const initializeAssignments = () => {
  const assignments: {[customerId: string]: string} = {}
  
  adults.forEach(adult => {
    assignments[adult.id] = adult.id
  })
  
  kids.forEach(kid => {
    if (!assignments[kid.id] && adults.length > 0) {
      assignments[kid.id] = adults[0].id
    }
  })
  
  return assignments
}

const initializePoolAssignments = () => {
  const assignments: {[orderId: string]: string[]} = {}
  poolOrders.forEach(order => {
    assignments[order.id] = adults.map(adult => adult.id)
  })
  return assignments
}

// Initialize assignments if empty or if customers/pool orders change
useEffect(() => {
  if (table.customers.length > 0 && Object.keys(paymentAssignments).length === 0) {
    setPaymentAssignments(initializeAssignments());
  }
}, [table.customers, paymentAssignments]);

useEffect(() => {
  if (poolOrders.length > 0 && Object.keys(poolPaymentAssignments).length === 0) {
    setPoolPaymentAssignments(initializePoolAssignments());
  }
}, [poolOrders, poolPaymentAssignments]);


const getPaymentBreakdown = () => {
  const breakdown: {[payerId: string]: {customer: Customer, total: number, paying_for: Customer[], pool_share: number}} = {}
  
  adults.forEach(adult => {
    breakdown[adult.id] = {
      customer: adult,
      total: 0,
      paying_for: [],
      pool_share: 0
    }
  })
  
  table.customers.forEach(customer => {
    const payerId = paymentAssignments[customer.id]
    if (payerId && breakdown[payerId]) {
      breakdown[payerId].paying_for.push(customer)
      breakdown[payerId].total += getCustomerTotal(customer)
    }
  })

  poolOrders.forEach(order => {
    const payingAdults = poolPaymentAssignments[order.id] || []
    if (payingAdults.length > 0) {
      const splitAmount = order.price / payingAdults.length
      payingAdults.forEach(adultId => {
        if (breakdown[adultId]) {
          breakdown[adultId].pool_share += splitAmount
          breakdown[adultId].total += splitAmount
        }
      })
    }
  })
  
  return breakdown
}

const paymentBreakdown = getPaymentBreakdown()

return (
  <div className="space-y-6">
    <div>
      <h4 className="font-medium mb-3">Order Summary</h4>
      <div className="space-y-3">
        {table.customers.map((customer) => (
          <div key={customer.id} className="border rounded p-3">
            <div className="flex items-center gap-2 mb-2">
              {customer.type === 'man' && <User className="h-5 w-5 text-blue-600" />}
              {customer.type === 'woman' && <UserCheck className="h-5 w-5 text-pink-600" />}
              {customer.type === 'child' && <Baby className="h-5 w-5 text-green-600" />}
              <span className="font-medium">{customer.displayName}</span>
              <Badge variant="outline">${getCustomerTotal(customer).toFixed(2)}</Badge>
            </div>
            <div className="text-sm space-y-1">
              {customer.orders.map((order) => (
                <div key={order.id} className="flex justify-between">
                  <span>
                    {order.measurementType === 'amount' ? `${order.quantity}x ` : `${order.quantity} portions of `}
                    {order.item}
                  </span>
                  <span>${order.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {poolOrders.length > 0 && (
          <div className="border rounded p-3 bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Pool Orders</span>
              <Badge variant="outline" className="bg-purple-100">${poolOrdersTotal.toFixed(2)}</Badge>
            </div>
            <div className="text-sm space-y-1">
              {poolOrders.map((order) => (
                <div key={order.id} className="flex justify-between">
                  <span>
                    {order.measurementType === 'amount' ? `${order.quantity}x ` : `${order.quantity} portions of `}
                    {order.item}
                  </span>
                  <span>${order.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Separator className="my-4" />
      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>${tableTotal.toFixed(2)}</span>
      </div>
    </div>

    <div>
      <h4 className="font-medium mb-3">Payment Assignments</h4>
      <p className="text-sm text-gray-600 mb-4">Assign who pays for each person (kids cannot pay for themselves)</p>
      
      <div className="space-y-3">
        {table.customers.map((customer) => (
          <div key={customer.id} className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-2">
              {customer.type === 'man' && <User className="h-5 w-5 text-blue-600" />}
              {customer.type === 'woman' && <UserCheck className="h-5 w-5 text-pink-600" />}
              {customer.type === 'child' && <Baby className="h-5 w-5 text-green-600" />}
              <span className="font-medium">{customer.displayName}</span>
              <Badge variant="outline">${getCustomerTotal(customer).toFixed(2)}</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Paid by:</span>
              <Select 
                value={paymentAssignments[customer.id] || ''} 
                onValueChange={(value) => {
                  setPaymentAssignments(prev => ({
                    ...prev,
                    [customer.id]: value
                  }))
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customer.type !== 'child' && (
                    <SelectItem value={customer.id}>Self</SelectItem>
                  )}
                  {adults.filter(adult => adult.id !== customer.id).map(adult => (
                    <SelectItem key={adult.id} value={adult.id}>
                      {adult.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>

    {poolOrders.length > 0 && (
      <div>
        <h4 className="font-medium mb-3">Pool Order Assignments</h4>
        <p className="text-sm text-gray-600 mb-4">Select who pays for each pool order (can be split among multiple people)</p>
        
        <div className="space-y-3">
          {poolOrders.map((order) => (
            <div key={order.id} className="border rounded p-3">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">
                  {order.measurementType === 'amount' ? `${order.quantity}x ` : `${order.quantity} portions of `}
                  {order.item}
                </span>
                <Badge variant="outline">${order.price.toFixed(2)}</Badge>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-gray-600">Paid by:</span>
                <div className="grid grid-cols-2 gap-2">
                  {adults.map(adult => (
                    <div key={adult.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pool-${order.id}-${adult.id}`}
                        checked={(poolPaymentAssignments[order.id] || []).includes(adult.id)}
                        onCheckedChange={(checked) => {
                          setPoolPaymentAssignments(prev => {
                            const current = prev[order.id] || []
                            if (checked) {
                              return {
                                ...prev,
                                [order.id]: [...current, adult.id]
                              }
                            } else {
                              return {
                                ...prev,
                                [order.id]: current.filter(id => id !== adult.id)
                              }
                            }
                          })
                        }}
                      />
                      <Label htmlFor={`pool-${order.id}-${adult.id}`} className="flex items-center gap-2">
                        {adult.type === 'man' && <User className="h-4 w-4 text-blue-600" />}
                        {adult.type === 'woman' && <UserCheck className="h-4 w-4 text-pink-600" />}
                        <span>{adult.displayName}</span>
                      </Label>
                    </div>
                  ))}
                </div>
                {(poolPaymentAssignments[order.id] || []).length > 0 && (
                  <p className="text-sm text-gray-600">
                    Each person pays: ${(order.price / (poolPaymentAssignments[order.id] || []).length).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="bg-gray-50 p-4 rounded">
      <h4 className="font-medium mb-3">Payment Breakdown</h4>
      <div className="space-y-3">
        {Object.values(paymentBreakdown).map((breakdown) => (
          <div key={breakdown.customer.id} className="border rounded p-3 bg-white">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                {breakdown.customer.type === 'man' && <User className="h-5 w-5 text-blue-600" />}
                {breakdown.customer.type === 'woman' && <UserCheck className="h-5 w-5 text-pink-600" />}
                <span className="font-medium">{breakdown.customer.displayName} pays:</span>
              </div>
              <span className="font-bold text-lg">${breakdown.total.toFixed(2)}</span>
            </div>
            
            <div className="text-sm space-y-1">
              {breakdown.paying_for.map(person => (
                <div key={person.id} className="flex justify-between pl-4">
                  <span>• {person.displayName}'s order</span>
                  <span>${getCustomerTotal(person).toFixed(2)}</span>
                </div>
              ))}
              {breakdown.pool_share > 0 && (
                <div className="flex justify-between pl-4 text-purple-600">
                  <span>• Share of pool orders</span>
                  <span>${breakdown.pool_share.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    <Button className="w-full h-12 text-base">
      <DollarSign className="h-5 w-5 mr-2" />
      Process Payment
    </Button>
  </div>
)
}
