interface JerseyIconProps {
  type: 'yellow' | 'green' | 'polka' | 'white' | 'blue' | 'red_lantern';
  size?: number;
  className?: string;
}

export default function JerseyIcon({ type, size = 48, className = '' }: JerseyIconProps) {
  const configs = {
    yellow: { body: '#FFD700', collar: '#E5C000', sleeve: '#F0B800', text: '#000' },
    green: { body: '#00A651', collar: '#008040', sleeve: '#009040', text: '#fff' },
    polka: { body: '#E2001A', collar: '#B80000', sleeve: '#CC0015', text: '#fff', dots: true },
    white: { body: '#FFFFFF', collar: '#CCCCCC', sleeve: '#E8E8E8', text: '#333' },
    blue: { body: '#0055A4', collar: '#003d7a', sleeve: '#004d8f', text: '#fff' },
    red_lantern: { body: '#CC0000', collar: '#990000', sleeve: '#BB0000', text: '#fff' },
  };

  const c = configs[type];
  const dotPositions = [
    [18, 22], [28, 18], [22, 30], [32, 28], [16, 34],
    [26, 38], [34, 36], [20, 44], [30, 42],
  ];

  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 50 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Jersey body */}
      <path
        d="M10 15 L0 28 L10 30 L10 52 L40 52 L40 30 L50 28 L40 15 L32 10 C30 18 20 18 18 10 Z"
        fill={c.body}
        stroke={c.collar}
        strokeWidth="0.5"
      />
      {/* Left sleeve */}
      <path
        d="M10 15 L0 28 L10 30 L10 22 Z"
        fill={c.sleeve}
        opacity="0.8"
      />
      {/* Right sleeve */}
      <path
        d="M40 15 L50 28 L40 30 L40 22 Z"
        fill={c.sleeve}
        opacity="0.8"
      />
      {/* Collar */}
      <path
        d="M18 10 C20 18 30 18 32 10 C30 6 20 6 18 10 Z"
        fill={c.collar}
      />
      {/* Zipper line */}
      <line x1="25" y1="18" x2="25" y2="50" stroke={c.collar} strokeWidth="0.8" strokeDasharray="2,2" opacity="0.5" />

      {/* Polka dots */}
      {type === 'polka' && dotPositions.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="white" opacity="0.9" />
      ))}

      {/* Red lantern icon */}
      {type === 'red_lantern' && (
        <text x="25" y="38" textAnchor="middle" fontSize="12" fill={c.text}>🏮</text>
      )}
    </svg>
  );
}

interface TeamJerseyProps {
  primaryColor: string;
  secondaryColor: string;
  size?: number;
  className?: string;
}

export function TeamJersey({ primaryColor, secondaryColor, size = 48, className = '' }: TeamJerseyProps) {
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 50 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Jersey body */}
      <path
        d="M10 15 L0 28 L10 30 L10 52 L40 52 L40 30 L50 28 L40 15 L32 10 C30 18 20 18 18 10 Z"
        fill={primaryColor}
        stroke={secondaryColor}
        strokeWidth="0.5"
      />
      {/* Stripe detail */}
      <path
        d="M25 18 L25 52"
        stroke={secondaryColor}
        strokeWidth="4"
        opacity="0.6"
      />
      {/* Left sleeve */}
      <path
        d="M10 15 L0 28 L10 30 L10 22 Z"
        fill={secondaryColor}
        opacity="0.9"
      />
      {/* Right sleeve */}
      <path
        d="M40 15 L50 28 L40 30 L40 22 Z"
        fill={secondaryColor}
        opacity="0.9"
      />
      {/* Collar */}
      <path
        d="M18 10 C20 18 30 18 32 10 C30 6 20 6 18 10 Z"
        fill={secondaryColor}
      />
    </svg>
  );
}
