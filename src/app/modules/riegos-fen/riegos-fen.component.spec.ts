import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiegosFenComponent } from './riegos-fen.component';

describe('RiegosFenComponent', () => {
  let component: RiegosFenComponent;
  let fixture: ComponentFixture<RiegosFenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RiegosFenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiegosFenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
