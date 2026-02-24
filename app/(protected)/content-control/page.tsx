'use client'

import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { setActiveTab, setPage, fetchContent, deleteContent } from '@/redux/slices/contentSlice'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, Loader2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { Content } from '@/types'

export default function ContentControlPage() {
  const dispatch = useAppDispatch()
  const { contents, activeTab, loading, error, count, page, next, previous, deletingId } = useAppSelector((state) => state.content)

  // Fetch on mount and when tab/page changes
  useEffect(() => {
    const quizType = activeTab === 'quizzes' ? 'quiz' : 'flashcard'
    dispatch(fetchContent({ quizType, page }))
  }, [dispatch, activeTab, page])

  const totalPages = Math.ceil(count / 10)

  const handlePrevPage = () => {
    if (previous && page > 1) {
      dispatch(setPage(page - 1))
    }
  }

  const handleNextPage = () => {
    if (next) {
      dispatch(setPage(page + 1))
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

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <p className="text-red-500">{error}</p>
                <Button
                  onClick={() => dispatch(fetchContent({ quizType: activeTab === 'quizzes' ? 'quiz' : 'flashcard', page }))}
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Content Table */}
            {!loading && !error && (
              <>
                <div className="mt-6 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Title</TableHead>
                        <TableHead className="hidden sm:table-cell">Content Type</TableHead>
                        <TableHead className="hidden md:table-cell">Source File</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                            No {activeTab} found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        contents.map((content: Content) => (
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
                              {content.content_type}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-gray-600">
                              {content.source_file}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {content.created_date}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={deletingId === content.id}
                                onClick={async () => {
                                  try {
                                    await dispatch(deleteContent(content.id)).unwrap()
                                    toast.success('Content deleted successfully!')
                                  } catch (err) {
                                    toast.error(typeof err === 'string' ? err : 'Failed to delete content')
                                  }
                                }}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                {deletingId === content.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-500">
                      Showing page {page} of {totalPages} ({count} items)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={!previous}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!next}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
