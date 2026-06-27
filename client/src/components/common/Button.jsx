import { motion, useReducedMotion } from 'framer-motion';

export const Button = ({ children, variant = 'primary', type = 'button', className = '', ...props }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type={type}
      className={`button button--${variant} ${className}`.trim()}
      whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};