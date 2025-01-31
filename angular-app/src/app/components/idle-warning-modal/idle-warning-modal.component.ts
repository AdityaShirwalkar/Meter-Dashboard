import { inject } from '@angular/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { IdleTimeoutService } from '../../services/idle-timeout.service';
import { Subscription } from 'rxjs';
import { clear } from 'console';

@Component({
  selector: 'app-idle-warning-modal',
  standalone: true,
  imports: [CommonModule,NgIf],
  templateUrl: './idle-warning-modal.component.html',
  styleUrl: './idle-warning-modal.component.css'
})
export class IdleWarningModalComponent implements OnInit,OnDestroy {
  showModal=false;
  private modalSubscription?:Subscription;
  remainingTime:number = 15;
  private countdownInterval:any;

  constructor(private idleTimeoutService:IdleTimeoutService) {}

  ngOnInit() {
    this.modalSubscription = this.idleTimeoutService.showWarningModal$.subscribe(
      show => {
        this.showModal = show;
        if (show) {
          this.startCountdown();
        } else {
          this.stopCountdown();
          this.remainingTime = 30;
        }
      }
    );
  }

  ngOnDestroy(): void {
      this.stopCountdown();
      if(this.modalSubscription) {
        this.modalSubscription.unsubscribe();
      }
  }

  private startCountdown() {
    this.countdownInterval = setInterval(()=>{
      this.remainingTime--;
      if(this.remainingTime<=0) {
        this.stopCountdown();
        this.logout();
      }
    },1000);
  }

  private stopCountdown() {
    if(this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }
  }

  stay() {
    this.idleTimeoutService.stayActive();
  }

  logout() {
    this.idleTimeoutService.logout();
  }

}
