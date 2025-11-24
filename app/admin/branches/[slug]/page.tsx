'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from 'lucide-react'
import type { Branch, Contact, DeliverySchedule } from '@/lib/data'

const EMPTY_BRANCH: Branch = {
  id: '',
  slug: '',
  name: '',
  school: '',
  location: '',
  manager: '',
  contacts: [],
  operatingHours: '',
  deliverySchedule: [],
  kpis: {
    salesTarget: '',
    wastePct: '',
    hygieneScore: ''
  },
  roles: ['manager', 'supervisor', 'kitchen', 'counter', 'cleaner'],
  media: {
    photos: [],
    videos: []
  }
}

const AVAILABLE_ROLES = ['manager', 'supervisor', 'kitchen', 'counter', 'cleaner']

export default function BranchEditorPage({ params }: { params: { slug: string } }) {
  const isNew = params.slug === 'new'
  const router = useRouter()
  const [branch, setBranch] = useState<Branch>(EMPTY_BRANCH)
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    if (!isNew) {
      fetchBranch()
    }
  }, [params.slug])

  const fetchBranch = async () => {
    try {
      const res = await fetch('/api/branches')
      const data = await res.json()
      const found = data.find((b: Branch) => b.slug === params.slug)
      if (found) {
        setBranch(found)
      } else {
        alert('Branch not found')
        router.push('/admin/branches')
      }
    } catch (error) {
      console.error('Failed to fetch branch', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveBranch = async () => {
    // Validation
    if (!branch.name || !branch.slug || !branch.location || !branch.manager) {
      alert('Please fill in all required fields: Name, Slug, Location, Manager')
      return
    }

    setIsSaving(true)
    try {
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew ? '/api/branches' : `/api/branches/${params.slug}`
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branch)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }

      router.push('/admin/branches')
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (field: keyof Branch, value: any) => {
    setBranch(prev => ({ ...prev, [field]: value }))
  }

  const updateKPI = (field: keyof typeof branch.kpis, value: string) => {
    setBranch(prev => ({
      ...prev,
      kpis: { ...prev.kpis, [field]: value }
    }))
  }

  const generateSlug = () => {
    if (branch.name) {
      const slug = branch.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      updateField('slug', slug)
    }
  }

  // Contact management
  const addContact = () => {
    setBranch(prev => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', role: '', phone: '', email: '' }]
    }))
  }

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const newContacts = [...branch.contacts]
    newContacts[index] = { ...newContacts[index], [field]: value }
    setBranch(prev => ({ ...prev, contacts: newContacts }))
  }

  const removeContact = (index: number) => {
    setBranch(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }))
  }

  // Delivery schedule management
  const addDeliverySchedule = () => {
    setBranch(prev => ({
      ...prev,
      deliverySchedule: [...prev.deliverySchedule, { day: '', time: '', items: '' }]
    }))
  }

  const updateDeliverySchedule = (index: number, field: keyof DeliverySchedule, value: string) => {
    const newSchedule = [...branch.deliverySchedule]
    newSchedule[index] = { ...newSchedule[index], [field]: value }
    setBranch(prev => ({ ...prev, deliverySchedule: newSchedule }))
  }

  const removeDeliverySchedule = (index: number) => {
    setBranch(prev => ({
      ...prev,
      deliverySchedule: prev.deliverySchedule.filter((_, i) => i !== index)
    }))
  }

  // Role management
  const toggleRole = (role: string) => {
    setBranch(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }))
  }

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{isNew ? 'Create Branch' : `Edit: ${branch.name}`}</h1>
        </div>
        <Button onClick={saveBranch} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Branch
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full gap-1">
          <TabsTrigger value="basic" className="flex-1">Basic Info</TabsTrigger>
          <TabsTrigger value="contacts" className="flex-1">Contacts</TabsTrigger>
          <TabsTrigger value="delivery" className="flex-1">Delivery</TabsTrigger>
          <TabsTrigger value="kpis" className="flex-1">KPIs</TabsTrigger>
          <TabsTrigger value="roles" className="flex-1">Roles</TabsTrigger>
          <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Branch Name *</Label>
                  <Input 
                    value={branch.name} 
                    onChange={e => updateField('name', e.target.value)} 
                    placeholder="e.g. ISC Soufouh"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={branch.slug} 
                      onChange={e => updateField('slug', e.target.value)} 
                      placeholder="e.g. isc-soufouh"
                      disabled={!isNew}
                    />
                    {isNew && (
                      <Button type="button" variant="outline" onClick={generateSlug}>
                        Generate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>School Name</Label>
                <Input 
                  value={branch.school} 
                  onChange={e => updateField('school', e.target.value)} 
                  placeholder="e.g. International School of Choueifat - Soufouh"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input 
                    value={branch.location} 
                    onChange={e => updateField('location', e.target.value)} 
                    placeholder="e.g. Dubai"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Manager *</Label>
                  <Input 
                    value={branch.manager} 
                    onChange={e => updateField('manager', e.target.value)} 
                    placeholder="e.g. Ahmed Al-Rashid"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Operating Hours</Label>
                <Input 
                  value={branch.operatingHours} 
                  onChange={e => updateField('operatingHours', e.target.value)} 
                  placeholder="e.g. Sunday - Thursday: 7:00 AM - 3:00 PM"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Contacts</CardTitle>
              <Button size="sm" onClick={addContact}>
                <Plus className="h-4 w-4 mr-2" />Add Contact
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {branch.contacts.map((contact, idx) => (
                <div key={idx} className="border p-4 rounded-md space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">Contact {idx + 1}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-500"
                      onClick={() => removeContact(idx)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      placeholder="Name" 
                      value={contact.name}
                      onChange={e => updateContact(idx, 'name', e.target.value)}
                    />
                    <Input 
                      placeholder="Role" 
                      value={contact.role}
                      onChange={e => updateContact(idx, 'role', e.target.value)}
                    />
                    <Input 
                      placeholder="Phone" 
                      value={contact.phone}
                      onChange={e => updateContact(idx, 'phone', e.target.value)}
                    />
                    <Input 
                      placeholder="Email" 
                      value={contact.email}
                      onChange={e => updateContact(idx, 'email', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              {branch.contacts.length === 0 && (
                <div className="text-center text-muted-foreground py-4">No contacts added</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Schedule Tab */}
        <TabsContent value="delivery" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Delivery Schedule</CardTitle>
              <Button size="sm" onClick={addDeliverySchedule}>
                <Plus className="h-4 w-4 mr-2" />Add Schedule
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {branch.deliverySchedule.map((schedule, idx) => (
                <div key={idx} className="border p-4 rounded-md space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">Schedule {idx + 1}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-500"
                      onClick={() => removeDeliverySchedule(idx)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Input 
                      placeholder="Day (e.g. Sunday)" 
                      value={schedule.day}
                      onChange={e => updateDeliverySchedule(idx, 'day', e.target.value)}
                    />
                    <Input 
                      placeholder="Time (e.g. 6:30 AM)" 
                      value={schedule.time}
                      onChange={e => updateDeliverySchedule(idx, 'time', e.target.value)}
                    />
                    <Input 
                      placeholder="Items" 
                      value={schedule.items}
                      onChange={e => updateDeliverySchedule(idx, 'items', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              {branch.deliverySchedule.length === 0 && (
                <div className="text-center text-muted-foreground py-4">No delivery schedules added</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPIs Tab */}
        <TabsContent value="kpis" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Key Performance Indicators</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Sales Target</Label>
                <Input 
                  value={branch.kpis.salesTarget}
                  onChange={e => updateKPI('salesTarget', e.target.value)}
                  placeholder="e.g. AED 45,000/week"
                />
              </div>
              <div className="space-y-2">
                <Label>Waste Percentage</Label>
                <Input 
                  value={branch.kpis.wastePct}
                  onChange={e => updateKPI('wastePct', e.target.value)}
                  placeholder="e.g. 2.5%"
                />
              </div>
              <div className="space-y-2">
                <Label>Hygiene Score</Label>
                <Input 
                  value={branch.kpis.hygieneScore}
                  onChange={e => updateKPI('hygieneScore', e.target.value)}
                  placeholder="e.g. 95"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Available Roles</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Select which roles are available at this branch
                </p>
                {AVAILABLE_ROLES.map(role => (
                  <div key={role} className="flex items-center gap-3">
                    <Checkbox 
                      id={`role-${role}`}
                      checked={branch.roles.includes(role)}
                      onCheckedChange={() => toggleRole(role)}
                    />
                    <label 
                      htmlFor={`role-${role}`} 
                      className="text-sm font-medium cursor-pointer capitalize"
                    >
                      {role}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Media</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Photo URLs (one per line)</Label>
                <Textarea 
                  className="min-h-[150px]"
                  value={branch.media.photos.join('\n')}
                  onChange={e => setBranch(prev => ({
                    ...prev,
                    media: {
                      ...prev.media,
                      photos: e.target.value.split('\n').filter(l => l.trim())
                    }
                  }))}
                  placeholder="https://example.com/photo1.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label>Video URLs (one per line)</Label>
                <Textarea 
                  className="min-h-[100px]"
                  value={branch.media.videos.join('\n')}
                  onChange={e => setBranch(prev => ({
                    ...prev,
                    media: {
                      ...prev.media,
                      videos: e.target.value.split('\n').filter(l => l.trim())
                    }
                  }))}
                  placeholder="https://example.com/video1.mp4"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

