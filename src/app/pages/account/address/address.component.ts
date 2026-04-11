import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Userlogin } from './../../../shared/classes/userslogin';
import { UserAddress } from './../../../shared/classes/user';
import { UserService } from 'src/app/shared/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, NgZone, OnInit } from '@angular/core';
import { json } from 'express';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
  //public useraddressclass: UserAddress[] = [];
  public openDashboard: boolean = false;
  userName: string = "";
  userEmail: string = "";
  userPhone: string = "";
  userData: JSON;
  public useraddressslist: any = [];
  addressMassage: string = ""
  form: FormGroup;
  isValid: boolean = false;
  submitMassage: any;
  returnUrl: string;


  constructor(private router: Router, private userservice: UserService, private route: ActivatedRoute, private toastr: ToastrService, private ngZone: NgZone) {

  }

  ngOnInit(): void {
    this.addressMassage = "Add New Address";
    this.getallAddressList();
    this.form = new FormGroup({
      'userfullname': new FormControl(null, [Validators.required, Validators.pattern(/^(?! )[a-zA-Z ]*$/)]),
      'addressline1': new FormControl(null, [Validators.required]),
      'addressline2': new FormControl(null),
      'city': new FormControl(null, [Validators.required, Validators.pattern(/^(?! )[a-zA-Z ]*$/)]),
      'state': new FormControl(null, [Validators.required, Validators.pattern(/^(?! )[a-zA-Z ]*$/)]),
      'postalCode': new FormControl(null, [Validators.pattern('[0-9]*'), Validators.maxLength(10)]),
      'telephone': new FormControl(null, [Validators.pattern('[0-9]*'), Validators.maxLength(15)]),
    })

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }
  getallAddressList() {
    this.userservice.getAllAddress().subscribe(
      res => {
        this.useraddressslist = res['data'];
      }
    )
  }
  editAddress(address_id: any) {
    this.userservice.setUserAddressid(address_id);
    this.router.navigateByUrl('edit-address');
  }
  deleteAddress(address_id: any) {
    let Ddata =
    {
      "address_id": address_id
    }

    this.userservice.deleteAddress(Ddata).subscribe(
      res => {
        this.getallAddressList();
      }
      ,
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      }
    )

  }
  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }

  logout() {
    this.userservice.logout();
  }
  setDefaultAddress(val: any, address_id: any, address) {
    let Ddata =
    {
      "address_id": address_id,
      "user_full_name": address.user_full_name,
      "addressline1": address.addressline1,
      "addressline2": address.addressline2,
      "city": address.city,
      "postal_code": address.postal_code,
      "mobile": address.mobile,
      "state": address.state,
      "is_default": String(val)
    }

    this.userservice.setDefaultAddress(Ddata).subscribe(
      res => {
        this.getallAddressList();
      }
    )
  }

  get userfullname() { return this.form.get('userfullname'); }
  get addressline1() { return this.form.get('addressline1'); }
  get addressline2() { return this.form.get('addressline2'); }
  get city() { return this.form.get('city'); }
  get state() { return this.form.get('state'); }
  get postalCode() { return this.form.get('postalCode'); }
  get telephone() { return this.form.get('telephone'); }

  onSubmit() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
    }
    else {
      let formData = this.form.value;
      let EdData = {
        "user_full_name": formData.userfullname,
        "addressline1": formData.addressline1,
        "addressline2": formData.addressline2,
        "city": formData.city,
        "postal_code": formData.postalCode,
        "mobile": formData.telephone,
        "state": formData.state,
      }
      this.userservice.addNewAddress(EdData).subscribe(
        res => {
          this.toastr.success("Address added successfully.");
          this.getallAddressList();
          /// settimeout Start
          const startTime = performance.now();
          this.ngZone.runOutsideAngular(() => {
            const checkTime = (currentTime: number) => {
              const elapsedTime = currentTime - startTime;
              if (elapsedTime >= 2000) {
                this.ngZone.run(() => {
                  if (this.returnUrl) {
                    console.log('Return URL found', this.returnUrl)
                    // login successful so redirect to return url
                    this.router.navigateByUrl(this.returnUrl)
                  }
                  else {
                    console.log('Return URL Not found')
                    this.router.navigate(['address'])
                      .then(() => {
                        this.form.reset();
                        this.isValid = false;
                      });
                  }
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
