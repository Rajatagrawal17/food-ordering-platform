export const staggerFadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
};

export const scaleFadeVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut', delay: 0.2 } },
};

export const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' },
  }),
  exit: { opacity: 0, scale: 0.96, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden', transition: { duration: 0.2, ease: 'easeOut' } },
};

export const pulseVariants = {
  initial: { scale: 1, color: 'inherit' },
  animate: { scale: [1, 1.05, 1], color: ['inherit', 'var(--primary)', 'inherit'], transition: { duration: 0.3 } },
};

export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};
