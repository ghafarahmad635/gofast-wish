'use client'

import { useEffect, useState } from 'react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { XCircleIcon, Search } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGoalsFilters } from '../../hooks/use-goals-filters'

export default function GoalsFilters() {
  const [filters, setFilters] = useGoalsFilters()

  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || '')
  const [priority, setPriority] = useState(filters.priority || '')
  const [sort, setSort] = useState<'asc' | 'desc'>(filters.sort || 'desc')

  // ✅ Debounce Search Input (300ms)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setFilters((prev) => ({
          ...prev,
          search: searchTerm,
          page: 1,
        }))
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchTerm])

  // ✅ Sync dropdown filters
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
      status,
      priority,
      sort,
      page: 1,
    }))
  }, [status, priority, sort])

  const clearFilters = () => {
    setSearchTerm('')
    setStatus('')
    setPriority('')
    setSort('desc')
    setFilters({
      search: '',
      status: '',
      priority: '',
      sort: 'desc',
      page: 1,
    })
  }

  const isModified =
    !!filters.search || !!filters.status || !!filters.priority || filters.sort !== 'desc'

  return (
    <ScrollArea>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-2">
        {/* Left: Search */}
        <div className="relative w-full sm:max-w-sm flex-shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search goals..."
            className="pl-8 pr-3 py-2 text-sm rounded-md border border-gray-300 bg-white"
          />
        </div>

        {/* Right: Dropdowns */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* Status */}
          <Select value={status} onValueChange={(value) => setStatus(value)}>
            <SelectTrigger className="w-[130px] bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="incomplete">Incomplete</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority */}
          <Select value={priority} onValueChange={(value) => setPriority(value)}>
            <SelectTrigger className="w-[130px] bg-white">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sort} onValueChange={(value: 'asc' | 'desc') => setSort(value)}>
            <SelectTrigger className="w-[130px] bg-white">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear */}
          {isModified && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <XCircleIcon className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
