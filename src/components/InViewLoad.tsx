import React, { useState, useEffect, useRef, Suspense, ReactNode } from 'react';

interface InViewLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
}

export const InViewLoad: React.FC<InViewLoadProps> = ({ children, fallback = null, rootMargin = '200px' }) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  return (
    <div ref={ref}>
      {isInView ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  );
};
