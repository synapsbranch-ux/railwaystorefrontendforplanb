import { take } from 'rxjs/operators';
import { ProductService } from './../../../shared/services/product.service';
import { Subscription, timer } from 'rxjs';
import { PasswordStrengthValidator } from './../../../password-strength.validators';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, Validator} from '@angular/forms';
import { UserService } from 'src/app/shared/services/user.service';
import { Otp } from 'src/app/shared/classes/otp';

import Validation from '../utils/validation';

// @ts-check
@Component({
  selector: 'app-register-vendor',
  templateUrl: './register-vendor.component.html',
  styleUrls: ['./register-vendor.component.scss']
})

export class RegisterVendorComponent implements OnInit {

  signupMassage:string="";
  phValid: boolean = true;
  isValid: boolean = false;
  form: FormGroup;
  submitted = false;
  callForOtp = false;
  userOtp:any;
  getOtpVal:any;
  otpValid:Boolean=false;
  public otp: Otp[] = [];
  catagoriesLists=[];
  countDown: Subscription;
  counter = 191;
  tick = 1000;
  otpTimerstatus:boolean=false;
  selectcat="1";
  selectCatagorries:any;
  othersstatus:boolean=false;
  vendorOTPStatus:boolean=false;

  constructor(private fromBuilder: FormBuilder, public userService: UserService, private router: Router, private toastr: ToastrService, private productservice: ProductService) { }
  
  showOtpComponent = true;

  ngOnInit(): void {
     this.form =  new FormGroup({
        'fname': new FormControl(null, [Validators.required,Validators.pattern(/^(?! )[a-zA-Z ]*$/)]),
        'lname': new FormControl(null, [Validators.required,Validators.pattern(/^(?! )[a-zA-Z ]*$/)]),
        'email': new FormControl(null, [Validators.required, Validators.email,Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]),
        'password': new FormControl(null, [Validators.required, Validators.minLength(8), Validators.maxLength(15),PasswordStrengthValidator]),
        'repeat_password': new FormControl(null, [Validators.required]),
        'phone':new FormControl(null, [Validators.pattern('[0-9]*'), Validators.maxLength(15)]),
        'catagories_name': new FormControl(null, [Validators.required]),
        'other_categories': new FormControl(null),

      },
       {
        validators: [Validation.match('password', 'repeat_password')]
       }
      );

      this.productservice.getallCategories().subscribe(
        res =>{
          this.catagoriesLists=res['data'];
        }
      )
  }

  get fname() { return this.form.get('fname'); }
  get lname() { return this.form.get('lname'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password');}
  get repeat_password() { return this.form.get('repeat_password'); }
  get phone() { return this.form.get('phone');}
  get catagories_name() { return this.form.get('catagories_name');}
  get other_categories() { return this.form.get('othercategories');}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }
    
    
    let formData = this.form.value;

    let element = <HTMLInputElement> document.getElementById("customControlAutosizing1");  
    if (element.checked) { 

      this.counter = 191;
      this.otpTimerstatus=true;
      this.otpTimer();

      let data = {
        'name': `${formData.fname} ${formData.lname}`,
        'email': formData.email,
        'phone': formData.phone,
        'type': 'VendorSignUp'
      }
      this.userService.vendorgenerateOTP(data).subscribe(
        res => {
          this.getOtpVal = res['data'].otpValue;
          this.toastr.success('OTP has been sent to your registered email. Please check.');
          this.vendorOTPStatus=true; 
        },
        error => {
          // .... HANDLE ERROR HERE 
          this.phValid=false;
          this.toastr.error(error.error.message);
          // this.signupMassage="Your Phone Or Email Already Register";
      }
      );
    }
    else
    {
      this.phValid=false;
      this.toastr.error('Please check Terms & Conditions');
      //this.signupMassage="Please check Terms & Conditions";
    } 
    }

    getcatval(catname:any)
    {
      catname == 'others'? this.othersstatus=true : this.othersstatus=false;
      this.selectCatagorries=catname;
    }

    otpTimer()
    {
      this.countDown = timer(0, this.tick)
      .pipe(take(this.counter))
      .subscribe(() => {
        --this.counter;
        if (this.counter == 0) {
          this.countDown.unsubscribe();
        }
      });
    }
  
    transform(value: number): string {
      const minutes: number = Math.floor(value / 60);
      return (
        ('00' + minutes).slice(-2) +
        ':' +
        ('00' + Math.floor(value - minutes * 60)).slice(-2)
      );
    }
  
    otpverify()
    {
      if(this.userOtp == this.getOtpVal){
        let formData = this.form.value;
  let catname="";
  if(this.selectCatagorries != 'others')
  {
    catname=formData.catagories_name
  }
  else
  {
    catname=formData.other_categories
  }
  let data = {
          'name': formData.fname,
          'email': formData.email,
          'phone': formData.phone,
          'password': formData.password.trim(),
          'repeat_password': formData.repeat_password.trim(),
          'otp': this.userOtp,
          'catagories': catname,
        }
        this.userService.vendorSignUp(data).subscribe(
          res => {      
            this.toastr.success('Your registration was successful.');
            setTimeout(() => {
              window.location.href = 'https://admin.ralbatech.com/'
            },3000) 
          },
          error => {
            // .... HANDLE ERROR HERE 
            this.toastr.error(error.error.message);
       }
        );
   
  
      }else{
          this.toastr.error('Please enter OTP first.')
          this.otpValid=false;
      }
    }
  
    otpresend()
    {
        this.counter = 191;
        this.otpTimerstatus=true;
        this.otpTimer();
      let formData = this.form.value;
  
      let data = {
        'name': formData.vendor_name,
        'email': formData.vendor_email,
        'phone': formData.vendor_phone,
        'type': 'VendorSignUp'
      }
      
      this.userService.vendorgenerateOTP(data).subscribe(
        res => {
          this.getOtpVal = res['data'].otpValue;
          this.toastr.success('OTP has been sent to your registered email. Please check.');
          this.vendorOTPStatus=true;      
        },
        error => {
          // .... HANDLE ERROR HERE 
          this.toastr.error(error.error.message);
     }
      );
  
    }

    onOtpChange(ele){
    this.userOtp = ele;
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

