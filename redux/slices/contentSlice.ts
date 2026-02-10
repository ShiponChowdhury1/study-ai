import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Content } from '@/types'

interface ContentState {
  contents: Content[]
  activeTab: 'quizzes' | 'flashcards'
  loading: boolean
}

const initialContents: Content[] = [
  { id: '1', title: 'Introduction to Machine Learning', contentType: 'Quiz', sourceFile: 'ML_Basics.pdf', createdDate: 'Feb 8, 2026', status: 'Active' },
  { id: '2', title: 'Data Structures & Algorithms', contentType: 'Quiz', sourceFile: 'DSA_Chapter3.ppt', createdDate: 'Feb 7, 2026', status: 'Active' },
  { id: '3', title: 'Web Development Fundamentals', contentType: 'Quiz', sourceFile: 'WebDev_Guide.docx', createdDate: 'Feb 6, 2026', status: 'Flagged' },
  { id: '4', title: 'Database Management Systems', contentType: 'Quiz', sourceFile: 'DBMS_Lecture5.pdf', createdDate: 'Feb 5, 2026', status: 'Active' },
  { id: '5', title: 'Cloud Computing Essentials', contentType: 'Quiz', sourceFile: 'Cloud_101.pdf', createdDate: 'Feb 4, 2026', status: 'Active' },
  { id: '6', title: 'Neural Networks Basics', contentType: 'Flashcard', sourceFile: 'NN_Chapter1.pdf', createdDate: 'Feb 8, 2026', status: 'Active' },
  { id: '7', title: 'Python Programming', contentType: 'Flashcard', sourceFile: 'Python_Guide.pdf', createdDate: 'Feb 7, 2026', status: 'Active' },
  { id: '8', title: 'JavaScript Fundamentals', contentType: 'Flashcard', sourceFile: 'JS_Basics.docx', createdDate: 'Feb 6, 2026', status: 'Active' },
]

const initialState: ContentState = {
  contents: initialContents,
  activeTab: 'quizzes',
  loading: false,
}

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'quizzes' | 'flashcards'>) => {
      state.activeTab = action.payload
    },
    deleteContent: (state, action: PayloadAction<string>) => {
      state.contents = state.contents.filter(c => c.id !== action.payload)
    },
    updateContentStatus: (state, action: PayloadAction<{ id: string; status: Content['status'] }>) => {
      const content = state.contents.find(c => c.id === action.payload.id)
      if (content) {
        content.status = action.payload.status
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setActiveTab, deleteContent, updateContentStatus, setLoading } = contentSlice.actions
export default contentSlice.reducer
