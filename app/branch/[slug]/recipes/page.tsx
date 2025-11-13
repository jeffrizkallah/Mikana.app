import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopNav } from '@/components/TopNav'
import { Footer } from '@/components/Footer'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RecipeCard } from '@/components/RecipeCard'
import { loadBranch, getRecipesForDay, getUniqueDays, loadRecipes } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChefHat } from 'lucide-react'

interface RecipesPageProps {
  params: {
    slug: string
  }
  searchParams: {
    day?: string
  }
}

export default function RecipesPage({ params, searchParams }: RecipesPageProps) {
  const branch = loadBranch(params.slug)

  if (!branch) {
    notFound()
  }

  const days = getUniqueDays()
  const selectedDay = searchParams.day || days[0]
  const recipes = searchParams.day ? getRecipesForDay(searchParams.day) : loadRecipes()

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: branch.name, href: `/branch/${branch.slug}` },
            { label: 'Recipes' },
          ]}
        />

        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="h-8 w-8" />
            <h1 className="text-4xl font-bold">
              {searchParams.day ? `${searchParams.day}'s Recipes` : 'All Recipes'}
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            {branch.name} - Daily Recipe Guide
          </p>
        </div>

        {/* Day Filter Tabs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Link href={`/branch/${branch.slug}/recipes`}>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    !searchParams.day
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  All Days
                </button>
              </Link>
              {days.map(day => (
                <Link key={day} href={`/branch/${branch.slug}/recipes?day=${day}`}>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedDay === day
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {day}
                  </button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recipe Grid */}
        {recipes.length > 0 ? (
          <>
            <h2 className="text-2xl font-semibold mb-4">
              {recipes.length} Recipe{recipes.length !== 1 ? 's' : ''} Available
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map(recipe => (
                <RecipeCard key={recipe.recipeId} recipe={recipe} branchSlug={branch.slug} />
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <ChefHat className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Recipes Found</h3>
              <p className="text-muted-foreground">
                There are no recipes available for {searchParams.day || 'this selection'}.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  )
}

