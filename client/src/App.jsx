import { Suspense } from 'react';
import AppRouter from './routes/AppRouter';
import { Spinner } from './components/common/Spinner';

export default function App() {
  return (
    <Suspense fallback={<div className="app-loader"><Spinner label="Loading application" /></div>}>
      <AppRouter />
    </Suspense>
  );
}