import { Component, OnDestroy } from '@angular/core';
import { EMPTY, Subscription } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { ModRepService } from 'app/modules/reportes/compartido/servicios/mod-rep.service';
import { parseRiskRow, RiskDistrict, RiskLevel, riskTableHeaders, riskTableOptions } from './riegos-fen.util';

type ViewState = 'idle' | 'loading' | 'empty' | 'data' | 'error';

@Component({
  selector: 'app-riegos-fen',
  templateUrl: './riegos-fen.component.html',
  styleUrls: ['./riegos-fen.component.scss']
})
export class RiegosFenComponent implements OnDestroy {
  tableHeaders: any[] = [];
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
  searchMessage = '';
  selected: RiskDistrict | null = null;
  state: ViewState = 'idle';
  errorMessage = '';

  private reportSubscription?: Subscription;

  constructor(private antRep: ModRepService) { }

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

  get loading(): boolean {
    return this.state === 'loading';
  }

  setSearchColumn(column: 0 | 1 | 2 | 3): void {
    this.searchColumn = column;
    this.searchValue = '';
    this.searchMessage = '';
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

    this.state = 'loading';
    this.rows = [];
    this.tableHeaders = [];
    this.selected = null;
    this.errorMessage = '';
    this.searchMessage = '';

    this.reportSubscription = this.antRep.getRegularTableResult('CON_AGRO_FEN', {
      col: this.searchColumn,
      val: term
    }).pipe(
      take(1),
      map(response => this.readRows(response && response.body && response.body.resultado)),
      catchError(() => {
        this.rows = [];
        this.selected = null;
        this.state = 'error';
        this.errorMessage = 'No se pudo consultar la matriz. Intenta nuevamente.';
        this.state = 'error';
        return EMPTY;
      }),
      finalize(() => {
        if (this.state === 'loading') {
          this.state = this.rows.length ? 'data' : 'empty';
        }
      })
    ).subscribe(rows => {
      this.tableHeaders = riskTableHeaders.map(header => ({ ...header }));
      this.rows = rows;
      this.state = rows.length ? 'data' : 'empty';
      this.searchMessage = rows.length ? '' : 'No se encontraron distritos para la búsqueda.';
    });
  }

  selectRow(row: RiskDistrict): void {
    this.selected = row;
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

  private readRows(result: unknown): RiskDistrict[] {
    if (!result || !Array.isArray((result as { data?: unknown[] }).data)) {
      throw new Error('Respuesta inválida de CON_AGRO_FEN');
    }
    const data = (result as { data: unknown[] }).data;

    return data.map(row => parseRiskRow(row));
  }
}
