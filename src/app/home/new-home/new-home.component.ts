import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-new-home',
  templateUrl: './new-home.component.html',
  styleUrls: ['./new-home.component.scss']
})
export class NewHomeComponent implements OnInit {
  isNavbarOpen: boolean = false;
  isCollapsing: boolean = false;
  form: FormGroup;
  isValid: boolean = false;
  submitMassage:any;
  submitstatus:boolean = false;

  constructor(private elementRef: ElementRef,private userservice: UserService) { }

  ngOnInit(): void {
    localStorage.removeItem('vendor_log');
    this.form =  new FormGroup({
      'firstName': new FormControl(null, [Validators.required,Validators.pattern(/^(?! )[a-zA-Z ]*$/)]),
      'lastName': new FormControl(null, [Validators.required,Validators.pattern(/^(?! )[a-zA-Z ]*$/)]),
      'phone':new FormControl(null, [Validators.pattern('[0-9]*'), Validators.maxLength(15)]),
      'email': new FormControl(null, [Validators.required, Validators.email,Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]),
      'massage': new FormControl(null, [Validators.required]),
    })

  }

  get firstName() { return this.form.get('firstName'); }
  get lastName() { return this.form.get('lastName');}
  get phone() { return this.form.get('phone'); }
  get email() { return this.form.get('email'); }
  get massage() { return this.form.get('massage');}



  toggleNavbar() {
    this.isCollapsing = true; // Set isCollapsing to true to trigger the 'collapsing' animation class
    setTimeout(() => {
      this.isNavbarOpen = !this.isNavbarOpen;
      this.isCollapsing = false; // Reset isCollapsing after animation duration
    }, 80);
  }


  onSubmit()
  {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitstatus = true;
    
    let formData = this.form.value;
    let EdData={
      "name": formData.firstName+' '+formData.lastName,
      "phone": formData.phone,
      "email": formData.email,
      "massage": formData.massage
 }

 this.userservice.userContact(EdData).subscribe(
   res =>
   {
    this.form.reset();
  this.isValid=true;
  this.submitMassage="Thank you for contact us. we will connect you soon";  
  this.submitstatus = false;     
  setTimeout(() => {
    this.isValid=false;
  },2000) 
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
