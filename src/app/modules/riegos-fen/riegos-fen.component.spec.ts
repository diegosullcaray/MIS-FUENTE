import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
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
      providers: [{ provide: ModRiegosFenService, useValue: service }]
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
    service.getResultados.and.returnValue(of({ body: { resultado: [[
      '220901', 'San Martín', 'San Martín', 'Tarapoto', 'Bajo', 'Muy Bajo', 'Bajo', 'Bajo'
    ]] } } as any));
    component.searchValue = '220901';
    component.consult();

    expect(component.selected.district).toBe('Tarapoto');
    expect(service.getResultados).toHaveBeenCalledWith(0, '220901');
  });

  it('should apply all selected filters', () => {
    component.rows = [
      { ubigeo: '150108', department: 'Lima', province: 'Lima', district: 'Chaclacayo', massRisk: 'Alto', floodRisk: 'Alto', droughtRisk: 'Bajo', mainRisk: 'Alto' } as any
    ];
    component.departmentFilter = 'Lima';
    component.districtFilter = 'Chaclacayo';
    component.riskFilter = 'Alto';
    component.applyFilters();

    expect(component.filteredRows.map(row => row.ubigeo)).toEqual(['150108']);
  });
});
