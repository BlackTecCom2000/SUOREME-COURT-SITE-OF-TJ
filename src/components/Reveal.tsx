import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'span';
  priority?: boolean;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  className = '',
  as = 'div',
  priority = false,
}) => {
  const [isVisible, setIsVisible] = useState(priority);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (priority) return;

    const element = ref.current;
    if (!element) return;

    // Reveal once and disconnect: no re-hide/re-animate churn while scrolling.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const Component = as;

  if (priority) {
    return (
      <Component
        style={{ animationDelay: `${delay}ms`, opacity: 0 }}
        className={`reveal animate-blur-out-up ${className}`}
      >
        {children}
      </Component>
    );
  }

  // PERF: animate opacity + transform + temporary blur ONLY (never
  // transition-all). The blur is part of the entrance and resolves to 0.
  return (
    <Component
      ref={ref as any}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isVisible ? 'translate-y-0 scale-100 opacity-100 blur-0' : 'translate-y-8 scale-[0.985] opacity-0 blur-md will-change-transform'
      } ${className}`}
    >
      {children}
    </Component>
  );
};
