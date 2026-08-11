interface Props {
  name: string;
  color: string;
  size?: number;
  char?: string;
  ring?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function Avatar({ name, color, size = 48, char, ring, style, className }: Props) {
  const letter = char ?? name.charAt(0);
  const fontSize = Math.round(size * 0.38);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(140deg, ${color}BB 0%, ${color} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: ring
          ? `0 0 0 2.5px ${color}, 0 0 0 4.5px rgba(255,255,255,0.88)`
          : `0 2px 10px ${color}44`,
        ...style,
      }}
    >
      <span
        style={{
          fontSize,
          fontWeight: 600,
          color: '#fff',
          fontFamily: "'Noto Serif SC', serif",
          lineHeight: 1,
          textShadow: '0 1px 3px rgba(0,0,0,0.18)',
          userSelect: 'none',
        }}
      >
        {letter}
      </span>
    </div>
  );
}
