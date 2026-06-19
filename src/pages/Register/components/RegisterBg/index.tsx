import React from 'react';
import styles from './index.less';

interface WaveLayerProps {
  path: string;
  color: string;
  duration: number;
  delay?: number;
  opacity?: number;
  yOffset?: number;
}

const WaveLayer: React.FC<WaveLayerProps> = ({
  path,
  color,
  duration,
  delay = 0,
  opacity = 1,
  yOffset = 0,
}) => {
  return (
    <div
      className={styles.waveLayer}
      style={{
        bottom: yOffset,
        opacity,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className={styles.waveSvg}
      >
        <path fill={color} d={path} />
      </svg>
    </div>
  );
};

const wavePaths = [
  'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
  'M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,101.3C672,107,768,149,864,165.3C960,181,1056,171,1152,149.3C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
  'M0,256L48,245.3C96,235,192,213,288,192C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
  'M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
];

interface RegisterBgProps {
  children: React.ReactNode;
}

const RegisterBg: React.FC<RegisterBgProps> = ({ children }) => {
  return (
    <div className={styles.bgWrap}>
      <div className={styles.gradientOverlay} />
      <WaveLayer
        path={wavePaths[0]}
        color="#1e1b4b"
        duration={25}
        yOffset={-40}
      />
      <WaveLayer
        path={wavePaths[1]}
        color="#312e81"
        duration={20}
        delay={-5}
        yOffset={-20}
      />
      <WaveLayer
        path={wavePaths[2]}
        color="#0891b2"
        duration={18}
        delay={-10}
        opacity={0.7}
        yOffset={0}
      />
      <WaveLayer
        path={wavePaths[3]}
        color="#06b6d4"
        duration={15}
        delay={-15}
        opacity={0.5}
        yOffset={20}
      />
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default RegisterBg;
