import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { Footer } from '@/components/Footer'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PrintHeader } from '@/components/PrintHeader'
import { KPIBadge } from '@/components/KPIBadge'
import { RoleTabs } from '@/components/RoleTabs'
import { RecipeSelector } from '@/components/RecipeSelector'
import { loadBranch, loadBranches, loadRoles } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface BranchPageProps {
  params: {
    slug: string
  }
  searchParams: {
    print?: string
  }
}

export default function BranchPage({ params, searchParams }: BranchPageProps) {
  const branch = loadBranch(params.slug)
  const allRoles = loadRoles()

  if (!branch) {
    notFound()
  }

  const isPrintMode = searchParams.print === '1'
  
  // Get role details for this branch
  const branchRoles = allRoles
    .filter(role => branch.roles.includes(role.roleId))
    .map(role => ({ roleId: role.roleId, name: role.name }))

  return (
    <div className="min-h-screen flex flex-col">
      {!isPrintMode && <TopNav />}
      <PrintHeader branchName={branch.name} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: branch.name },
          ]}
        />

        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{branch.name}</h1>
              <p className="text-xl text-muted-foreground">{branch.school}</p>
            </div>
            {!isPrintMode && (
              <Link href={`/branch/${branch.slug}?print=1`} target="_blank">
                <Button variant="outline">Print View</Button>
              </Link>
            )}
          </div>

          {/* Branch Information Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Branch Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Location
                  </div>
                  <p className="font-semibold">{branch.location}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Operating Hours
                  </div>
                  <p className="text-sm">{branch.operatingHours}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Manager
                  </div>
                  <p className="font-semibold">{branch.manager}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPIs */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <KPIBadge
                  label="Sales Target"
                  value={branch.kpis.salesTarget}
                  type="sales"
                />
                <KPIBadge label="Waste" value={branch.kpis.wastePct} type="waste" />
                <KPIBadge
                  label="Hygiene Score"
                  value={branch.kpis.hygieneScore}
                  type="hygiene"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {branch.contacts.map((contact, index) => (
                  <div key={index} className="flex flex-col gap-2 pb-4 border-b last:border-b-0 last:pb-0">
                    <div className="font-semibold">{contact.name}</div>
                    <div className="text-sm text-muted-foreground">{contact.role}</div>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${contact.phone}`} className="hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <a href={`mailto:${contact.email}`} className="hover:underline">
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roles Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Operational Roles</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Select a role to view responsibilities, checklists, and daily timelines
            </p>
          </CardHeader>
          <CardContent>
            <RoleTabs roles={branchRoles} branchSlug={branch.slug} />
          </CardContent>
        </Card>

        {/* Recipes Section */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Recipes & Menu Items</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Select a day to view recipes, preparation instructions, and presentation guidelines
            </p>
          </CardHeader>
          <CardContent>
            <RecipeSelector branchSlug={branch.slug} />
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

export async function generateStaticParams() {
  const branches = loadBranches()
  return branches.map(branch => ({
    slug: branch.slug,
  }))
}

