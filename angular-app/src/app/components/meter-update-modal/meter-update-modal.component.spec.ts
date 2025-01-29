import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterUpdateModalComponent } from './meter-update-modal.component';

describe('MeterUpdateModalComponent', () => {
  let component: MeterUpdateModalComponent;
  let fixture: ComponentFixture<MeterUpdateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeterUpdateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeterUpdateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
