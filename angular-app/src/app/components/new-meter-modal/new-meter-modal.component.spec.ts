import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMeterModalComponent } from './new-meter-modal.component';

describe('NewMeterModalComponent', () => {
  let component: NewMeterModalComponent;
  let fixture: ComponentFixture<NewMeterModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewMeterModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewMeterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
