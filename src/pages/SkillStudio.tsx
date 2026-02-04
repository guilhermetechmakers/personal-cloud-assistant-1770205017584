import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { Save, Play, Upload, RotateCcw, Settings, LayoutGrid, PanelRight, AlertCircle } from 'lucide-react'

const blockTypes = [
  'Fetch',
  'Transform',
  'Search',
  'WebAgent',
  'CreateOutput',
  'Deliver',
  'Guard',
]

export function SkillStudio() {
  return (
    <AnimatedPage>
      <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Skill Studio</h1>
            <p className="text-muted-foreground">
              No-code builder: templates, blocks, test/preview
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Revert
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              Test
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Publish
            </Button>
            <Button size="sm" className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid flex-1 gap-4 overflow-hidden lg:grid-cols-[1fr_2fr_1fr]">
          <Card className="border-border bg-card overflow-auto">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Settings className="h-4 w-4" />
                Trigger Panel
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Manual / schedule / event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Trigger: Manual
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Configure trigger
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card overflow-auto">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                <LayoutGrid className="h-4 w-4" />
                Block Canvas
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Drag-and-drop blocks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex min-h-[200px] flex-wrap gap-2 rounded-lg border border-dashed border-border p-4">
                {blockTypes.map((t) => (
                  <div
                    key={t}
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                  >
                    {t}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4 overflow-hidden">
            <Card className="border-border bg-card flex-1 overflow-auto">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <PanelRight className="h-4 w-4" />
                  Block Properties
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Parameters, connectors, templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Select a block to edit properties
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <AlertCircle className="h-4 w-4" />
                  Validation
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Preflight errors & connector warnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  No errors
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AnimatedPage>
  )
}
