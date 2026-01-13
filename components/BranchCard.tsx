import Link from 'next/link'
import { MapPin, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Branch } from '@/lib/data'

interface BranchCardProps {
  branch: Branch
}

export function BranchCard({ branch }: BranchCardProps) {
  return (
    <Card className="branch-card hover:scale-[1.02] transition-transform duration-200">
      <CardHeader className="p-3 xs:p-4 sm:p-6 pb-2 xs:pb-3">
        <CardTitle className="text-base xs:text-lg sm:text-xl leading-tight">{branch.name}</CardTitle>
        <p className="text-xs xs:text-sm text-muted-foreground line-clamp-1">{branch.school}</p>
      </CardHeader>
      <CardContent className="p-3 xs:p-4 sm:p-6 pt-0 space-y-2 xs:space-y-3 sm:space-y-4">
        {/* Location and Manager */}
        <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm">
            <MapPin className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{branch.location}</span>
          </div>
          <div className="flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm">
            <User className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{branch.manager}</span>
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/branch/${branch.slug}`} className="block">
          <Button className="w-full h-8 xs:h-9 text-xs xs:text-sm" size="sm">
            Open Branch
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

