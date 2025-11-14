import 'flatpickr/dist/flatpickr.css'
import { createRoot } from 'react-dom/client'
import 'swiper/swiper-bundle.css'
import App from './App.tsx'
import { AppWrapper } from './components/common/PageMeta.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import { AppProvider } from './context/AuthContext.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // cái retry được dùng để tắt mấy cái toast khi token bị hết hanj
      // nó gọi báo tới 3 lần lận nên là chỉ 1 lần thoi
      retry: 0
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppWrapper>
          <App />
          <ToastContainer position='bottom-right' toastClassName='bg-gray-800 text-white rounded-lg p-4 shadow-lg' />
        </AppWrapper>
      </AppProvider>
    </QueryClientProvider>
  </ThemeProvider>
)
