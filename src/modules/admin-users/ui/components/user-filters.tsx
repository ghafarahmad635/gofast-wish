"use client"

import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Search, XCircleIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useUsersAdminFilters } from "../../hooks/use-admin-users"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  UserBanStatus,
  UserRole,
  UserLoginStatus,
  UserEmailStatus,
} from "../../types"
import { Button } from "@/components/ui/button"

const UserFilters = () => {
  const [filters, setFilters] = useUsersAdminFilters()
  const [searchTerm, setSearchTerm] = useState(filters.search || "")

  // Debounce Search Input (300ms)
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
  }, [searchTerm, filters.search, setFilters])

  const isModified =
    !!filters.search ||
    !!filters.ban_status ||
    !!filters.role ||
    !!filters.login_status ||
    !!filters.email_status

  const clearFilters = () => {
    setFilters({
      search: null,
      role: null,
      ban_status: null,
      login_status: null,
      email_status: null,
      page: 1,
    })
    setSearchTerm("")
  }

  return (
    <ScrollArea>
      <div className="flex items-center gap-x-2 p-1 justify-between">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search By Name or Email..."
            className="pl-8 pr-3 py-2 text-sm rounded-md border border-gray-300 bg-white w-auto min-w-[250px]"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-x-2 items-center">
          {/* Role */}
          <Select
            value={filters.role ? filters.role : ""}
            onValueChange={(value) =>
              setFilters({
                role: value as UserRole,
              })
            }
          >
            <SelectTrigger className="w-[130px] bg-white">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="SUPERADMIN">SUPERADMIN</SelectItem>
            </SelectContent>
          </Select>

          {/* Ban status */}
          <Select
            value={filters.ban_status ?? ""}
            onValueChange={(value) =>
              setFilters({
                ban_status: value as UserBanStatus,
              })
            }
          >
            <SelectTrigger className="w-[130px] bg-white">
              <SelectValue placeholder="Ban status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserBanStatus.NotBanned}>
                Not banned
              </SelectItem>
              <SelectItem value={UserBanStatus.Banned}>
                Banned
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Login status */}
          <Select
            value={filters.login_status ?? ""}
            onValueChange={(value) =>
              setFilters({
                login_status: value as UserLoginStatus,
              })
            }
          >
            <SelectTrigger className="w-[130px] bg-white">
              <SelectValue placeholder="Login status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserLoginStatus.Online}>
                Online
              </SelectItem>
              <SelectItem value={UserLoginStatus.Offline}>
                Offline
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Email status */}
          <Select
            value={filters.email_status ?? ""}
            onValueChange={(value) =>
              setFilters({
                email_status: value as UserEmailStatus,
              })
            }
          >
            <SelectTrigger className="w-[130px] bg-white">
              <SelectValue placeholder="Email status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserEmailStatus.Verified}>
                Verified
              </SelectItem>
              <SelectItem value={UserEmailStatus.NotVerified}>
                Not verified
              </SelectItem>
            </SelectContent>
          </Select>

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

export default UserFilters
