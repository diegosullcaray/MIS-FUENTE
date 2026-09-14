import { Component } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { ModRiegosFenService } from './compartido/servicios/mod-riegos-fen.service';
import { RiskDistrict, RiskLevel, riskTableHeaders, riskTableOptions } from './riegos-fen.util';

@Component({
  selector: 'app-riegos-fen',
  templateUrl: './riegos-fen.component.html',
  styleUrls: ['./riegos-fen.component.scss']
})
export class RiegosFenComponent {
  readonly tableHeaders = riskTableHeaders;
  readonly tableOptions = riskTableOptions;
  readonly searchOptions: Array<{ col: 0 | 1 | 2 | 3; label: string }> = [
    { col: 0, label: 'UBIGEO' },
    { col: 1, label: 'departamento' },
    { col: 2, label: 'provincia' },
    { col: 3, label: 'distrito' }
  ];
  rows: RiskDistrict[] = [];

  searchColumn: 0 | 1 | 2 | 3 = 0;
  searchValue = '';
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

  get riskLevels(): RiskLevel[] {
    return this.unique(this.rows.map(row => row.mainRisk)) as RiskLevel[];
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
    return ['Ingrese el código', 'Ingrese el departamento', 'Ingrese la provincia', 'Ingrese el distrito'][this.searchColumn];
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
      this.filteredRows = rows.map(row => ({ ...row }));
      this.selected = null;
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
      (!this.riskFilter || row.mainRisk === this.riskFilter))
      .map(row => ({ ...row }));
    this.selected = null;
  }

  selectRow(row: RiskDistrict): void {
    this.selected = row;
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
    if (['Muy Alto', 'Alto', 'Medio', 'Bajo', 'Muy Bajo'].indexOf(risk) === -1) {
      throw new Error('Nivel de riesgo inválido de REXPAGRO01');
    }
    return risk;
  }
}
