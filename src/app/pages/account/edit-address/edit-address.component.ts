import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserAddress } from './../../../shared/classes/user';
import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';
import { Component, NgZone, OnInit } from '@angular/core';
import { json } from 'express';

@Component({
  selector: 'app-address',
  templateUrl: './edit-address.component.html',
  styleUrls: ['./edit-address.component.scss']
})
export class EditAddressComponent implements OnInit {
  //public useraddressclass: UserAddress[] = [];
  public openDashboard: boolean = false;
  userData: JSON;
  public useraddressslist: any = [];
  addressMassage: string = ""
  form: FormGroup;
  fullname: any;
  address1: any;
  address2: any;
  cityname: any;
  statename: any;
  postal_code: any;
  telephone_num: any
  is_defaultval: any
  isValid: boolean = false;
  submitMassage: any;

  constructor(private router: Router, private userservice: UserService, private toastr: ToastrService, private ngZone: NgZone) {
    if (!this.userservice.getUserAddressid()) {
      this.router.navigate(['/address'])
    }
  }

  ngOnInit(): void {
    this.addressMassage = "Edit Address";
    this.getAddressDetails();

    this.form = new FormGroup({

      'userfullname': new FormControl(null, [Validators.required, Validators.pattern(/^(?! )[a-zA-Z ]*$/)]),
      'addressline1': new FormControl(null, [Validators.required]),
      'addressline2': new FormControl(null),
      'city': new FormControl(null, [Validators.required, Validators.pattern(/^(?! )[a-zA-Z ]*$/)]),
      'state': new FormControl(null, [Validators.required, Validators.pattern(/^(?! )[a-zA-Z ]*$/)]),
      'postalCode': new FormControl(null, [Validators.pattern('[0-9]*'), Validators.maxLength(10)]),
      'telephone': new FormControl(null, [Validators.pattern('[0-9]*'), Validators.maxLength(15)]),
      'defaultstatus': new FormControl(null, [Validators.required]),
    })
    let lData =
    {
      "address_id": this.userservice.getUserAddressid()
    }
    this.userservice.getSingleAddressDetails(lData).subscribe(
      res => {
        this.fullname = res['data'][0].user_full_name;
        this.address1 = res['data'][0].addressline1;
        this.address2 = res['data'][0].addressline2;
        this.cityname = res['data'][0].city;
        this.statename = res['data'][0].state;
        this.postal_code = res['data'][0].postal_code;
        this.telephone_num = res['data'][0].mobile;
        this.is_defaultval = res['data'][0].is_default;
      }
    )
  }
  getAddressDetails() {
    let daDAta =
    {

    }
    this.userservice.getSingleAddress(daDAta).subscribe(
      res => {
        this.useraddressslist = res['data'];
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
  get defaultstatus() { return this.form.get('defaultstatus'); }


  editAddress(address_id: any) {
    UserAddress.setID(address_id)
    this.router.navigate(['/login'])
  }

  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }

  logout() {
    this.userservice.logout();
  }

  onSubmit() {
    let formData = this.form.value;
    let EdData = {
      "address_id": this.userservice.getUserAddressid(),
      "user_full_name": formData.userfullname,
      "addressline1": formData.addressline1,
      "addressline2": formData.addressline2,
      "city": formData.city,
      "postal_code": formData.postalCode,
      "mobile": formData.telephone,
      "state": formData.state,
      "is_default": formData.defaultstatus
    }
    this.userservice.userUpdateAddress(EdData).subscribe(
      res => {
        this.toastr.success("Address successfully Updated");

        /// settimeout Start
        const startTime = performance.now();
        this.ngZone.runOutsideAngular(() => {
          const checkTime = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;
            if (elapsedTime >= 2000) {
              this.ngZone.run(() => {
                this.router.navigate(['/address'])
                  .then(() => {
                    window.location.reload();
                  });
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
