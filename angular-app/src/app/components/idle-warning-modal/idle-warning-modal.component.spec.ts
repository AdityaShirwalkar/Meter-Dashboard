import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdleWarningModalComponent } from './idle-warning-modal.component';

describe('IdleWarningModalComponent', () => {
  let component: IdleWarningModalComponent;
  let fixture: ComponentFixture<IdleWarningModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdleWarningModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdleWarningModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
