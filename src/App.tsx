import { Dashboard } from '@/sections/Dashboard';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

function App() {
  return (
    <>
      <Dashboard />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
