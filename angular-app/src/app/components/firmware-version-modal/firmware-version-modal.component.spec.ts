import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmwareVersionModalComponent } from './firmware-version-modal.component';

describe('FirwareVersionModalComponent', () => {
  let component: FirmwareVersionModalComponent;
  let fixture: ComponentFixture<FirmwareVersionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirmwareVersionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirmwareVersionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
