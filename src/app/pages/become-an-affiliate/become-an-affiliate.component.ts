import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/shared/services/user.service';

import { Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-become-an-affiliate',
  templateUrl: './become-an-affiliate.component.html',
  styleUrl: './become-an-affiliate.component.scss'
})
export class BecomeAnAffiliateComponent {
  contactForm: FormGroup;
  submitted = false;
  loading = false;

  userOtp;
  otpTimerstatus: boolean = false;
  countDown: Subscription;
  tick = 1000;
  counter = 196;
  callForOtp = false;
  getOtpVal: any;
  otpValid: boolean = true;
  isValid: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserService, private toaster: ToastrService, private router: Router) {
    this.contactForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]]
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  showDiv = {
    affiliateDiv: true,
    otp: false,
  }

  onOtpChange(ele) {
    this.userOtp = ele;
  }

  otpTimer() {
    this.countDown = timer(0, this.tick)
      .pipe(take(this.counter))
      .subscribe(() => {
        if (this.counter > 0) {
          --this.counter;
        }
        else {
          this.countDown.unsubscribe();
        }
      });
  }

  stopOtpTimer() {
    if (this.countDown) {
      this.countDown.unsubscribe();
      this.countDown = null;
    }
    this.otpTimerstatus = false;
  }

  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return (
      ('00' + minutes).slice(-2) +
      ':' +
      ('00' + Math.floor(value - minutes * 60)).slice(-2)
    );
  }

  onSubmit() {
    this.submitted = true;

    if (this.contactForm.invalid) {
      this.loading = false;
      return;
    }

    this.loading = true;

    // If OTP has already been requested, do not attempt to resend until user completes flow.
    if (this.callForOtp) {
      this.loading = false;
      return;
    }

    const payload = this.contactForm.value;
    console.log('Sending contact form data:', payload);

    if (this.callForOtp == false) {
      let otpObj =
      {
        'name': payload.name,
        'email': payload.email,
        'type': 'Affiliate'
      }

      this.userService.genOtpPages(otpObj).subscribe(
        res => {
          if (res['error'] == 0) {
            this.loading = false;
            this.counter = 196;
            this.otpTimerstatus = true;
            this.otpTimer();

            this.callForOtp = true;
            this.showDiv.otp = true;
            this.showDiv.affiliateDiv = false;
            this.getOtpVal = res['data'].otpValue;
            this.toaster.success('OTP has been sent to your registered email. Please check.');
          }
        },
        error => {
          this.loading = false;
          this.toaster.error(error.error.message)
          this.showDiv.affiliateDiv = true;
          this.showDiv.otp = false;
        });
    }

  }



  otpverify() {

    if (this.userOtp) {
      let formData = this.contactForm.value;

      let data = {
        'name': formData.name,
        'email': formData.email,
        'description': formData.description,
        'otp': this.userOtp
      }

      this.userService.sendAffiliateMail(data).subscribe({
        next: (res) => {
          this.stopOtpTimer();

          this.contactForm.reset();
          this.submitted = false;
          console.log('Response from sendAffiliateMail:', res);
          this.toaster.success('Affiliate mail sent successfully');
          this.otpValid = true;
          this.isValid = true;
          this.callForOtp = false;
          this.showDiv.affiliateDiv = true;
          this.showDiv.otp = false;


        },
        error: () => {
          this.toaster.error('Invalid OTP. Please try again.')
          this.otpValid = false;
        }
      });

    } else {
      this.toaster.error('Please enter the OTP first.')
      // this.otpMassage="Please enter OTP first";
      this.otpValid = false;
    }
  }

  otpresend() {
    let formData = this.contactForm.value;

    let otpObj =
    {
      'name': formData.name,
      'email': formData.email,
      'type': 'Affiliate'
    }

    this.userService.genOtpPages(otpObj).subscribe(
      res => {
        if (res['error'] == 0) {
          this.counter = 196;
          this.otpTimerstatus = true;
          this.otpTimer();

          this.callForOtp = true;
          this.showDiv.otp = true;
          this.showDiv.affiliateDiv = false;
          this.getOtpVal = res['data'].otpValue;
          this.toaster.success('OTP has been sent to your registered email. Please check.');
        }
      },
      error => {
        this.toaster.error(error.error.message)
        this.showDiv.affiliateDiv = true;
        this.showDiv.otp = false;
      });
  }











}
