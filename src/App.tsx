import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { requestNotificationPermission } from '@/utils/alarmUtils';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

// 알림 권한 요청 컴포넌트
const NotificationPermissionRequest = () => {
  useEffect(() => {
    const requestPermission = async () => {
      try {
        await requestNotificationPermission();
      } catch (error) {
        console.log('알림 권한 요청 중 오류가 발생했습니다:', error);
      }
    };

    // 페이지 로드 후 잠시 대기 후 권한 요청
    const timer = setTimeout(requestPermission, 2000);
    return () => clearTimeout(timer);
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NotificationPermissionRequest />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
