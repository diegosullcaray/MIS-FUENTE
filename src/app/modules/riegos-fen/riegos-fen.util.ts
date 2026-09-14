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

  // Propiedades mapeadas opcionales para la tarjeta superior
  ubigeo?: string;
  department?: string;
  province?: string;
  district?: string;
  massRisk?: RiskLevel;
  floodRisk?: RiskLevel;
  droughtRisk?: RiskLevel;
  mainRisk?: RiskLevel;
}

export const VALID_RISK_LEVELS: RiskLevel[] = ['Muy Alto', 'Alto', 'Medio', 'Bajo', 'Muy Bajo'];

const riskColors: { [key in RiskLevel]?: { background: string; color: string } } = {
  'Muy Alto': { background: '#fdebea', color: '#a9221b' },
  'Alto': { background: '#fff0e3', color: '#a94d08' },
  'Medio': { background: '#fff8d9', color: '#6d5700' },
  'Bajo': { background: '#edf8e8', color: '#27601d' },
  'Muy Bajo': { background: '#e6f6ec', color: '#18723d' }
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
      const colors = (params && riskColors[params.value]) || { background: '#f4f6f9', color: '#40566a' };
      return {
        'background': colors.background,
        'color': colors.color,
        'font-weight': '800'
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
  columns: riskTableHeaders,
  headers: riskTableHeaders,
  style: {
    'min-width': '970px',
    'font-size': '12px'
  },
  header: {
    style: {
      'background': '#f8fbfd',
      'color': '#40566a',
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
  const cod_ubi = sanitizeText(row.cod_ubi || row[0]);
  const des_dep = sanitizeText(row.des_dep || row[1]);
  const des_prov = sanitizeText(row.des_prov || row[2]);
  const des_dist = sanitizeText(row.des_dist || row[3]);
  const exp_mas = parseRiskLevel(row.exp_mas || row[4]);
  const exp_inu = parseRiskLevel(row.exp_inu || row[5]);
  const exp_seq = parseRiskLevel(row.exp_seq || row[6]);
  const exp_pre = parseRiskLevel(row.exp_pre || row[7]);

  return {
    cod_ubi,
    des_dep,
    des_prov,
    des_dist,
    exp_mas,
    exp_inu,
    exp_seq,
    exp_pre,
    // Propiedades adicionales para compatibilidad con la vista
    ubigeo: cod_ubi,
    department: des_dep,
    province: des_prov,
    district: des_dist,
    massRisk: exp_mas,
    floodRisk: exp_inu,
    droughtRisk: exp_seq,
    mainRisk: exp_pre
  };
}