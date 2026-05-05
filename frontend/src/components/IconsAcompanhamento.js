export const IconDownload = ({ size = 20, color = '#1976d2', title = 'Download' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }} title={title}>
    <path d="M12 4v12" stroke={color} strokeWidth="2"/>
    <path d="M6 14l6 6 6-6" stroke={color} strokeWidth="2" fill="none"/>
    <rect x="4" y="20" width="16" height="2" rx="1" fill={color} />
  </svg>
);
// Ícones SVG para uso nos botões
export const IconEye = ({ size = 20, color = '#888', title = 'Ocultar ano' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }} title={title}>
    <path d="M1 12C3.5 7 8 4 12 4c4 0 8.5 3 11 8-2.5 5-7 8-11 8-4 0-8.5-3-11-8z" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none"/>
  </svg>
);

export const IconEyeOff = ({ size = 20, color = '#888', title = 'Exibir ano' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }} title={title}>
    <path d="M1 12C3.5 7 8 4 12 4c4 0 8.5 3 11 8-2.5 5-7 8-11 8-4 0-8.5-3-11-8z" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none"/>
    <line x1="3" y1="21" x2="21" y2="3" stroke={color} strokeWidth="2"/>
  </svg>
);

export const IconPower = ({ size = 20, color = '#d32f2f', title = 'Desligar ano' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }} title={title}>
    <path d="M12 2v10" stroke={color} strokeWidth="2"/>
    <circle cx="12" cy="14" r="8" stroke={color} strokeWidth="2" fill="none"/>
  </svg>
);

export const IconPowerOn = ({ size = 20, color = '#388e3c', title = 'Reativar ano' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }} title={title}>
    <path d="M12 2v10" stroke={color} strokeWidth="2"/>
    <circle cx="12" cy="14" r="8" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="12" cy="14" r="3" fill={color}/>
  </svg>
);
