import { useCallback } from 'react';

type ToastStatus = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title: string;
  description: string;
  status: ToastStatus;
  duration?: number;
  isClosable?: boolean;
}

// This is a mock implementation since we don't have an actual toast system
// In a real application, this would use something like React-Toastify or Chakra UI's toast
export const useToast = () => {
  const showToast = useCallback(({ title, description, status }: ToastOptions) => {
    // For now, just log to console
    console.log(`[${status.toUpperCase()}] ${title}: ${description}`);
    
    // In a real implementation, you would show a toast notification
    // For example, with Chakra UI:
    // toast({
    //   title,
    //   description,
    //   status,
    //   duration: 5000,
    //   isClosable: true,
    //   position: 'top-right'
    // });
  }, []);

  return { showToast };
};
