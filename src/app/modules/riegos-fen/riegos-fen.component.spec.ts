import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { RiegosFenComponent } from './riegos-fen.component';
import { ModRiegosFenService } from './compartido/servicios/mod-riegos-fen.service';

describe('RiegosFenComponent', () => {
  let component: RiegosFenComponent;
  let fixture: ComponentFixture<RiegosFenComponent>;
  let service: jasmine.SpyObj<ModRiegosFenService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj('ModRiegosFenService', ['getResultados']);
    await TestBed.configureTestingModule({
      declarations: [ RiegosFenComponent ],
      imports: [ FormsModule ],
      providers: [{ provide: ModRiegosFenService, useValue: service }],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiegosFenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should consult a district by ubigeo', () => {
    service.getResultados.and.returnValue(of({ body: { resultado: [{
      cod_ubi: '220901',
      des_dep: 'SAN MARTÍN',
      des_prov: 'SAN MARTÍN',
      des_dist: 'TARAPOTO',
      exp_mas: 'Bajo',
      exp_inu: 'Muy Bajo',
      exp_seq: 'Bajo',
      exp_pre: 'Bajo'
    }] } } as any));
    component.searchValue = '220901';
    component.consult();

    expect(component.selected && component.selected.district).toBe('TARAPOTO');
    expect(service.getResultados).toHaveBeenCalledWith(0, '220901');
  });

  it('should apply all selected filters', () => {
    component.departmentFilter = 'Lima';
    component.districtFilter = 'Chaclacayo';
    component.riskFilter = 'Alto';
    component.applyFilters();

    expect(component.filteredRows.map(row => row.ubigeo)).toEqual(['150108']);
  });
});
