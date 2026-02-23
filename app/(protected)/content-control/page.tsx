'use client'

import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { setActiveTab, deleteContent } from '@/redux/slices/contentSlice'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Content } from '@/types'

export default function ContentControlPage() {
  const dispatch = useAppDispatch()
  const { contents, activeTab } = useAppSelector((state) => state.content)

  const filteredContents = contents.filter((content: Content) =>
    activeTab === 'quizzes'
      ? content.contentType === 'Quiz'
      : content.contentType === 'Flashcard'
  )

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 hover:bg-green-100'
      case 'Flagged':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-100'
      case 'Inactive':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100'
      default:
        return ''
    }
  }

  return (
    <div className="flex-1">
      <Header title="Content Control" />
      
      <main className="p-4 lg:p-6">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 lg:p-6">
            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={(value) => dispatch(setActiveTab(value as 'quizzes' | 'flashcards'))}
            >
              <TabsList className="bg-gray-100">
                <TabsTrigger
                  value="quizzes"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Quizzes
                </TabsTrigger>
                <TabsTrigger
                  value="flashcards"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Flashcards
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Content Table */}
            <div className="mt-6 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Title</TableHead>
                    <TableHead className="hidden sm:table-cell">Content Type</TableHead>
                    <TableHead className="hidden md:table-cell">Source File</TableHead>
                    <TableHead className="hidden lg:table-cell">Created Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContents.map((content: Content) => (
                    <TableRow key={content.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                            <FileText className="h-5 w-5" />
                          </div>
                          <span className="font-medium text-gray-900">{content.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-gray-600">
                        {content.contentType}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-gray-600">
                        {content.sourceFile}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-gray-600">
                        {content.createdDate}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn('font-medium', getStatusBadgeStyles(content.status))}
                        >
                          {content.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => dispatch(deleteContent(content.id))}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
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
