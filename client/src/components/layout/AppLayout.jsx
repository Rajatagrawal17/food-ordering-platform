import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' } },
};

export const AppLayout = () => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="app-shell">
      <Header />
      <div className="app-shell__body">
        <Sidebar />
        <main className="app-shell__content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={shouldReduceMotion ? {} : pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};