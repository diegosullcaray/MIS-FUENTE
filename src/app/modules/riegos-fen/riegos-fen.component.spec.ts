import { of } from 'rxjs';
import { StgTable2Component } from 'app/core/screen/components/stg-table2/stg-table2.component';
import { RiegosFenComponent } from './riegos-fen.component';

describe('RiegosFenComponent', () => {
  const backendRow = {
    cod_ubi: '090103',
    des_dep: 'HUANCAVELICA',
    des_prov: 'HUANCAVELICA',
    des_dist: 'ACORIA',
    exp_mas: 'Alto',
    exp_inu: 'Bajo',
    exp_seq: 'Alto',
    exp_pre: 'Alto'
  };

  function createComponent(): { component: RiegosFenComponent; service: jasmine.SpyObj<any> } {
    const service = jasmine.createSpyObj('ModRepService', ['getRegularTableResult']);
    const component = new RiegosFenComponent(service);
    return { component, service };
  }

  it('loads resultado.data and exposes all columns to stg-table2', () => {
    const { component, service } = createComponent();
    service.getRegularTableResult.and.returnValue(of({
      code: 'SUCCESS',
      body: { resultado: { headers: '', data: [backendRow] } }
    }));
    component.searchValue = 'ACORIA';

    component.consult();

    expect(component.state).toBe('data');
    expect(component.rows).toEqual([backendRow as any]);
    expect(component.tableHeaders.map(header => header.key)).toEqual([
      'cod_ubi', 'des_dep', 'des_prov', 'des_dist',
      'exp_mas', 'exp_inu', 'exp_seq', 'exp_pre'
    ]);
  });

  it('provides eight columns and one row to the shared table lifecycle', () => {
    const { component, service } = createComponent();
    service.getRegularTableResult.and.returnValue(of({
      code: 'SUCCESS',
      body: { resultado: { headers: '', data: [backendRow] } }
    }));
    component.searchValue = '090103';
    component.consult();

    const table = new StgTable2Component(
      { bypassSecurityTrustHtml: (value: string) => value } as any,
      { detectChanges: () => undefined } as any
    );
    table.options = component.tableOptions;
    table.headers = component.tableHeaders;
    table.dataSource = component.rows;
    table.ngOnChanges({
      headers: { currentValue: component.tableHeaders } as any,
      dataSource: { currentValue: component.rows } as any
    });
    table.ngOnInit();

    expect((table as any).rowDef.length).toBe(8);
    expect(table.dataSourceTable.data.length).toBe(1);
    expect(table.dataSourceTable.data[0].des_dist).toBe('ACORIA');
  });

  it('keeps KPI hidden until the user selects a row', () => {
    const { component, service } = createComponent();
    service.getRegularTableResult.and.returnValue(of({
      code: 'SUCCESS',
      body: { resultado: { headers: '', data: [backendRow] } }
    }));
    component.searchValue = '090103';

    component.consult();
    expect(component.selected).toBeNull();

    component.selectRow(component.rows[0]);
    expect(component.selected && component.selected.cod_ubi).toBe('090103');
    expect(component.selected && component.selected.exp_pre).toBe('Alto');
  });
});
