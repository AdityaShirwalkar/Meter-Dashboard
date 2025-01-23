import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeterComponent } from './meter.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Store,StoreModule } from '@ngrx/store';

describe('AppComponent', () => {
  let component: MeterComponent;
  let fixture: ComponentFixture<MeterComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeterComponent,StoreModule.forRoot(provideMockStore)],
      providers: [
        provideMockStore({
          initialState: {
            app: {
              meterData: [],
              loading: false,
              error: null
            }
          }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MeterComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store) as MockStore;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'angular-app' title`, () => {
    expect(component.title).toEqual('angular-app');
  });

  it('should render title', () => {
  const compiled = fixture.nativeElement as HTMLElement;
  expect(compiled.querySelector('h1')?.textContent).toContain('Hello, angular-app');
  });
});