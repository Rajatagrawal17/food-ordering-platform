export const Skeleton = ({ type = 'text', count = 1, height, width, className = '' }) => {
  const styles = {
    height: height || undefined,
    width: width || undefined,
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton skeleton--${type} ${className}`.trim()}
          style={styles}
        />
      ))}
    </>
  );
};
