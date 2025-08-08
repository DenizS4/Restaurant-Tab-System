"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  price: number
  image: string
  category: string
  isCombo: boolean
  comboItems?: string[]
  measurementType: 'amount' | 'portions'
}

interface MenuManagerProps {
  menuItems: MenuItem[]
  setMenuItems: (items: MenuItem[]) => void
  editingItem: MenuItem | null
  setEditingItem: (item: MenuItem | null) => void
  newItemForm: {
    name: string
    price: number
    image: string
    category: string
    measurementType: 'amount' | 'portions'
  }
  setNewItemForm: (form: any) => void
}

export default function MenuManager({ 
  menuItems, 
  setMenuItems, 
  editingItem, 
  setEditingItem,
  newItemForm,
  setNewItemForm
}: MenuManagerProps) {
  const [showAddItem, setShowAddItem] = useState(false)
  const [showAddCombo, setShowAddCombo] = useState(false)
  const [comboForm, setComboForm] = useState({
    name: '',
    price: 0,
    image: '',
    selectedItems: [] as string[]
  })

  const categories = ['appetizers', 'mains', 'drinks', 'desserts']

  const addMenuItem = () => {
    if (!newItemForm.name || newItemForm.price <= 0) return

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: newItemForm.name,
      price: newItemForm.price,
      image: newItemForm.image || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(newItemForm.name)}`,
      category: newItemForm.category,
      isCombo: false,
      measurementType: newItemForm.measurementType
    }

    setMenuItems([...menuItems, newItem])
    setNewItemForm({ name: '', price: 0, image: '', category: 'mains', measurementType: 'amount' })
    setShowAddItem(false)
  }

  const addComboMenu = () => {
    if (!comboForm.name || comboForm.price <= 0 || comboForm.selectedItems.length < 2) return

    // Determine combo measurement type based on selected items
    const selectedMenuItems = comboForm.selectedItems.map(id => menuItems.find(item => item.id === id)).filter(Boolean)
    const measurementTypes = selectedMenuItems.map(item => item.measurementType)
    
    // If all items are the same type, use that type. Otherwise default to 'amount'
    const allSameType = measurementTypes.every(type => type === measurementTypes[0])
    const comboMeasurementType = allSameType ? measurementTypes[0] : 'amount'

    const newCombo: MenuItem = {
      id: Date.now().toString(),
      name: comboForm.name,
      price: comboForm.price,
      image: comboForm.image || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(comboForm.name)}`,
      category: 'mains',
      isCombo: true,
      comboItems: comboForm.selectedItems,
      measurementType: comboMeasurementType
    }

    setMenuItems([...menuItems, newCombo])
    setComboForm({ name: '', price: 0, image: '', selectedItems: [] })
    setShowAddCombo(false)
  }

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems(menuItems.map(menuItem => 
      menuItem.id === item.id ? item : menuItem
    ))
    setEditingItem(null)
  }

  const deleteMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id))
  }

  const getComboItemsTotal = () => {
    return comboForm.selectedItems.reduce((total, itemId) => {
      const item = menuItems.find(i => i.id === itemId)
      return total + (item?.price || 0)
    }, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm({...newItemForm, name: e.target.value})}
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <Label htmlFor="itemPrice">Price ($)</Label>
                <Input
                  id="itemPrice"
                  type="number"
                  step="0.01"
                  value={newItemForm.price}
                  onChange={(e) => setNewItemForm({...newItemForm, price: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="itemImage">Image URL</Label>
                <Input
                  id="itemImage"
                  value={newItemForm.image}
                  onChange={(e) => setNewItemForm({...newItemForm, image: e.target.value})}
                  placeholder="https://example.com/image.jpg (optional)"
                />
              </div>
              <div>
                <Label htmlFor="itemCategory">Category</Label>
                <Select value={newItemForm.category} onValueChange={(value) => setNewItemForm({...newItemForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="measurementType">Measurement Type</Label>
                <Select value={newItemForm.measurementType} onValueChange={(value: 'amount' | 'portions') => setNewItemForm({...newItemForm, measurementType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">Amount (3x Burger)</SelectItem>
                    <SelectItem value="portions">Portions (2 portions of Steak)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={addMenuItem} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
                <Button variant="outline" onClick={() => setShowAddItem(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddCombo} onOpenChange={setShowAddCombo}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Combo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Combo Menu</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="comboName">Combo Name</Label>
                <Input
                  id="comboName"
                  value={comboForm.name}
                  onChange={(e) => setComboForm({...comboForm, name: e.target.value})}
                  placeholder="e.g., Burger Combo, Family Meal"
                />
              </div>
              <div>
                <Label htmlFor="comboPrice">Combo Price ($)</Label>
                <Input
                  id="comboPrice"
                  type="number"
                  step="0.01"
                  value={comboForm.price}
                  onChange={(e) => setComboForm({...comboForm, price: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Individual items total: ${getComboItemsTotal().toFixed(2)}
                  {getComboItemsTotal() > 0 && comboForm.price > 0 && (
                    <span className="ml-2 text-green-600">
                      (Save ${(getComboItemsTotal() - comboForm.price).toFixed(2)})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <Label>Measurement Type (Auto-determined)</Label>
                <div className="p-2 bg-gray-100 rounded text-sm">
                  {(() => {
                    const selectedMenuItems = comboForm.selectedItems.map(id => menuItems.find(item => item.id === id)).filter(Boolean)
                    const measurementTypes = selectedMenuItems.map(item => item.measurementType)
                    const allSameType = measurementTypes.every(type => type === measurementTypes[0])
                    const comboMeasurementType = allSameType && measurementTypes.length > 0 ? measurementTypes[0] : 'amount'
                    
                    return (
                      <span className="capitalize">
                        {comboMeasurementType} 
                        {selectedMenuItems.length > 0 && (
                          <span className="text-gray-600 ml-2">
                            (Based on selected items: {measurementTypes.join(', ')})
                          </span>
                        )}
                      </span>
                    )
                  })()}
                </div>
              </div>
              <div>
                <Label htmlFor="comboImage">Combo Image URL</Label>
                <Input
                  id="comboImage"
                  value={comboForm.image}
                  onChange={(e) => setComboForm({...comboForm, image: e.target.value})}
                  placeholder="https://example.com/combo-image.jpg (optional)"
                />
              </div>
              <div>
                <Label>Select Items for Combo (minimum 2)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto mt-2">
                  {menuItems.filter(item => !item.isCombo).map(item => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`combo-${item.id}`}
                        checked={comboForm.selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setComboForm({
                              ...comboForm,
                              selectedItems: [...comboForm.selectedItems, item.id]
                            })
                          } else {
                            setComboForm({
                              ...comboForm,
                              selectedItems: comboForm.selectedItems.filter(id => id !== item.id)
                            })
                          }
                        }}
                      />
                      <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-medium truncate">{item.name}</p>
                        <p className="text-xs md:text-sm text-gray-500">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={addComboMenu} 
                  className="flex-1"
                  disabled={comboForm.selectedItems.length < 2 || !comboForm.name || comboForm.price <= 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Combo
                </Button>
                <Button variant="outline" onClick={() => setShowAddCombo(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto gap-1">
          <TabsTrigger value="all" className="text-xs md:text-sm py-2 md:py-3 px-2 md:px-4">
            All Items
          </TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="text-xs md:text-sm py-2 md:py-3 px-2 md:px-4 capitalize">
              {category}
            </TabsTrigger>
          ))}
          <TabsTrigger value="combos" className="text-xs md:text-sm py-2 md:py-3 px-2 md:px-4">
            Combos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {menuItems.map(item => (
              <MenuItemCard 
                key={item.id} 
                item={item} 
                menuItems={menuItems}
                onEdit={setEditingItem}
                onDelete={deleteMenuItem}
                onUpdate={updateMenuItem}
                editingItem={editingItem}
              />
            ))}
          </div>
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {menuItems.filter(item => item.category === category && !item.isCombo).map(item => (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  menuItems={menuItems}
                  onEdit={setEditingItem}
                  onDelete={deleteMenuItem}
                  onUpdate={updateMenuItem}
                  editingItem={editingItem}
                />
              ))}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="combos" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {menuItems.filter(item => item.isCombo).map(item => (
              <MenuItemCard 
                key={item.id} 
                item={item} 
                menuItems={menuItems}
                onEdit={setEditingItem}
                onDelete={deleteMenuItem}
                onUpdate={updateMenuItem}
                editingItem={editingItem}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MenuItemCard({ 
  item, 
  menuItems, 
  onEdit, 
  onDelete, 
  onUpdate, 
  editingItem 
}: {
  item: MenuItem
  menuItems: MenuItem[]
  onEdit: (item: MenuItem) => void
  onDelete: (id: string) => void
  onUpdate: (item: MenuItem) => void
  editingItem: MenuItem | null
}) {
  const [editForm, setEditForm] = useState(item)

  const isEditing = editingItem?.id === item.id

  const handleSave = () => {
    onUpdate(editForm)
  }

  const getComboItemNames = () => {
    if (!item.comboItems) return []
    return item.comboItems.map(itemId => {
      const comboItem = menuItems.find(mi => mi.id === itemId)
      return comboItem?.name || 'Unknown Item'
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="font-semibold"
              />
            ) : (
              <CardTitle className="text-base md:text-lg leading-tight">{item.name}</CardTitle>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0">
                  <Save className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onEdit(null)} className="h-8 w-8 p-0">
                  <X className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => onEdit(item)} className="h-8 w-8 p-0">
                  <Edit className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)} className="h-8 w-8 p-0">
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <img 
            src={isEditing ? editForm.image : item.image} 
            alt={item.name}
            className="w-full h-44 md:h-44 lg:h-48 object-cover rounded-lg"
          />
          
          {isEditing && (
            <Input
              value={editForm.image}
              onChange={(e) => setEditForm({...editForm, image: e.target.value})}
              placeholder="Image URL"
              className="text-sm"
            />
          )}

          <div className="flex justify-between items-center">
            {isEditing ? (
              <Input
                type="number"
                step="0.01"
                value={editForm.price}
                onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})}
                className="w-28 md:w-32"
              />
            ) : (
              <span className="text-lg md:text-xl font-bold">${item.price.toFixed(2)}</span>
            )}
            
            <div className="flex gap-1 flex-wrap">
              <Badge variant="outline" className="capitalize text-xs md:text-sm">
                {item.category}
              </Badge>
              <Badge variant="outline" className="capitalize text-xs md:text-sm">
                {item.measurementType}
              </Badge>
              {item.isCombo && (
                <Badge variant="secondary" className="text-xs md:text-sm">Combo</Badge>
              )}
            </div>
          </div>

          {item.isCombo && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <p className="font-medium mb-1">Includes:</p>
              <ul className="list-disc list-inside text-xs md:text-sm">
                {getComboItemNames().map((name, index) => (
                  <li key={index}>{name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
