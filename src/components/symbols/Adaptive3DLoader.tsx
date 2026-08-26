import React, { Component, ErrorInfo, ReactNode, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, ContactShadows, Html, OrbitControls } from '@react-three/drei';
import { JusticeSymbolType } from './JusticeScene3D';
import { getSymbolAssetPaths } from './ModelAssetRegistry';
import { ThemisGLB } from './ThemisGLB';
import { ScalesGLB } from './ScalesGLB';
import { GavelGLB } from './GavelGLB';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ModelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Adaptive 3D: Failed to load preferred GLB tier, falling back.', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const Static3DFallback = ({ symbol, fallbackPath }: { symbol: string, fallbackPath: string }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/5">
      <img 
        src={fallbackPath} 
        alt={`${symbol} 3D Fallback`} 
        className="w-3/4 max-w-[320px] h-auto object-contain opacity-85 scale-95 transition-transform duration-700 ease-in-out"
        loading="lazy"
      />
    </div>
  );
};

const SceneLoader = () => (
  <Html center>
    <div className="flex flex-col items-center justify-center gap-3 content-card border-theme-gold/30">
      <div className="w-8 h-8 rounded-full border-2 border-theme-gold border-t-transparent animate-spin" />
      <span className="font-mono text-[11px] uppercase tracking-widest text-theme-gold">
        3D MODEL LOADING...
      </span>
    </div>
  </Html>
);

interface Adaptive3DLoaderProps {
  activeSymbol: JusticeSymbolType;
  inView: boolean;
  tier: 'high-end' | 'medium' | 'low-end';
  isDark: boolean;
  isInsightMode?: boolean;
  balanceState?: 'neutral' | 'law' | 'justice' | 'restored';
  triggerStrike?: boolean;
  onDecision?: () => void;
}

export const Adaptive3DLoader: React.FC<Adaptive3DLoaderProps> = ({
  activeSymbol,
  inView,
  tier,
  isDark,
  isInsightMode,
  balanceState,
  triggerStrike,
  onDecision
}) => {
  const paths = getSymbolAssetPaths(activeSymbol, tier);

  const ambientIntensity = isDark ? 0.85 : 1.35;
  const keyLightColor = isDark ? '#fff4db' : '#ffffff';
  const rimLightColor = isDark ? '#dfbe7e' : '#c5a059';
  const fillLightColor = isDark ? '#38bdf8' : '#e0f2fe';

  const dpr = tier === 'low-end' ? [1, 1] as [number, number] : 
              tier === 'medium' ? [1, 1.5] as [number, number] : [1, 2] as [number, number];
              
  const frameloop = inView ? (tier === 'low-end' ? 'demand' : 'always') : 'demand';

  const modelContent = (
    <Suspense fallback={<SceneLoader />}>
      {activeSymbol === 'themis' && (
        <ThemisGLB isInsightMode={isInsightMode} isDark={isDark} modelPath={paths.glb!} />
      )}
      {activeSymbol === 'scales' && (
        <ScalesGLB balanceState={balanceState} isDark={isDark} modelPath={paths.glb!} />
      )}
      {activeSymbol === 'hammer' && (
        <GavelGLB triggerStrike={triggerStrike} isDark={isDark} onDecision={onDecision} modelPath={paths.glb!} />
      )}
    </Suspense>
  );

  return (
    <Canvas
      shadows={tier !== 'low-end' && tier !== 'medium'}
      dpr={dpr}
      frameloop={frameloop}
      camera={{ position: [0, 0.35, 6.2], fov: 38 }}
      gl={{
        powerPreference: tier === 'high-end' ? 'high-performance' : 'default',
        antialias: tier !== 'low-end',
        alpha: true,
      }}
    >
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[5, 8, 5]} intensity={isDark ? 1.6 : 2.2} color={keyLightColor} castShadow={tier === 'high-end'} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0001} />
      <directionalLight position={[-5, 5, -4]} intensity={isDark ? 2.4 : 1.5} color={rimLightColor} />
      <pointLight position={[0, -2, 4]} intensity={0.6} color={fillLightColor} />

      <Float speed={inView ? 1.0 : 0} rotationIntensity={0.06} floatIntensity={0.08} floatingRange={[-0.02, 0.02]}>
        <ModelErrorBoundary fallback={
          paths.master ? (
            <Suspense fallback={<SceneLoader />}>
              {activeSymbol === 'themis' && <ThemisGLB isInsightMode={isInsightMode} isDark={isDark} modelPath={paths.master} />}
              {activeSymbol === 'scales' && <ScalesGLB balanceState={balanceState} isDark={isDark} modelPath={paths.master} />}
              {activeSymbol === 'hammer' && <GavelGLB triggerStrike={triggerStrike} isDark={isDark} onDecision={onDecision} modelPath={paths.master} />}
            </Suspense>
          ) : (
            <Html center><Static3DFallback symbol={activeSymbol} fallbackPath={paths.fallback} /></Html>
          )
        }>
          {modelContent}
        </ModelErrorBoundary>
      </Float>

      <OrbitControls enableZoom={true} enablePan={false} minDistance={3.5} maxDistance={9.0} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 1.8} dampingFactor={0.05} rotateSpeed={0.8} autoRotate={false} />

      {tier === 'high-end' && (
        <ContactShadows position={[0, -2.45, 0]} opacity={isDark ? 0.65 : 0.45} scale={7} blur={1.8} far={3.5} color={isDark ? '#000000' : '#332919'} />
      )}
    </Canvas>
  );
};
