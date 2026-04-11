import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/shared/services/user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, NgZone, OnInit } from '@angular/core';
import { json } from 'express';

@Component({
  selector: 'app-dashboard',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  public openDashboard: boolean = false;
  userName: string = "";
  userEmail: string = "";
  userPhone: string = "";
  userData: JSON;
  form: FormGroup;
  isValid: boolean = false;
  signupMassage: string = "";

  constructor(private router: Router, private userservice: UserService, private toastr: ToastrService, private ngZone: NgZone) {

  }

  ngOnInit(): void {
    let obj = JSON.parse(localStorage.getItem('currentUser'));
    this.form = new FormGroup({
      'fname': new FormControl(null, [Validators.required, Validators.pattern(/^(?! )[a-zA-Z ]*$/)]),
      'emailid': new FormControl(null, [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]),
      'phonenum': new FormControl(null, [Validators.required, Validators.pattern('[0-9]*'), Validators.maxLength(15)]),
    })

    this.userservice.getUserDetails().subscribe(
      res => {
        if (res['error'] != 1) {
          this.userName = res['data'][0].name;
          this.userEmail = res['data'][0].email;
          this.userPhone = res['data'][0].phone;
        }
      }
    )

  }

  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }

  get fname() { return this.form.get('fname'); }
  get emailid() { return this.form.get('emailid'); }
  get phonenum() { return this.form.get('phonenum'); }

  logout() {
    this.userservice.logout();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    let formData = this.form.value;
    let EdData = {
      "name": formData.fname,
      "phone": formData.phonenum
    }
    this.userservice.userUpdateProdile(EdData).subscribe(
      res => {
        this.toastr.success('User profile updated successfully.')
        /// settimeout Start
        const startTime = performance.now();
        this.ngZone.runOutsideAngular(() => {
          const checkTime = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;
            if (elapsedTime >= 2000) {
              this.ngZone.run(() => {
                this.router.navigate(['/dashboard'])
              });
            } else {
              requestAnimationFrame(checkTime);
            }
          };
          requestAnimationFrame(checkTime);
        });
        /// settimeout End

      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      }
    )
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

}
