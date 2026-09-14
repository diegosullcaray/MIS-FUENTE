import { createStgLightTable2Config } from 'app/core/screen/base/stg-table2-presets';

export type RiskLevel = 'Muy Alto' | 'Alto' | 'Medio' | 'Bajo' | 'Muy Bajo';

export interface RiskDistrict {
  ubigeo: string;
  department: string;
  province: string;
  district: string;
  massRisk: RiskLevel;
  floodRisk: RiskLevel;
  droughtRisk: RiskLevel;
  mainRisk: RiskLevel;
}

const riskColors: { [key: string]: { background: string; color: string } } = {
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
      const colors = riskColors[params && params.value] || { background: '#f4f6f9', color: '#40566a' };
      return {
        'background': colors.background,
        'color': colors.color,
        'font-weight': '800'
      };
    }
  };
}

export const riskTableHeaders: any[] = [
  textColumn('UBIGEO', 'ubigeo', '90px'),
  textColumn('Departamento', 'department', '130px'),
  textColumn('Provincia', 'province', '130px'),
  textColumn('Distrito', 'district', '140px'),
  riskColumn('Mov. en masa', 'massRisk'),
  riskColumn('Inundación', 'floodRisk'),
  riskColumn('Sequía', 'droughtRisk'),
  riskColumn('Predominante', 'mainRisk')
];

export const riskTableOptions = createStgLightTable2Config({
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
