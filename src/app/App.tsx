import { Toaster } from 'sonner';
import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
