import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmwareModalComponent } from './firmware-modal.component';

describe('FirmwareModalComponent', () => {
  let component: FirmwareModalComponent;
  let fixture: ComponentFixture<FirmwareModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirmwareModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirmwareModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
