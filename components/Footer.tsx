export function Footer() {
  const version = '1.0.0'
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t bg-background no-print">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-semibold text-primary">Mikana</span> Branch Guidebook
          </div>
          <div className="flex items-center gap-4">
            <span>Version {version}</span>
            <span>© {currentYear} Mikana Group</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

