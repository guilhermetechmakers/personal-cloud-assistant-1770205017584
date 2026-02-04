/**
 * Export Data Form: select data type, format, date range and request export.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExportDataType, ExportFormat } from '@/types/export'

const exportFormSchema = z
  .object({
    data_type: z.enum(['runs', 'reports', 'audit_logs']),
    format: z.enum(['csv', 'pdf', 'json']),
    date_from: z.string().min(1, 'Start date is required'),
    date_to: z.string().min(1, 'End date is required'),
  })
  .refine(
    (data) => new Date(data.date_from) <= new Date(data.date_to),
    { message: 'End date must be on or after start date', path: ['date_to'] }
  )

type ExportFormValues = z.infer<typeof exportFormSchema>

const DATA_TYPES: { value: ExportDataType; label: string }[] = [
  { value: 'runs', label: 'Runs' },
  { value: 'reports', label: 'Reports' },
  { value: 'audit_logs', label: 'Audit logs' },
]

const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: 'csv', label: 'CSV' },
  { value: 'pdf', label: 'PDF' },
  { value: 'json', label: 'JSON' },
]

export interface ExportDataFormProps {
  onSubmit: (payload: {
    data_type: ExportDataType
    format: ExportFormat
    date_from: string
    date_to: string
  }) => void
  onCancel?: () => void
  isSubmitting?: boolean
  className?: string
}

export function ExportDataForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
}: ExportDataFormProps) {
  const form = useForm<ExportFormValues>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      data_type: 'runs',
      format: 'csv',
      date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      date_to: new Date().toISOString().slice(0, 10),
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      data_type: values.data_type as ExportDataType,
      format: values.format as ExportFormat,
      date_from: new Date(values.date_from).toISOString(),
      date_to: new Date(values.date_to).toISOString(),
    })
  })

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileDown className="h-5 w-5" />
          Export Data
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Select data type, format, and date range. A secure download link will be provided when ready.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data_type">Data type</Label>
            <Select
              value={form.watch('data_type')}
              onValueChange={(v) => form.setValue('data_type', v as ExportDataType)}
            >
              <SelectTrigger id="data_type" className="border-border bg-card">
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                {DATA_TYPES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select
              value={form.watch('format')}
              onValueChange={(v) => form.setValue('format', v as ExportFormat)}
            >
              <SelectTrigger id="format" className="border-border bg-card">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {FORMATS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date_from">From date</Label>
              <input
                id="date_from"
                type="date"
                className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register('date_from')}
              />
              {form.formState.errors.date_from && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.date_from.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_to">To date</Label>
              <input
                id="date_to"
                type="date"
                className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register('date_to')}
              />
              {form.formState.errors.date_to && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.date_to.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="transition-transform hover:scale-[1.02]"
            >
              {isSubmitting ? 'Requesting…' : 'Request export'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
