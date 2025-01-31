import { Injectable, OnDestroy } from '@angular/core';
import { fromEvent, Subject, timer, Subscription, merge } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IdleTimeoutService implements OnDestroy {
  private readonly TIMEOUT_DURATION = 5 * 60 * 1000;
  private readonly WARNING_DURATION = 15 * 1000;

  private destroy$ = new Subject<void>();
  private timeoutSubscription?: Subscription;
  private warningSubscription?: Subscription;
  private userActivitySubscription?: Subscription;

  private showWarningModal = new BehaviorSubject<boolean>(false);
  showWarningModal$ = this.showWarningModal.asObservable();

  private userEvents = [
    'mousemove',
    'keydown',
    'click',
    'touchstart',
    'scroll',
    'wheel',
  ];

  constructor(private authService: AuthService, private router: Router) {}

  startWatching():void {
    //merge activity events
    const userActivity$ = merge(
      ...this.userEvents.map((eventName) => fromEvent (document, eventName))
    ).pipe(
      debounceTime(100)
    );

    this.userActivitySubscription = userActivity$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(()=>{
      if(this.showWarningModal.value) {
        this.hideWarning();
      }
      this.resetTimer();
    });
    this.startTimer();
  }

  private startTimer() :void{
    this.clearTimers();
    this,this.warningSubscription = timer(this.TIMEOUT_DURATION-this.WARNING_DURATION).pipe(
      takeUntil(this.destroy$)
    ).subscribe(()=> {
      this.showWarning();
    });
    this.timeoutSubscription = timer(this.TIMEOUT_DURATION).pipe(
      takeUntil(this.destroy$)
    ).subscribe(()=>{
      this.logout();
    });
  }

  private showWarning(): void {
    this.showWarningModal.next(true);
  }

  private hideWarning(): void {
    this.showWarningModal.next(false);
  }

  private resetTimer(): void {
    this.startTimer();
  }

  private clearTimers():void {
    if(this.timeoutSubscription) {
      this.timeoutSubscription.unsubscribe();
    }
    if(this.warningSubscription) {
      this.warningSubscription.unsubscribe();
    }
  }

  stayActive():void{
    this.hideWarning();
    this.resetTimer();
  }

  logout(): void{
    this.hideWarning();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  stopWatching():void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearTimers();
    if(this.userActivitySubscription) {
      this.userActivitySubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
      this.stopWatching();
  }
}
