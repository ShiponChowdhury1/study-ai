'use client'

import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import type { RootState } from '@/redux/store'
import { setFilter, setSearchQuery, fetchUsers, toggleBlockUser } from '@/redux/slices/usersSlice'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Ban, RotateCcw, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { getInitials, cn } from '@/lib/utils'

export default function UserManagementPage() {
  const dispatch = useAppDispatch()
  const { users, filter, searchQuery, loading, error, togglingId } = useAppSelector((state: RootState) => state.users)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && user.status === 'Active') ||
      (filter === 'blocked' && user.status === 'Blocked')
    return matchesSearch && matchesFilter
  })

  const filterButtons = [
    { value: 'all', label: 'All Users' },
    { value: 'active', label: 'Active' },
    { value: 'blocked', label: 'Blocked' },
  ] as const

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-teal-500',
      'bg-indigo-500',
      'bg-red-500',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <div className="flex-1">
        <Header title="User Management" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1">
        <Header title="User Management" />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => dispatch(fetchUsers())} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <Header title="User Management" />
      
      <main className="p-4 lg:p-6">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 lg:p-6">
            {/* Search and Filter */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                {filterButtons.map((btn) => (
                  <Button
                    key={btn.value}
                    variant={filter === btn.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => dispatch(setFilter(btn.value))}
                    className={cn(
                      filter === btn.value && 'bg-blue-500 hover:bg-blue-600'
                    )}
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="mt-6 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-70">User Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className={cn('h-9 w-9', getAvatarColor(user.full_name))}>
                            <AvatarFallback className="text-white text-sm font-medium bg-transparent">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name}</p>
                            <p className="text-sm text-gray-500 sm:hidden">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-gray-600">
                        {user.email}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-gray-600">
                        {user.join_date}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === 'Active' ? 'default' : 'destructive'}
                          className={cn(
                            'font-medium',
                            user.status === 'Active' 
                              ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                              : 'bg-red-100 text-red-700 hover:bg-red-100'
                          )}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={user.status === 'Active' ? 'destructive' : 'outline'}
                          size="sm"
                          disabled={togglingId === user.id}
                          onClick={async () => {
                            try {
                              const result = await dispatch(toggleBlockUser(user.id)).unwrap()
                              toast.success(result.message)
                            } catch (err) {
                              toast.error(typeof err === 'string' ? err : 'Failed to update user status')
                            }
                          }}
                          className={cn(
                            user.status === 'Blocked' && 'text-teal-600 border-teal-200 hover:bg-teal-50'
                          )}
                        >
                          {togglingId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.status === 'Active' ? (
                            <>
                              <Ban className="mr-1 h-4 w-4" />
                              Block
                            </>
                          ) : (
                            <>
                              <RotateCcw className="mr-1 h-4 w-4" />
                              Unblock
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
