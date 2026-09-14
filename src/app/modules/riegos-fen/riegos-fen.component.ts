import { Component, OnDestroy } from '@angular/core';
import { EMPTY, Subscription } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { ModRepService } from 'app/modules/reportes/compartido/servicios/mod-rep.service';
import { parseRiskRow, RiskDistrict, RiskLevel, riskTableHeaders, riskTableOptions } from './riegos-fen.util';

// 1. Declaramos el tipo ViewState aquí mismo
type ViewState = 'idle' | 'loading' | 'data' | 'empty' | 'error';

@Component({
  selector: 'app-riegos-fen',
  templateUrl: './riegos-fen.component.html',
  styleUrls: ['./riegos-fen.component.scss']
})
export class RiegosFenComponent implements OnDestroy {
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
  searchMessage = '';
  selected: RiskDistrict | null = null;
  
  // 2. Declaramos la variable state con su valor inicial
  state: ViewState = 'idle';
  loading = false;
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

    // 3. Cambiamos el estado a loading al iniciar la consulta
    this.state = 'loading';
    this.loading = true;
    this.rows = [];
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
        // 4. Cambiamos a error si algo falla
        this.errorMessage = 'No se pudo consultar la matriz. Intenta nuevamente.';
        this.state = 'error';
        return EMPTY;
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(rows => {
      this.rows = rows;
      // 5. Asignamos el estado 'data' si hay filas, o 'empty' si no hay nada
      this.state = rows.length > 0 ? 'data' : 'empty';
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
    const data = result && Array.isArray((result as { data?: unknown[] }).data)
      ? (result as { data: unknown[] }).data
      : Array.isArray(result) ? result : [];

    return data.map(row => parseRiskRow(row));
  }
}