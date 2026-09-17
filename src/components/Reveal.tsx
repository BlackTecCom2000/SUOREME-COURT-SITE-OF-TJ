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

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
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
        className={`animate-fade-in-up ${className}`}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      ref={ref as any}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}
    >
      {children}
    </Component>
  );
};
