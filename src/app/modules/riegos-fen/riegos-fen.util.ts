import { createStgLightTable2Config } from 'app/core/screen/base/stg-table2-presets';

export type RiskLevel = 'Muy Alto' | 'Alto' | 'Medio' | 'Bajo' | 'Muy Bajo';

// Interfaz alineada a los campos que retorna la API/Procedimiento
export interface RiskDistrict {
  cod_ubi: string;
  des_dep: string;
  des_prov: string;
  des_dist: string;
  exp_mas: RiskLevel;
  exp_inu: RiskLevel;
  exp_seq: RiskLevel;
  exp_pre: RiskLevel;
}

export const VALID_RISK_LEVELS: RiskLevel[] = ['Muy Alto', 'Alto', 'Medio', 'Bajo', 'Muy Bajo'];

const riskColors: { [key in RiskLevel]?: { background: string; color: string } } = {
  'Muy Alto': { background: '#f8eceb', color: '#913b36' },
  'Alto': { background: '#faf1e8', color: '#925126' },
  'Medio': { background: '#faf6e7', color: '#75611f' },
  'Bajo': { background: '#f0f5ed', color: '#48683f' },
  'Muy Bajo': { background: '#eaf4ef', color: '#32684f' }
};

function textColumn(label: string, key: keyof RiskDistrict, width: string): any {
  return {
    label,
    key,
    cellStyle: { 'min-width': width, 'padding': '9px 12px', 'color': '#40566a' }
  };
}

function riskColumn(label: string, key: keyof RiskDistrict): any {
  return {
    label,
    key,
    cellStyle: { 'min-width': '118px', 'padding': '9px 12px', 'text-align': 'center' },
    cellStyleFn: (params: { value: RiskLevel }) => {
      const colors = (params && riskColors[params.value]) || { background: '#f1f3f5', color: '#526272' };
      return {
        'background': colors.background,
        'color': colors.color,
        'font-weight': '700'
      };
    }
  };
}

// Configuración de cabeceras alineadas a las claves originales del JSON
export const riskTableHeaders: any[] = [
  textColumn('UBIGEO', 'cod_ubi', '90px'),
  textColumn('Departamento', 'des_dep', '130px'),
  textColumn('Provincia', 'des_prov', '130px'),
  textColumn('Distrito', 'des_dist', '140px'),
  riskColumn('Mov. en masa', 'exp_mas'),
  riskColumn('Inundación', 'exp_inu'),
  riskColumn('Sequía', 'exp_seq'),
  riskColumn('Predominante', 'exp_pre')
];

export const riskTableOptions = createStgLightTable2Config({
  style: {
    'min-width': '970px',
    'font-size': '12px'
  },
  header: {
    style: {
      'background': '#eef2f5',
      'color': '#344b5d',
      'font-size': '10px',
      'letter-spacing': '.04em',
      'text-transform': 'uppercase',
      'text-align': 'left'
    },
    cellStyle: { 'height': '40px', 'padding': '8px 12px' }
  },
  body: {
    loading: { enabled: false },
    hover: { enabled: true, style: { 'background': '#f3f9fc', 'color': '#243044' } },
    selection: { enabled: true, style: { 'background': '#dfeefa', 'color': '#17345f' } },
    cellStyle: { 'height': '38px' }
  }
});

export function sanitizeText(val: unknown): string {
  if (val == null) return '-';
  let str = String(val).trim();
  if (!str) return '-';
  try {
    str = decodeURIComponent(escape(str));
  } catch {
    str = str.replace(/Ã‘/g, 'Ñ').replace(/Ã‘E/g, 'ÑE');
  }
  return str;
}

export function parseRiskLevel(value: unknown): RiskLevel {
  const cleanValue = sanitizeText(value) as RiskLevel;
  return VALID_RISK_LEVELS.indexOf(cleanValue) !== -1 ? cleanValue : 'Bajo';
}

export function parseRiskRow(row: any): RiskDistrict {
  const source = row || {};

  return {
    cod_ubi: sanitizeText(source.cod_ubi != null ? source.cod_ubi : source[0]),
    des_dep: sanitizeText(source.des_dep != null ? source.des_dep : source[1]),
    des_prov: sanitizeText(source.des_prov != null ? source.des_prov : source[2]),
    des_dist: sanitizeText(source.des_dist != null ? source.des_dist : source[3]),
    exp_mas: parseRiskLevel(source.exp_mas != null ? source.exp_mas : source[4]),
    exp_inu: parseRiskLevel(source.exp_inu != null ? source.exp_inu : source[5]),
    exp_seq: parseRiskLevel(source.exp_seq != null ? source.exp_seq : source[6]),
    exp_pre: parseRiskLevel(source.exp_pre != null ? source.exp_pre : source[7])
  };
}
