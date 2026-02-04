/**
 * Skill Studio: no-code builder for automation skills.
 * Toolbar, Trigger Panel, Block Canvas, Block Properties, Test Runner, Validation Pane, Version History.
 */

import { useState } from 'react'
import {
  Save,
  Play,
  Upload,
  RotateCcw,
  Settings,
  LayoutGrid,
  PanelRight,
  AlertCircle,
  Plus,
  GripVertical,
  Trash2,
  History,
  ChevronDown,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SkillFormModal,
  TriggerConfigDialog,
  BlockConfigDialog,
  VersionRevertDialog,
} from '@/components/skill-studio'
import {
  useSkillsList,
  useSkill,
  useSkillBlocks,
  useSkillVersionHistory,
  useSkillTests,
  useCreateSkill,
  useUpdateSkill,
  usePublishSkill,
  useCreateSkillBlock,
  useUpdateSkillBlock,
  useDeleteSkillBlock,
  useReorderSkillBlocks,
  useCreateSkillTest,
} from '@/hooks/useSkills'
import type { SkillBlockType, SkillBlockRow, SkillValidationIssue } from '@/types/skill'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const BLOCK_TYPES: SkillBlockType[] = [
  'Fetch',
  'Transform',
  'Search',
  'WebAgent',
  'CreateOutput',
  'Deliver',
  'Guard',
]

export function SkillStudio() {
  const [currentSkillId, setCurrentSkillId] = useState<string | null>(null)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [testInputJson, setTestInputJson] = useState('{}')
  const [skillFormOpen, setSkillFormOpen] = useState(false)
  const [triggerConfigOpen, setTriggerConfigOpen] = useState(false)
  const [blockConfigOpen, setBlockConfigOpen] = useState(false)
  const [revertListOpen, setRevertListOpen] = useState(false)
  const [revertDialogOpen, setRevertDialogOpen] = useState(false)
  const [revertSnapshot, setRevertSnapshot] = useState<{
    id: string
    skill_id: string
    user_id: string
    version: number
    snapshot: Record<string, unknown>
    created_at: string
  } | null>(null)
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const { data: skills = [], isLoading: skillsLoading } = useSkillsList()
  const { data: skill } = useSkill(currentSkillId)
  const { data: blocks = [], isLoading: blocksLoading } = useSkillBlocks(currentSkillId)
  const { data: versionHistory = [] } = useSkillVersionHistory(currentSkillId)
  useSkillTests(currentSkillId)

  const createSkill = useCreateSkill()
  const updateSkill = useUpdateSkill()
  const publishSkill = usePublishSkill()
  const createBlock = useCreateSkillBlock()
  const updateBlock = useUpdateSkillBlock()
  const deleteBlock = useDeleteSkillBlock()
  const reorderBlocks = useReorderSkillBlocks()
  const createTest = useCreateSkillTest()

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId)

  // Mock validation: preflight errors and connector warnings
  const validationIssues: SkillValidationIssue[] = []
  if (skill?.status === 'published' && blocks.length === 0) {
    validationIssues.push({
      id: 'no-blocks',
      type: 'warning',
      source: 'preflight',
      message: 'Add at least one block before publishing.',
    })
  }
  if (blocks.some((b) => b.block_type === 'Fetch' && !(b.config && Object.keys(b.config).length > 0))) {
    validationIssues.push({
      id: 'fetch-config',
      type: 'warning',
      source: 'block',
      message: 'Configure connector for Fetch blocks.',
      blockType: 'Fetch',
    })
  }

  const handleSaveSkill = () => {
    if (!currentSkillId || !skill) return
    updateSkill.mutate({
      id: currentSkillId,
      updates: {
        name: skill.name,
        description: skill.description,
        trigger_type: skill.trigger_type,
        trigger_config: skill.trigger_config,
      },
    })
  }

  const handleTriggerSubmit = (values: { trigger_type: 'manual' | 'schedule' | 'event'; trigger_config: Record<string, unknown> }) => {
    if (!currentSkillId) return
    updateSkill.mutate({
      id: currentSkillId,
      updates: {
        trigger_type: values.trigger_type,
        trigger_config: values.trigger_config,
      },
    })
  }

  const handleBlockConfigSave = (config: Record<string, unknown>) => {
    if (!selectedBlockId || !currentSkillId) return
    updateBlock.mutate({
      id: selectedBlockId,
      skillId: currentSkillId,
      updates: { config },
    })
  }

  const handleAddBlock = (blockType: SkillBlockType) => {
    if (!currentSkillId) return
    createBlock.mutate({
      skill_id: currentSkillId,
      block_type: blockType,
      config: {},
      order_index: blocks.length,
    })
  }

  const handleRemoveBlock = (blockId: string) => {
    if (!currentSkillId) return
    deleteBlock.mutate({ id: blockId, skillId: currentSkillId })
    if (selectedBlockId === blockId) setSelectedBlockId(null)
  }

  const handleRunTest = () => {
    if (!currentSkillId) return
    let inputs: Record<string, unknown> = {}
    try {
      inputs = JSON.parse(testInputJson || '{}')
    } catch {
      toast.error('Invalid JSON in test input')
      return
    }
    createTest.mutate(
      { skill_id: currentSkillId, inputs, status: 'pending' },
      {
        onSuccess: () => {
          toast.success('Test run started (simulation)')
        },
      }
    )
  }

  const handleRevert = () => {
    if (!revertSnapshot || !currentSkillId) return
    const snapshot = revertSnapshot.snapshot as { trigger_config?: Record<string, unknown> }
    updateSkill.mutate({
      id: currentSkillId,
      updates: {
        trigger_config: snapshot.trigger_config ?? {},
      },
    })
    setRevertSnapshot(null)
    toast.success('Reverted to previous version')
  }

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId)
    e.dataTransfer.setData('text/plain', blockId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault()
    setDragOverId(blockId)
  }

  const handleDragLeave = () => setDragOverId(null)

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOverId(null)
    const sourceId = e.dataTransfer.getData('text/plain')
    if (!sourceId || sourceId === targetId || !currentSkillId) {
      setDraggedBlockId(null)
      return
    }
    const order = blocks.map((b) => b.id)
    const from = order.indexOf(sourceId)
    const to = order.indexOf(targetId)
    if (from === -1 || to === -1) {
      setDraggedBlockId(null)
      return
    }
    const reordered = [...order]
    reordered.splice(from, 1)
    reordered.splice(to, 0, sourceId)
    reorderBlocks.mutate({ skillId: currentSkillId, blockIds: reordered })
    setDraggedBlockId(null)
  }

  const handleDragEnd = () => {
    setDraggedBlockId(null)
    setDragOverId(null)
  }

  const openRevertDialog = (snap: {
    id: string
    skill_id: string
    user_id: string
    version: number
    snapshot: Record<string, unknown>
    created_at: string
  }) => {
    setRevertSnapshot(snap)
    setRevertListOpen(false)
    setRevertDialogOpen(true)
  }

  return (
    <AnimatedPage>
      <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
        {/* Toolbar + Skill selector */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select
              value={currentSkillId ?? '__none__'}
              onValueChange={(v) => {
                if (v === '__new__') setSkillFormOpen(true)
                else setCurrentSkillId(v === '__none__' ? null : v)
                setSelectedBlockId(null)
              }}
            >
              <SelectTrigger className="w-[220px] border-border bg-card">
                <SelectValue placeholder="Select skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select skill</SelectItem>
                <SelectItem value="__new__">+ New skill</SelectItem>
                {skills.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {skill && (
              <>
                <span className="text-sm text-muted-foreground">
                  v{skill.version} · {skill.status}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setSkillFormOpen(true)}
                >
                  Edit skill
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setRevertListOpen(true)}
              disabled={!currentSkillId || versionHistory.length === 0}
            >
              <RotateCcw className="h-4 w-4" />
              Revert
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleRunTest}
              disabled={!currentSkillId}
            >
              <Play className="h-4 w-4" />
              Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => currentSkillId && publishSkill.mutate(currentSkillId)}
              disabled={!currentSkillId || skill?.status === 'published'}
            >
              <Upload className="h-4 w-4" />
              Publish
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={handleSaveSkill}
              disabled={!currentSkillId || updateSkill.isPending}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        {!currentSkillId && !skillsLoading && (
          <Card className="border-border bg-card flex flex-1 items-center justify-center">
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <LayoutGrid className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Select a skill or create a new one to start building.</p>
              <Button onClick={() => setSkillFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New skill
              </Button>
            </CardContent>
          </Card>
        )}

        {currentSkillId && (
          <div className="grid flex-1 gap-4 overflow-hidden lg:grid-cols-[1fr_2fr_1fr]">
            {/* Trigger Panel */}
            <Card className="border-border bg-card flex flex-col overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Settings className="h-4 w-4" />
                  Trigger Panel
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Manual / schedule / event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Trigger: {skill?.trigger_type ?? 'manual'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => setTriggerConfigOpen(true)}
                >
                  Configure trigger
                </Button>
              </CardContent>
            </Card>

            {/* Block Canvas */}
            <Card className="border-border bg-card flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <LayoutGrid className="h-4 w-4" />
                    Block Canvas
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Drag-and-drop blocks
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add block
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-border bg-card">
                    {BLOCK_TYPES.map((t) => (
                      <DropdownMenuItem
                        key={t}
                        onClick={() => handleAddBlock(t)}
                        className="focus:bg-accent/10"
                      >
                        {t}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <div
                  className="min-h-[200px] rounded-lg border border-dashed border-border p-4 transition-colors duration-200"
                  onDragOver={(e) => e.preventDefault()}
                >
                  {blocksLoading ? (
                    <p className="text-sm text-muted-foreground">Loading blocks…</p>
                  ) : blocks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Add a block from the dropdown above. Drag to reorder.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {blocks.map((block) => (
                        <BlockCard
                          key={block.id}
                          block={block}
                          isSelected={selectedBlockId === block.id}
                          isDragging={draggedBlockId === block.id}
                          isDragOver={dragOverId === block.id}
                          onSelect={() => setSelectedBlockId(block.id)}
                          onEdit={() => {
                            setSelectedBlockId(block.id)
                            setBlockConfigOpen(true)
                          }}
                          onRemove={() => handleRemoveBlock(block.id)}
                          onDragStart={(e) => handleDragStart(e, block.id)}
                          onDragOver={(e) => handleDragOver(e, block.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, block.id)}
                          onDragEnd={handleDragEnd}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right column: Block Properties + Validation + Test + History */}
            <div className="flex flex-col gap-4 overflow-hidden">
              <Card className="border-border bg-card flex flex-1 flex-col overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <PanelRight className="h-4 w-4" />
                    Block Properties
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Parameters, connectors, templates
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                  {selectedBlock ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">{selectedBlock.block_type}</p>
                      <pre className="rounded-md border border-border bg-muted/30 p-2 text-xs text-muted-foreground">
                        {JSON.stringify(selectedBlock.config, null, 2)}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setBlockConfigOpen(true)}
                      >
                        Edit properties
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Select a block to edit properties
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border bg-card max-h-[140px] overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <AlertCircle className="h-4 w-4" />
                    Validation
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Preflight errors & connector warnings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-16">
                    {validationIssues.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No errors</p>
                    ) : (
                      <ul className="space-y-1 text-xs">
                        {validationIssues.map((issue) => (
                          <li
                            key={issue.id}
                            className={cn(
                              issue.type === 'error' ? 'text-destructive' : 'text-warning'
                            )}
                          >
                            {issue.message}
                          </li>
                        ))}
                      </ul>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="border-border bg-card max-h-[160px] overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Play className="h-4 w-4" />
                    Test Runner
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Sample input → output simulation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <textarea
                    className="h-14 w-full rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder='{"key": "value"}'
                    value={testInputJson}
                    onChange={(e) => setTestInputJson(e.target.value)}
                    rows={2}
                  />
                  <Button size="sm" className="w-full gap-2" onClick={handleRunTest}>
                    <Play className="h-3 w-3" />
                    Run test
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card max-h-[160px] overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <History className="h-4 w-4" />
                    Version history
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Snapshots and revert
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-20">
                    {versionHistory.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No snapshots yet</p>
                    ) : (
                      <ul className="space-y-1 text-xs">
                        {versionHistory.slice(0, 5).map((v) => (
                          <li
                            key={v.id}
                            className="flex items-center justify-between gap-2 rounded border border-border bg-muted/20 px-2 py-1"
                          >
                            <span className="text-muted-foreground">v{v.version}</span>
                            <span className="text-muted-foreground">
                              {new Date(v.created_at).toLocaleString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1 text-xs"
                              onClick={() => openRevertDialog(v)}
                            >
                              Revert
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <SkillFormModal
        open={skillFormOpen}
        onOpenChange={setSkillFormOpen}
        skill={skill ?? null}
        onSubmit={(values) => {
          if (skill && currentSkillId) {
            updateSkill.mutate({
              id: currentSkillId,
              updates: { name: values.name, description: values.description ?? null },
            })
          } else {
            createSkill.mutate(
              { name: values.name, description: values.description ?? null },
              { onSuccess: (data) => data && setCurrentSkillId(data.id) }
            )
          }
        }}
        isSubmitting={createSkill.isPending || updateSkill.isPending}
      />
      <TriggerConfigDialog
        open={triggerConfigOpen}
        onOpenChange={setTriggerConfigOpen}
        skill={skill ?? null}
        onSubmit={handleTriggerSubmit}
        isSubmitting={updateSkill.isPending}
      />
      <BlockConfigDialog
        open={blockConfigOpen}
        onOpenChange={setBlockConfigOpen}
        block={selectedBlock ?? null}
        onSave={handleBlockConfigSave}
        isSubmitting={updateBlock.isPending}
      />
      <Dialog open={revertListOpen} onOpenChange={setRevertListOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Revert to version</DialogTitle>
            <DialogDescription>
              Select a previous version to revert to. Your current draft will be overwritten.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[240px]">
            <ul className="space-y-2">
              {versionHistory.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-2 rounded border border-border bg-card px-3 py-2"
                >
                  <span className="text-sm text-foreground">v{v.version}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(v.created_at).toLocaleString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openRevertDialog(v)}
                  >
                    Revert
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <VersionRevertDialog
        open={revertDialogOpen}
        onOpenChange={(open) => {
          setRevertDialogOpen(open)
          if (!open) setRevertSnapshot(null)
        }}
        versionSnapshot={revertSnapshot}
        onConfirm={handleRevert}
        isSubmitting={false}
      />
    </AnimatedPage>
  )
}

interface BlockCardProps {
  block: SkillBlockRow
  isSelected: boolean
  isDragging: boolean
  isDragOver: boolean
  onSelect: () => void
  onEdit: () => void
  onRemove: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onDragEnd: () => void
}

function BlockCard({
  block,
  isSelected,
  isDragging,
  isDragOver,
  onSelect,
  onEdit,
  onRemove,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: BlockCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => onDragOver(e)}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 transition-all duration-200',
        isSelected && 'ring-2 ring-primary',
        isDragging && 'opacity-50',
        isDragOver && 'border-primary bg-primary/5'
      )}
      onClick={onSelect}
    >
      <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
      <span className="flex-1 text-sm font-medium text-foreground">{block.block_type}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={(e) => {
          e.stopPropagation()
          onEdit()
        }}
        aria-label="Edit block"
      >
        <Settings className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        aria-label="Remove block"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
