import { ToastrService } from 'ngx-toastr';
import { PasswordStrengthValidator } from './../../../password-strength.validators';
import { UserService } from 'src/app/shared/services/user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { json } from 'express';
import Validation from '../utils/validation';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  public openDashboard: boolean = false;
  userName: string = "";
  userEmail: string = "";
  userPhone: string = "";
  userData: JSON;
  form: FormGroup;
  isValid: boolean = false;
  signupMassage: string = "";
  changePasswordFormStatus: boolean = true;
  @ViewChild('userPassword', { static: true }) userPassword: ElementRef;

  constructor(private router: Router, private userservice: UserService, private toastr: ToastrService) {

  }

  ngOnInit(): void {
    this.form = new FormGroup({
      'oldPassword': new FormControl(null, [Validators.required]),
      'newPassword': new FormControl(null, [Validators.required, Validators.minLength(8), Validators.maxLength(15), PasswordStrengthValidator]),
      'confirmPassword': new FormControl(null, [Validators.required]),
    },
      {
        validators: [Validation.match('newPassword', 'confirmPassword')]
      }
    )

    this.debounce(this.userPassword.nativeElement, 'keyup').subscribe(val => {
      this.samepasswordcheck(val);
    });

  }

  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }

  get oldPassword() { return this.form.get('oldPassword'); }
  get newPassword() { return this.form.get('newPassword'); }
  get confirmPassword() { return this.form.get('confirmPassword'); }

  logout() {
    this.userservice.logout();
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    let formData = this.form.value;
    let EdData = {
      "old_Password": formData.oldPassword.trim(),
      "new_Password": formData.newPassword.trim(),
      "confirm_Password": formData.confirmPassword.trim()
    }
    if (this.changePasswordFormStatus) {
      this.userservice.changePassword(EdData).subscribe(
        res => {
          this.toastr.success('Your password has been changed successfully.')
          setTimeout(() => {
            this.router.navigate(['/dashboard'])
          }, 2000)
        },
        error => {
          // .... HANDLE ERROR HERE 
          this.toastr.error(error.error.message)
        }
      )
    } else {
      this.toastr.error('Please use a different password. This password has already been used.')
    }
  }


  handleEnter(event: KeyboardEvent, nextElementId?: string): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (nextElementId) {
        const nextElement = document.getElementById(nextElementId);
        if (nextElement) {
          nextElement.focus();
        }
      } else {
        // If no next element id is provided, submit the form
          this.onSubmit();
      }
    }
  }

  samepasswordcheck(data: any) {
    let passwordObj =
    {
      current_Password: data
    }

    this.userservice.samepasswordcheck(passwordObj).subscribe(
      res => {
        this.changePasswordFormStatus = true;
      },
      error => {
        this.changePasswordFormStatus = false;
        this.toastr.error(error.error.message)
      }
    )

  }

  debounce(element, event, time = 800) {
    const eventObserver = fromEvent(this.userPassword.nativeElement, 'keyup')
      .pipe(map((i: any) => i.currentTarget.value));
    return eventObserver.pipe(debounceTime(800));
  }

}
