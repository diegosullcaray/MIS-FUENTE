import { Component } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { ModRiegosFenService } from './compartido/servicios/mod-riegos-fen.service';

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
  readonly searchOptions: Array<{ col: 0 | 1 | 2 | 3; label: string }> = [
    { col: 0, label: 'UBIGEO' },
    { col: 1, label: 'departamento' },
    { col: 2, label: 'provincia' },
    { col: 3, label: 'distrito' }
  ];
  rows: RiskDistrict[] = [];

  searchColumn: 0 | 1 | 2 | 3 = 0;
  searchValue = '150101';
  searchMessage = 'Ingresa los 6 dígitos del código UBIGEO.';
  selected: RiskDistrict = null;
  loading = false;
  errorMessage = '';
  departmentFilter = '';
  provinceFilter = '';
  districtFilter = '';
  riskFilter = '';
  filteredRows: RiskDistrict[] = [...this.rows];

  constructor(private riesgosFenService: ModRiegosFenService) { }

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

  setSearchColumn(column: 0 | 1 | 2 | 3): void {
    this.searchColumn = column;
    this.searchValue = '';
    this.searchMessage = column === 0
      ? 'Ingresa los 6 dígitos del código UBIGEO.'
      : `Escribe el nombre de ${this.searchColumnLabel.toLocaleLowerCase('es')}.`;
  }

  get searchColumnLabel(): string {
    return ['Código UBIGEO', 'Departamento', 'Provincia', 'Distrito'][this.searchColumn];
  }

  get searchPlaceholder(): string {
    return ['Ej. 150101', 'Ej. Lima', 'Ej. Lima', 'Ej. Tarapoto'][this.searchColumn];
  }

  consult(): void {
    const term = this.searchValue.trim();
    if (!term) {
      this.searchMessage = 'Ingresa un valor para realizar la consulta.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.searchMessage = 'Consultando la matriz CENEPRED…';
    this.riesgosFenService.getResultados(this.searchColumn, term).pipe(
      take(1),
      map(response => this.readRows(response && response.body && response.body.resultado)),
      catchError(() => {
        this.rows = [];
        this.filteredRows = [];
        this.selected = null;
        this.errorMessage = 'No se pudo consultar la matriz. Intenta nuevamente.';
        return EMPTY;
      }),
      finalize(() => this.loading = false)
    ).subscribe(rows => {
      this.rows = rows;
      this.filteredRows = [...rows];
      this.selected = rows[0] || null;
      this.searchMessage = rows.length
        ? 'Consulta completada con la matriz CENEPRED.'
        : 'No se encontraron distritos para la búsqueda.';
    });
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

  private readRows(result: unknown): RiskDistrict[] {
    const data = Array.isArray(result)
      ? result
      : result && Array.isArray((result as { data?: unknown[] }).data)
        ? (result as { data: unknown[] }).data
        : null;

    if (!data) {
      throw new Error('Respuesta inválida de REXPAGRO01');
    }

    return data.map(item => {
      if (!Array.isArray(item) || item.length < 8) {
        throw new Error('Fila inválida de REXPAGRO01');
      }
      return {
        ubigeo: String(item[0] == null ? '' : item[0]),
        department: String(item[1] == null ? '' : item[1]),
        province: String(item[2] == null ? '' : item[2]),
        district: String(item[3] == null ? '' : item[3]),
        massRisk: this.readRisk(item[4]),
        floodRisk: this.readRisk(item[5]),
        droughtRisk: this.readRisk(item[6]),
        mainRisk: this.readRisk(item[7])
      };
    });
  }

  private readRisk(value: unknown): RiskLevel {
    const risk = String(value == null ? '' : value) as RiskLevel;
    if (this.riskLevels.indexOf(risk) === -1) {
      throw new Error('Nivel de riesgo inválido de REXPAGRO01');
    }
    return risk;
  }
}
