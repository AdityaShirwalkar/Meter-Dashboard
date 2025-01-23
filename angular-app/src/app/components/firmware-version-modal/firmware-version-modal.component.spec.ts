import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirwareVersionModalComponent } from './firmware-version-modal.component';

describe('FirwareVersionModalComponent', () => {
  let component: FirwareVersionModalComponent;
  let fixture: ComponentFixture<FirwareVersionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirwareVersionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirwareVersionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
