import React, { useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';

/**
 * LiquidGlassSurface — the interaction half of the liquid-glass material.
 *
 * The four visual layers live in CSS (`.lg-material`); this component owns
 * the behaviour that makes it feel like a physical object rather than a tinted
 * rectangle, following anim-apple-design:
 *
 *   §1 Response       feedback starts on pointer-DOWN, not on release
 *   §4 Springs        critically damped (bounce 0, 0.38s) — no wobble
 *   §3 Interruptible  the spring animates from its live value, so a press
 *                     released mid-animation reverses smoothly with no jump
 *   §12 Materialize   press compresses the material, it does not just dim
 *
 * It also writes `--lg-px/--lg-py` so the specular rim in CSS tracks the
 * pointer, which is what gives the edge its light-catching quality.
 *
 * Accessibility: reduced motion keeps the state feedback but drops the
 * spring and the scale, and the surface stays in the DOM as a plain wrapper
 * so markup and semantics are unchanged.
 */

type Pressable = boolean;

export interface LiquidGlassSurfaceProps {
  children: React.ReactNode;
  className?: string;
  /** shape tier: chip | button | card | panel */
  shape?: 'chip' | 'button' | 'card' | 'panel';
  /** enables press compression + pointer-tracked highlight */
  interactive?: Pressable;
  /** render as a real button instead of a div */
  as?: 'div' | 'button' | 'a';
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  onClick?: React.MouseEventHandler;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  style?: React.CSSProperties;
  id?: string;
  title?: string;
}

const SHAPE_CLASS = {
  chip: 'lg-chip',
  button: 'lg-button',
  card: 'lg-card',
  panel: 'lg-panel',
} as const;

export const LiquidGlassSurface: React.FC<LiquidGlassSurfaceProps> = ({
  children,
  className = '',
  shape = 'card',
  interactive = false,
  as = 'div',
  type = 'button',
  href,
  onClick,
  disabled = false,
  style,
  ...rest
}) => {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // press amount: 0 = at rest, 1 = fully held
  const pressTarget = useMotionValue(0);
  // Critically damped (bounce 0) with a 0.38s visual response, per
  // anim-apple-design §4: bounce is reserved for momentum-driven gestures,
  // and a plain tap that wobbles reads as broken rather than playful.
  const press = useSpring(pressTarget, { visualDuration: 0.38, bounce: 0 });
  // pointer position, written straight to CSS custom properties
  const px = useMotionValue(50);
  const py = useMotionValue(0);

  const scale = useTransform(press, [0, 1], [1, 0.97]);
  const lift = useTransform(press, [0, 1], [0, 1]);

  const setPressed = useCallback(
    (v: boolean) => {
      if (!interactive || disabled) return;
      pressTarget.set(v ? 1 : 0);
      ref.current?.classList.toggle('is-pressed', v);
    },
    [interactive, disabled, pressTarget]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || reduceMotion) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      px.set(((e.clientX - r.left) / r.width) * 100);
      py.set(((e.clientY - r.top) / r.height) * 100);
    },
    [interactive, reduceMotion, px, py]
  );

  // Pointer capture keeps the press continuous even if the pointer slides off.
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || disabled) return;
      try {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      } catch {
        /* capture is best-effort */
      }
      setPressed(true);
    },
    [interactive, disabled, setPressed]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        /* already released */
      }
      setPressed(false);
    },
    [setPressed]
  );

  // Keyboard parity: Enter/Space should feel identical to a pointer press.
  useEffect(() => {
    const el = ref.current;
    if (!el || !interactive) return;
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    el.addEventListener('keydown', down);
    el.addEventListener('keyup', up);
    el.addEventListener('blur', up);
    return () => {
      el.removeEventListener('keydown', down);
      el.removeEventListener('keyup', up);
      el.removeEventListener('blur', up);
    };
  }, [interactive, setPressed]);

  const cls = [
    'lg-material',
    SHAPE_CLASS[shape],
    interactive ? 'is-interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Motion resolves MotionValues bound to style at render time, including
  // inside custom properties, so the pointer position is never re-rendered
  // through React state.
  const animated = interactive && !reduceMotion;
  const motionProps = animated
    ? ({
        scale,
        y: lift,
        style: { '--lg-px': px, '--lg-py': py },
      } as unknown as React.CSSProperties)
    : {};

  const common = {
    ref: ref as unknown as React.Ref<HTMLElement>,
    className: cls,
    style: { ...motionProps, ...style },
    onPointerMove,
    onPointerDown,
    onPointerUp,
    onPointerCancel: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    ...rest,
  };

  if (as === 'button') {
    return (
      <motion.button
        {...(common as unknown as React.ComponentProps<typeof motion.button>)}
        type={type}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </motion.button>
    );
  }

  if (as === 'a') {
    return (
      <motion.a
        {...(common as unknown as React.ComponentProps<typeof motion.a>)}
        href={href}
        onClick={onClick}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.div {...(common as unknown as React.ComponentProps<typeof motion.div>)}>
      {children}
    </motion.div>
  );
};

export default LiquidGlassSurface;
