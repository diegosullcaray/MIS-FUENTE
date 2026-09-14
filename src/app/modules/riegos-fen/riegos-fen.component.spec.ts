import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

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
      imports: [ FormsModule ]
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
    component.searchValue = '220901';
    component.consult();

    expect(component.selected.district).toBe('Tarapoto');
  });

  it('should apply all selected filters', () => {
    component.departmentFilter = 'Lima';
    component.districtFilter = 'Chaclacayo';
    component.riskFilter = 'Alto';
    component.applyFilters();

    expect(component.filteredRows.map(row => row.ubigeo)).toEqual(['150108']);
  });
});
