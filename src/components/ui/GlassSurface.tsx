import React from 'react';

type GlassVariant = 'subtle' | 'default' | 'strong' | 'interactive' | 'active' | 'floating' | 'modal' | 'navigation';
type GlassShape = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'card' | 'panel' | 'large' | 'small';

interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  shape?: GlassShape;
  as?: keyof JSX.IntrinsicElements;
}

const variantClass: Record<GlassVariant, string> = {
  subtle: 'glass',
  default: 'glass glass-card',
  strong: 'glass glass-panel',
  interactive: 'glass glass-card',
  active: 'glass glass-card glass-active',
  floating: 'glass glass-premium',
  modal: 'glass glass-premium',
  navigation: 'glass glass-panel',
};

const shapeRadius: Record<GlassShape, string> = {
  xs: 'var(--glass-radius-xs)',
  sm: 'var(--glass-radius-sm)',
  md: 'var(--glass-radius-md)',
  lg: 'var(--glass-radius-card)',
  xl: 'var(--glass-radius-xl)',
  card: 'var(--glass-radius-card)',
  panel: 'var(--glass-radius-panel)',
  large: 'var(--glass-radius-large)',
  small: 'var(--glass-radius-small)',
};

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  variant = 'default',
  shape,
  as: Tag = 'div',
  className = '',
  style,
  children,
  ...props
}) => {
  const base = variantClass[variant] ?? variantClass.default;
  const radiusStyle = shape ? { borderRadius: shapeRadius[shape] } : undefined;
  return (
    // @ts-ignore dynamic tag
    <Tag
      className={`${base} ${className}`.trim()}
      style={{ ...radiusStyle, ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </Tag>
  );
};

export const GlassCard: React.FC<GlassSurfaceProps> = (p) => <GlassSurface variant="default" shape="card" {...p} />;
export const GlassPanel: React.FC<GlassSurfaceProps> = (p) => <GlassSurface variant="strong" shape="panel" {...p} />;
export const GlassModal: React.FC<GlassSurfaceProps> = (p) => <GlassSurface variant="modal" shape="panel" {...p} />;
export const GlassNavigation: React.FC<GlassSurfaceProps> = (p) => <GlassSurface variant="navigation" shape="panel" {...p} />;

export default GlassSurface;
