import { Component, OnDestroy, OnInit } from '@angular/core';
import { EMPTY, Subscription } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { ModRepService } from 'app/modules/reportes/compartido/servicios/mod-rep.service';
import {
  parseRiskRow,
  RiskDistrict,
  RiskLevel,
  riskTableHeaders,
  riskTableOptions
} from './riegos-fen.util';

@Component({
  selector: 'app-riegos-fen',
  templateUrl: './riegos-fen.component.html',
  styleUrls: ['./riegos-fen.component.scss']
})
export class RiegosFenComponent implements OnInit, OnDestroy {
  readonly tableHeaders = riskTableHeaders;
  tableOptions = { ...riskTableOptions };

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
  selected: RiskDistrict | null = null;
  loading = false;
  errorMessage = '';
  departmentFilter = '';
  provinceFilter = '';
  districtFilter = '';
  riskFilter = '';
  filteredRows: RiskDistrict[] = [];

  private reportSubscription!: Subscription;

  constructor(private antRep: ModRepService) { }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    if (this.reportSubscription) {
      this.reportSubscription.unsubscribe();
    }
  }

  get searchColumnLabel(): string {
    return ['Código UBIGEO', 'Departamento', 'Provincia', 'Distrito'][this.searchColumn];
  }

  get searchPlaceholder(): string {
    return ['Ingrese el código', 'Ingrese el departamento', 'Ingrese la provincia', 'Ingrese el distrito'][this.searchColumn];
  }

  get departments(): string[] {
    return this.unique(this.rows.map(row => row.des_dep || row.department || ''));
  }

  get riskLevels(): RiskLevel[] {
    return this.unique(this.rows.map(row => row.exp_pre || row.mainRisk || '')) as RiskLevel[];
  }

  get provinces(): string[] {
    return this.unique(
      this.rows
        .filter(row => !this.departmentFilter || (row.des_dep || row.department) === this.departmentFilter)
        .map(row => row.des_prov || row.province || '')
    );
  }

  get districts(): string[] {
    return this.unique(
      this.rows
        .filter(row => !this.departmentFilter || (row.des_dep || row.department) === this.departmentFilter)
        .filter(row => !this.provinceFilter || (row.des_prov || row.province) === this.provinceFilter)
        .map(row => row.des_dist || row.district || '')
    );
  }

  setSearchColumn(column: 0 | 1 | 2 | 3): void {
    this.searchColumn = column;
    this.searchValue = '';
    this.searchMessage = column === 0
      ? 'Ingresa los 6 dígitos del código UBIGEO.'
      : `Escribe el nombre de ${this.searchColumnLabel.toLocaleLowerCase('es')}.`;
  }

  consult(): void {
    const term = this.searchValue.trim();
    if (!term) {
      this.searchMessage = 'Ingresa un valor para realizar la consulta.';
      return;
    }

    if (this.reportSubscription) {
      this.reportSubscription.unsubscribe();
    }

    this.loading = true;
    this.errorMessage = '';
    this.searchMessage = 'Consultando la matriz CENEPRED…';

    this.reportSubscription = this.antRep.getRegularTableResult('CON_AGRO_FEN', {
      col: this.searchColumn,
      val: term
    }).pipe(
      take(1),
      map(response => {
        const result = response && response.body && response.body.resultado;
        const rawData = result && Array.isArray(result.data) ? result.data : result;
        return this.readRows(rawData);
      }),
      catchError(error => {
        console.error('Error al consultar matriz CENEPRED:', error);
        this.rows = [];
        this.updateTableData([]);
        this.selected = null;
        this.errorMessage = 'No se pudo consultar la matriz. Intenta nuevamente.';
        return EMPTY;
      }),
      finalize(() => this.loading = false)
    ).subscribe(rows => {
      this.rows = rows;
      this.updateTableData(rows);
      
      // FIX 1: Se mantiene en null para NO seleccionar automáticamente la primera fila
      this.selected = null; 

      this.searchMessage = rows.length
        ? 'Consulta completada con la matriz CENEPRED.'
        : 'No se encontraron distritos para la búsqueda.';
    });
  }

  applyFilters(): void {
    const filtered = this.rows.filter(row => {
      const dep = row.des_dep || row.department;
      const prov = row.des_prov || row.province;
      const dist = row.des_dist || row.district;
      const risk = row.exp_pre || row.mainRisk;

      return (!this.departmentFilter || dep === this.departmentFilter) &&
        (!this.provinceFilter || prov === this.provinceFilter) &&
        (!this.districtFilter || dist === this.districtFilter) &&
        (!this.riskFilter || risk === this.riskFilter);
    });

    this.updateTableData(filtered);
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
    }[level] || 'low';
  }

  // FIX 2: Recreación completa de las opciones e inyección directa de datos cargados
  private updateTableData(data: RiskDistrict[]): void {
    this.filteredRows = data.map(row => ({ ...row }));
    
    this.tableOptions = Object.assign({}, riskTableOptions, {
      data: [...this.filteredRows],
      dataSource: [...this.filteredRows]
    });
  }

  private unique(values: string[]): string[] {
    return Array.from(new Set(values.filter(v => !!v && v !== '-')));
  }

  private readRows(data: unknown): RiskDistrict[] {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map(item => parseRiskRow(item));
  }
}