import { Component } from '@angular/core';

type SearchMode = 'ubigeo' | 'district';
type RiskLevel = 'Muy Alto' | 'Alto' | 'Medio' | 'Bajo' | 'Muy Bajo';

interface RiskDistrict {
  ubigeo: string;
  department: string;
  province: string;
  district: string;
  massRisk: RiskLevel;
  floodRisk: RiskLevel;
  droughtRisk: RiskLevel;
  mainRisk: RiskLevel;
}

@Component({
  selector: 'app-riegos-fen',
  templateUrl: './riegos-fen.component.html',
  styleUrls: ['./riegos-fen.component.scss']
})
export class RiegosFenComponent {
  readonly updatedAt = '12 set. 2026';
  readonly riskLevels: RiskLevel[] = ['Muy Alto', 'Alto', 'Medio', 'Bajo', 'Muy Bajo'];
  readonly rows: RiskDistrict[] = [
    { ubigeo: '150101', department: 'Lima', province: 'Lima', district: 'Lima', massRisk: 'Muy Alto', floodRisk: 'Alto', droughtRisk: 'Medio', mainRisk: 'Muy Alto' },
    { ubigeo: '150108', department: 'Lima', province: 'Lima', district: 'Chaclacayo', massRisk: 'Alto', floodRisk: 'Alto', droughtRisk: 'Bajo', mainRisk: 'Alto' },
    { ubigeo: '040101', department: 'Arequipa', province: 'Arequipa', district: 'Arequipa', massRisk: 'Medio', floodRisk: 'Bajo', droughtRisk: 'Medio', mainRisk: 'Medio' },
    { ubigeo: '080101', department: 'Cusco', province: 'Cusco', district: 'Cusco', massRisk: 'Muy Alto', floodRisk: 'Medio', droughtRisk: 'Bajo', mainRisk: 'Muy Alto' },
    { ubigeo: '220901', department: 'San Martín', province: 'San Martín', district: 'Tarapoto', massRisk: 'Bajo', floodRisk: 'Muy Bajo', droughtRisk: 'Bajo', mainRisk: 'Bajo' }
  ];

  searchMode: SearchMode = 'ubigeo';
  searchValue = '150101';
  searchMessage = 'Ingresa los 6 dígitos del código UBIGEO.';
  selected: RiskDistrict = this.rows[0];
  departmentFilter = '';
  provinceFilter = '';
  districtFilter = '';
  riskFilter = '';
  filteredRows: RiskDistrict[] = [...this.rows];

  get departments(): string[] {
    return this.unique(this.rows.map(row => row.department));
  }

  get provinces(): string[] {
    return this.unique(this.rows
      .filter(row => !this.departmentFilter || row.department === this.departmentFilter)
      .map(row => row.province));
  }

  get districts(): string[] {
    return this.unique(this.rows
      .filter(row => !this.departmentFilter || row.department === this.departmentFilter)
      .filter(row => !this.provinceFilter || row.province === this.provinceFilter)
      .map(row => row.district));
  }

  setSearchMode(mode: SearchMode): void {
    this.searchMode = mode;
    this.searchValue = '';
    this.searchMessage = mode === 'ubigeo'
      ? 'Ingresa los 6 dígitos del código UBIGEO.'
      : 'Escribe el nombre exacto del distrito.';
  }

  consult(): void {
    const term = this.searchValue.trim().toLocaleLowerCase('es');
    const match = this.rows.find(row => this.searchMode === 'ubigeo'
      ? row.ubigeo === term
      : row.district.toLocaleLowerCase('es') === term);

    if (!match) {
      this.searchMessage = 'No se encontró el distrito. Verifica el código o nombre ingresado.';
      return;
    }

    this.selected = match;
    this.searchMessage = 'Consulta completada con la matriz CENEPRED.';
  }

  applyFilters(): void {
    this.filteredRows = this.rows.filter(row =>
      (!this.departmentFilter || row.department === this.departmentFilter) &&
      (!this.provinceFilter || row.province === this.provinceFilter) &&
      (!this.districtFilter || row.district === this.districtFilter) &&
      (!this.riskFilter || row.mainRisk === this.riskFilter));
  }

  onDepartmentChange(): void {
    this.provinceFilter = '';
    this.districtFilter = '';
  }

  onProvinceChange(): void {
    this.districtFilter = '';
  }

  riskClass(level: RiskLevel): string {
    return {
      'Muy Alto': 'very-high',
      'Alto': 'high',
      'Medio': 'medium',
      'Bajo': 'low',
      'Muy Bajo': 'very-low'
    }[level];
  }

  exportCsv(): void {
    const headers = ['Ubigeo', 'Departamento', 'Provincia', 'Distrito', 'Mov. en masa', 'Inundación', 'Sequía', 'Predominante'];
    const values = this.filteredRows.map(row => [row.ubigeo, row.department, row.province, row.district, row.massRisk, row.floodRisk, row.droughtRisk, row.mainRisk]);
    const csv = [headers, ...values]
      .map(columns => columns.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'matriz-riesgos-cenepred.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  print(): void {
    window.print();
  }

  trackByUbigeo(_: number, row: RiskDistrict): string {
    return row.ubigeo;
  }

  private unique(values: string[]): string[] {
    return Array.from(new Set(values));
  }
}
