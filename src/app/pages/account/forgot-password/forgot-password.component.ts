import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UserService } from './../../../shared/services/user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  form: FormGroup;
  isValid:boolean=false;
  submitMassage:any;

  constructor(private userservice: UserService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.form =  new FormGroup({
      'userEmail': new FormControl(null, [Validators.required, Validators.email,Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]),
    });
  }

  get userEmail() { return this.form.get('userEmail'); }


  onSubmit()
  {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    let formData = this.form.value;

    let fData={
      email : formData.userEmail
    }

    this.userservice.forgotPassword(fData).subscribe(
      res =>
      {
        this.toastr.success("Your Password han been changed. Please Check Your Mail.");
        setTimeout(() => {
          this.router.navigate(['/login'])
          .then(() => {
            // window.location.reload();
          });
        },2000) 
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
   })
  }


}
