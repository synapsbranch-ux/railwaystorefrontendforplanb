import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { environment } from '../../../environments/environment';
import { ProductNew } from "../../shared/classes/product";
import { ProductService } from "../../shared/services/product.service";
import { OrderService } from "../../shared/services/order.service";
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { v4 as uuidv4 } from 'uuid';
import { first } from 'rxjs/operators';
import { take } from 'rxjs/operators';
const state = {

  products: JSON.parse(localStorage['products'] || '[]'),
  wishlist: JSON.parse(localStorage['wishlistItems'] || '[]'),
  compare: JSON.parse(localStorage['compareItems'] || '[]'),
  cart: JSON.parse(localStorage['cartItems'] || '[]')
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {

  public checkoutForm: FormGroup;
  public products: ProductNew[] = [];
  public payPalConfig?: IPayPalConfig;

  public amount: any;
  returnUrl: string;
  useraddressslist = [];
  orderValid: boolean = false;
  orderMassage: any;
  paypalstatus: boolean = false;
  transactionId = 0;
  isUserLogin: boolean = true;
  paypalReturnData = [];
  local_checkout_obj = {};
  email_: any;
  phone_: any;
  country_: any;
  first_name_: any;
  last_name_: any;
  street_address_: any
  street_address2_: any;
  city_name_: any;
  state_name_: any;
  zip_code_: any;
  product_not_available: any = [];
  userFuyllName: any
  shipping_charge_value = 0;
  tax_percentage_value = 0;
  orderPrcessed: boolean = false;
  isSubmitting: boolean = false;
  showCouponModal = false;
  hideShortDescription = false;
  couponlist: any[] = [];
  appliedCoupon: any = null;   // Stores currently applied coupon
  discountAmount: any = null;
  couponInput: string = '';
  searchBoxApplyError: string = '';

  private startTime: number;
  private searchTimeout: any;

  constructor(private fb: FormBuilder,
    public productService: ProductService, private userservice: UserService,
    private orderService: OrderService, private route: ActivatedRoute, private router: Router, private toaster: ToastrService, private ngZone: NgZone) {
  }

  ngOnInit(): void {
    let currentUserDetails = JSON.parse(localStorage.getItem('currentUser'));
    this.email_ = currentUserDetails.data.email;
    this.phone_ = currentUserDetails.data.phone;
    this.userFuyllName = currentUserDetails.data.name;

    this.local_checkout_obj = JSON.parse(localStorage.getItem('checkoutform'));
    if (this.local_checkout_obj) {
      this.email_ = this.local_checkout_obj['email_address'];
      this.phone_ = this.local_checkout_obj['phone_no'];
    }
    if (localStorage.getItem('user_')) {
      this.isUserLogin = false;
    }

    let vendorSet = false;

    this.productService.cartItems.subscribe(response => this.products = response);

    for (const element of this.products) {
      this.productService.getproductsBySlugs(element.product_slug)
        .pipe(first())
        .subscribe({
          next: (v) => {
            if (!vendorSet && v.data.product_owner._id) {
              if (!localStorage.getItem('vendor_id')) {
                localStorage.setItem('vendor_id', v.data.product_owner._id);
              }
              vendorSet = true;
              this.getShippingTax(); // Call getShippingTax only once
            }

            let stock = (v.data.stock - element.quantity);
            if (stock < 0) {
              if (v.data.product_name) {
                this.toaster.error(`${v.data.product_name} is out of stock, please delete from cart to continue shopping`);
                this.router.navigateByUrl(`stores/${v.data.product_store.store_slug}/${v.data.product_department.department_slug}/${v.data.product_slug}`);
              }
            }
          },
          error: (e) => {
            // Handle error here
          },
          complete: () => console.info('Complete')
        });
    }

    this.getTotal.subscribe(amount => this.amount = amount);

    this.checkoutForm = new FormGroup({
      'phone': new FormControl(null, [Validators.required]),
      'email': new FormControl(null, [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]),
      'paymentOption': new FormControl(null, [Validators.required]),
      'userShippingAddressId': new FormControl(null, [Validators.required]),
      'userBillingAddressId': new FormControl(null, [Validators.required]),
    })
    if (this.isUserLogin) {
      this.checkoutForm.controls['phone'].disable();
      this.checkoutForm.controls['email'].disable();
      this.checkoutForm.controls['paymentOption'].disable();

    }
    if (!this.isUserLogin) {
      this.getuserallAddressList();
    }
  }

  getShippingTax() {
    let vendorObj =
    {
      vendor_id: localStorage.getItem('vendor_id') ? localStorage.getItem('vendor_id') : ''
    }
    this.productService.getallShippingTaxs(vendorObj).subscribe(
      res => {
        this.shipping_charge_value = res['data'][0].shipping_charge;
        this.tax_percentage_value = res['data'][0].tax_percentage;
        localStorage.setItem('shipping', this.shipping_charge_value.toString());
        localStorage.setItem('tax', this.tax_percentage_value.toString());
      },
      error => {
        this.toaster.error(error.error.message)
      }
    )
  }

  get phone() { return this.checkoutForm.get('phone'); }
  get email() { return this.checkoutForm.get('email'); }
  get paymentOption() { return this.checkoutForm.get('paymentOption'); }
  get userShippingAddressId() { return this.checkoutForm.get('userShippingAddressId'); }
  get userBillingAddressId() { return this.checkoutForm.get('userBillingAddressId'); }


  getuserallAddressList() {
    this.orderService.getAllAddress().subscribe(
      res => {
        this.useraddressslist = res['data'];
        console.log('this.useraddressslist=====================', this.useraddressslist);
      }
    )
  }
  public get getTotal(): Observable<number> {
    return this.productService.cartTotalAmount();
  }

  checkoutLogin() {
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
  }
  checkaddress() {
    let address_arr = {
      email_address: (<HTMLInputElement>document.getElementById('email_address')).value,
      phone_no: (<HTMLInputElement>document.getElementById('phone_no')).value,
    }

    localStorage.setItem('checkoutform', JSON.stringify(address_arr))

    this.router.navigate(['/address'], { queryParams: { returnUrl: '/checkout' } });
  }

  // PayPal Payment Gateway
  private initConfig(): void {
    let orderProductspaypal: Object[] = [];

    for (const elem of this.products) {
      let odetailsobj = {
        name: elem.product_name,
        quantity: elem.quantity,
        unit_amount: {
          currency_code: this.productService.Currency.currency,
          value: (elem.product_sale_price + elem.addonsprice).toFixed(2).toString(),
        },
      };
      orderProductspaypal.push(odetailsobj);
    }

    let billAddress = this.useraddressslist.filter((address) => address._id == this.checkoutForm?.value?.userBillingAddressId);
    let taxTotal = (this.amount * (Number(localStorage.getItem('tax')) / 100));
    //
    let fullName = billAddress[0]?.user_full_name || 'Customer';
    let nameParts = fullName.trim().split(' ');
    let givenName = nameParts[0] || 'Customer';
    let surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    let payerName: any = { given_name: givenName };
    if (surname) {
      payerName.surname = surname;
    }

    let payerAddress: any = {
      address_line_1: billAddress[0]?.addressline1,
      admin_area_2: billAddress[0]?.city,
      admin_area_1: billAddress[0]?.state,
      postal_code: billAddress[0]?.postal_code,
      country_code: 'US'
    };
    if (billAddress[0]?.addressline2) {
      payerAddress.address_line_2 = billAddress[0].addressline2;
    }
    //
    this.payPalConfig = {
      currency: this.productService.Currency.currency,
      clientId: environment.paypal_token,
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        //
        payer: {
          name: payerName,
          email_address: this.email_,
          address: payerAddress
        },
        //
        purchase_units: [
          {
            amount: {
              currency_code: this.productService.Currency.currency,
              value: (this.amount + taxTotal + this.shipping_charge_value).toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: this.productService.Currency.currency,
                  value: this.amount.toFixed(2),
                },
                tax_total: {
                  currency_code: this.productService.Currency.currency,
                  value: taxTotal.toFixed(2),
                },
                shipping: {
                  currency_code: this.productService.Currency.currency,
                  value: this.shipping_charge_value.toFixed(2),
                },
              }
            },
            items: orderProductspaypal,
            shipping: {
              address: {
                address_line_1: billAddress[0]?.addressline1,
                address_line_2: billAddress[0]?.addressline2,
                admin_area_2: billAddress[0]?.city,
                admin_area_1: billAddress[0]?.state,
                postal_code: billAddress[0]?.postal_code,
                country_code: 'US'
              }
            }
          }
        ]
      },

      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        actions.order.get().then(details => {
          // Successful transaction (COMPLETED)
          // Status expected here: COMPLETED
          this.transactionId = details['id'];
          this.paypalReturnData = [
            {
              transaction_id: details.id,
              country_code: details.payer.address.country_code,
              email_address: details.payer.email_address,
              name: `${details.payer.name.given_name} ${details.payer.name.surname}`,
              customer_id_paypal: details.payer.payer_id,
              paypal_status: details.status,
              paypal_data: details
            }
          ];
          this.placePaypalOrder(); // Handle completed status
        });
      },
      onClientAuthorization: (data) => {
        // Transaction successfully authorized (AUTHORIZED or APPROVED)
        // Status expected here: COMPLETED or APPROVED (Authorization completed)
        this.paypalReturnData = [
          {
            transaction_id: data.id || '',
            country_code: data.payer?.address?.country_code || '',
            email_address: data.payer?.email_address || '',
            name: `${data.payer?.name?.given_name || ''} ${data.payer?.name?.surname || ''}`,
            customer_id_paypal: data.payer?.payer_id || '',
            paypal_status: data.status || 'COMPLETED',
            paypal_data: data
          }
        ];
        this.placePaypalOrder(); // Handle client authorization status
        console.log('onClientAuthorization', data);
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
      },
      onError: err => {
        // Error during transaction (ERROR, FAILED, DENIED)
        // Possible statuses here: ERROR, FAILED, DENIED
        this.paypalReturnData = [
          {
            transaction_id: '',
            country_code: '',
            email_address: '',
            name: '',
            customer_id_paypal: '',
            paypal_status: 'ERROR',
            paypal_data: err
          }
        ];
        this.placePaypalOrder(); // Handle error status
        console.log('OnError', err);
      },
      onClick: (data, actions) => {
        // Click event before transaction starts
        // No specific status expected here, this is just to confirm user intent
        console.log('onClick', data, actions);
      },
    };
  }


  getpaymentoption(event) {

    if (event.target.value == 'COD') {
      this.paypalstatus = false;
    }
    let formData = this.checkoutForm.value;
    if (event.target.value == 'paypal' && this.useraddressslist.length > 0 && formData.userShippingAddressId != null && formData.userBillingAddressId != null) {
      this.initConfig();
      this.paypalstatus = true;
    }
  }

  placeorder() {
    let formData = this.checkoutForm.value;
    if (this.checkoutForm.invalid || this.isSubmitting) {
      return;
    }
    if (formData.paymentOption != 'COD') {
      this.toaster.warning('Please select PayPal.')
    }

    if (this.products.length > 0) {
      this.isSubmitting = true;
      this.orderPrcessed = true;
      const currentUser = localStorage.getItem("user_");
      if (currentUser) {
        if (this.products.length > 0) {
          let orderTotal = 0;

          this.getTotal.subscribe(
            res => {
              orderTotal = res

            }
          )
          let orderData =
          {
            total_order_amount: orderTotal.toFixed(2),
            order_status: 'initiated',
            payment_method: formData.paymentOption,
            country_code: "",
            email_address: formData.email,
            name: this.userFuyllName,
            shipping_address_id: formData.userShippingAddressId,
            billing_address_id: formData.userBillingAddressId,
            billing_email: formData.email,
            billing_phone: formData.phone,
            cart_id: localStorage.getItem('cart_'),
            vendor_id: localStorage.getItem('vendor_id'),
            store_slug: localStorage.getItem('storeslug'),
            coupon: this.appliedCoupon ? this.appliedCoupon.coupon_name : null

          }

          for (const element of this.products) {

            this.productService.getproductsBySlugs(element.product_slug)
              .pipe(first())
              .subscribe({
                next: (v) => {
                  let stock = (v.data.stock - element.quantity);

                  if (stock < 0) {
                    if (v.data.product_name) {
                      this.toaster.error(`${v.data.product_name} is out of stock. Please remove it from the cart to continue shopping.`)
                      this.router.navigateByUrl(`product/${v.data.product_slug}`)
                    }
                  }
                  else {
                    return;
                  }
                },
                error: (e) => {
                },
                complete: () => console.info('Complete')
              }
              );
          }

          this.orderService.userCreateOrder(orderData).subscribe(
            res => {
              this.userservice.setUserOrderid(res['data']._id);
              if (formData.paymentOption == 'COD') {
                this.transactionId = uuidv4();
                let orderData =
                {
                  order_id: res['data']._id,
                  total_order_amount: orderTotal.toFixed(2),
                  order_status: 'initiated',
                  payment_status: 'pending',
                  payment_method: formData.paymentOption,
                  transaction_id: this.transactionId,
                  country_code: "",
                  email_address: formData.email,
                  name: this.userFuyllName,
                  customer_id_paypal: "",
                  paypal_status: '',
                  shipping_address_id: formData.userShippingAddressId,
                  billing_address_id: formData.userBillingAddressId,
                  billing_email: formData.email,
                  billing_phone: formData.phone,
                  cart_id: localStorage.getItem('cart_'),
                  vendor_id: localStorage.getItem('vendor_id'),
                  store_slug: localStorage.getItem('storeslug'),
                  coupon: this.appliedCoupon ? this.appliedCoupon.coupon_name : null
                }

                this.orderService.userCreateOrderPayment(orderData).subscribe(
                  res => {
                    this.orderValid = true;
                    this.orderPrcessed = false;
                    this.orderMassage = "Your Order Placed successfully";
                    for (const elem of this.products) {
                      this.productService.removeCartItem(elem);
                    }
                    setTimeout(() => {
                      this.isSubmitting = false;
                      this.router.navigateByUrl('/order/success');
                    }, 1000)
                  },
                  error => {
                    // .... HANDLE ERROR HERE 
                    this.toaster.error(error.error.message);
                    this.orderPrcessed = false;
                    this.isSubmitting = false;
                  });
              }
            },
            error => {
              // .... HANDLE ERROR HERE 
              this.toaster.error(error.error.message);
              this.orderPrcessed = false;
              this.isSubmitting = false;
            });
        }
      }
      else {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      }
    }

  }

  placePaypalOrder() {
    if (this.checkoutForm.invalid || this.isSubmitting) {
      return;
    }
    if (this.products.length > 0) {
      this.isSubmitting = true;
      this.orderPrcessed = true;
      const currentUser = localStorage.getItem("user_");
      if (currentUser) {
        if (this.products.length > 0) {
          let orderTotal = 0;
          let formData = this.checkoutForm.value;
          console.log('formData----------------', formData)
          this.getTotal.subscribe(
            res => {
              orderTotal = res

            }
          )
          let orderData =
          {
            total_order_amount: orderTotal.toFixed(2),
            order_status: 'initiated',
            payment_method: formData.paymentOption,
            country_code: "",
            email_address: formData.email,
            name: this.userFuyllName,
            shipping_address_id: formData.userShippingAddressId,
            billing_address_id: formData.userBillingAddressId,
            billing_email: formData.email,
            billing_phone: formData.phone,
            cart_id: localStorage.getItem('cart_'),
            vendor_id: localStorage.getItem('vendor_id'),
            store_slug: localStorage.getItem('storeslug'),
            coupon: this.appliedCoupon ? this.appliedCoupon.coupon_name : null
          }

          for (const element of this.products) {

            this.productService.getproductsBySlugs(element.product_slug)
              .pipe(first())
              .subscribe({
                next: (v) => {
                  let stock = (v.data.stock - element.quantity);

                  if (stock < 0) {
                    if (v.data.product_name) {
                      this.toaster.error(`${v.data.product_name} is out of stock. Please remove it from the cart to continue shopping.`)
                      this.router.navigateByUrl(`product/${v.data.product_slug}`)
                    }
                  }
                  else {
                    return;
                  }
                },
                error: (e) => {
                },
                complete: () => console.info('Complete')
              }
              );
          }
          this.orderService.userCreateOrder(orderData).subscribe(
            res => {
              this.userservice.setUserOrderid(res['data']._id);
              if (formData.paymentOption != 'COD') {
                this.paymentOrder();
              }
            },
            error => {
              // .... HANDLE ERROR HERE 
              this.toaster.error(error.error.message);
              this.orderPrcessed = false;
              this.isSubmitting = false;
            });
        }
      }
      else {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      }
    }
  }

  paymentOrder() {
    if (this.products.length > 0) {

      let orderTotal = 0;
      let paymentStatus = "";
      let formData = this.checkoutForm.value;
      this.getTotal.subscribe(
        res => {
          orderTotal = res
        }
      )
      let orderData =
      {
        order_id: this.userservice.getUserOrderid(),
        total_order_amount: orderTotal.toFixed(2),
        order_status: (this.paypalReturnData[0].paypal_status === 'APPROVED' || this.paypalReturnData[0].paypal_status === 'COMPLETED') ? 'initiated' : 'pending',
        payment_status: paymentStatus,
        payment_method: formData.paymentOption,
        transaction_id: this.transactionId,
        country_code: this.paypalReturnData[0].country_code ? this.paypalReturnData[0].country_code : '',
        email_address: this.paypalReturnData[0].email_address ? this.paypalReturnData[0].email_address : formData.email,
        name: this.paypalReturnData[0].name ? this.paypalReturnData[0].name : this.userFuyllName,
        customer_id_paypal: this.paypalReturnData[0].customer_id_paypal ? this.paypalReturnData[0].customer_id_paypal : '',
        paypal_status: this.paypalReturnData[0].paypal_status ? this.paypalReturnData[0].paypal_status : '',
        paypal_data: this.paypalReturnData[0].paypal_data,
        shipping_address_id: formData.userShippingAddressId,
        billing_address_id: formData.userBillingAddressId,
        billing_email: formData.email,
        billing_phone: formData.phone,
        cart_id: localStorage.getItem('cart_'),
        vendor_id: localStorage.getItem('vendor_id'),
        store_slug: localStorage.getItem('storeslug'),
        coupon: this.appliedCoupon ? this.appliedCoupon.coupon_name : null
      }

      this.orderService.userCreateOrderPayment(orderData).subscribe(
        res => {
          this.userservice.setUserOrderid(res['data']._id);
          console.log('this.paypalReturnData[0].paypal_status', this.paypalReturnData[0].paypal_status);
          if (this.paypalReturnData[0].paypal_status === 'APPROVED' || this.paypalReturnData[0].paypal_status === 'COMPLETED') {
            for (const elem of this.products) {
              this.productService.removeCartItem(elem);
            }
          }
          this.orderValid = true;
          this.orderPrcessed = false;
          this.orderMassage = (this.paypalReturnData[0].paypal_status === 'APPROVED' || this.paypalReturnData[0].paypal_status === 'COMPLETED') ? "Your Order Placed successfully" : "Your Order is Pending";
          setTimeout(() => {
            this.isSubmitting = false;
            this.router.navigateByUrl('/order/success');
          }, 2000)
        },
        error => {
          // .... HANDLE ERROR HERE 
          this.toaster.error(error.error.message);
          this.orderPrcessed = false;
          this.isSubmitting = false;
        });

    }

  }


  openCouponModal() {
    this.showCouponModal = true;
    this.fetchCoupons();
  }

  closeCouponModal() {
    this.showCouponModal = false;
    this.searchBoxApplyError = '';
  }

  // Trigger when user types in the search box
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    this.couponInput = filterValue;
    // Cancel the previous search if user keeps typing
    if (this.searchTimeout) {
      cancelAnimationFrame(this.searchTimeout);
    }

    // Record the start time
    this.startTime = performance.now();

    // Start checking the time with a custom timeout logic using requestAnimationFrame
    this.ngZone.runOutsideAngular(() => {
      const checkTime = (currentTime: number) => {
        const elapsedTime = currentTime - this.startTime;
        if (elapsedTime >= 1000) {  // 1 seconds delay
          this.ngZone.run(() => {
            if (filterValue.length > 0) {
              this.triggerSearch(filterValue);
            } else {
              this.fetchCoupons();
            }
          });
        } else {
          this.searchTimeout = requestAnimationFrame(checkTime);
        }
      };
      this.searchTimeout = requestAnimationFrame(checkTime);
    });
  }

  // Additional API request function for search
  triggerSearch(filterValue: string): void {
    this.orderService.searchCouponByCouponName(filterValue).subscribe(res => {
      if (res && res['data']) {
        this.couponlist = res['data'];  // Assign current page data
        this.couponlist = res['data'].map((coupon: any) => ({
          ...coupon,                // keep DB fields
          expanded: false           // add UI state field
        }));
      }
    });
  }


  fetchCoupons() {
    // Make API call to fetch coupons for the current page and page size
    this.orderService.fetchCoupons()  // Adjusting for 0-based index
      .subscribe(
        res => {
          this.couponlist = res['data'];  // Assign current page data
          this.couponlist = res['data'].map((coupon: any) => ({
            ...coupon,                // keep DB fields
            expanded: false,       // add UI state field
            errorMessage: ''
          }));
          console.log('Fetched coupons:', this.couponlist);
        },
        error => {
          this.toaster.error(error.error.message);
        }
      );
  }


  toggleDetails(index: number) {
    this.couponlist[index].expanded = !this.couponlist[index].expanded;
    this.hideShortDescription = this.couponlist[index].expanded; // Hide short description when expanded
  }

  applyCoupon(coupon: any, index: number) {
    console.log("Applying couponaaaaaa:", coupon);

    this.getTotal.pipe(take(1)).subscribe(orderTotal => {

      // Clear previous error
      this.couponlist[index].errorMessage = '';

      const today = new Date();
      const startDate = new Date(coupon.start_date);
      const endDate = new Date(coupon.end_date);

      // ✅ 1. Check Start Date
      if (today < startDate) {
        this.couponlist[index].errorMessage =
          'This coupon is not active yet.';
        return;
      }

      // ✅ 2. Check Expiry
      if (today > endDate) {
        this.couponlist[index].errorMessage =
          'This coupon has expired.';
        return;
      }

      // ✅ 3. Check Minimum Order
      if (
        coupon.min_order_amount &&
        orderTotal < coupon.min_order_amount
      ) {
        this.couponlist[index].errorMessage =
          `Minimum order amount should be $${coupon.min_order_amount}`;
        return;
      }

      // ✅ 4. Check Per User Limit
      let couponData = {
        couponName: coupon.coupon_name
      }
      this.orderService.checkCouponUsage(couponData)
        .subscribe({
          next: (res: any) => {

            console.log("Coupon usage response:", res.data);
            console.log("Coupon usage responsellllimit:", coupon.per_user_limit);


            if (res.data >= coupon.per_user_limit) {
              console.log('Coupon usage response llll:', res.data);
              this.couponlist[index].errorMessage =
                'You have already used this coupon.';
              return;
            }

            console.log("reeeeeeeeeee")
            // ✅ Apply coupon if valid
            this.appliedCoupon = coupon;

            if (coupon.type === 'percentage') {
              this.discountAmount =
                ((coupon.discount / 100) * orderTotal).toFixed(2);
            } else {
              this.discountAmount = coupon.discount.toFixed(2);
            }

            this.closeCouponModal();
          },
          error: (err) => {
            this.couponlist[index].errorMessage =
              err.error.message || 'Coupon validation failed';
          }
        });

    });
  }


  applyTypedCoupon() {
    console.log("ssssssssssssss")
    if (!this.couponInput.trim()) return;

    let couponData = {
      coupon: this.couponInput
    }

    this.orderService.searchCouponByCouponNameAndCode(couponData).subscribe((res: any) => {

      if (res.message === 'Success') {

        let coupon = res['data'];

        this.getTotal.pipe(take(1)).subscribe(orderTotal => {

          const today = new Date();
          const startDate = new Date(coupon.start_date);
          const endDate = new Date(coupon.end_date);

          // ✅ 1. Check Start Date
          if (today < startDate) {
            this.searchBoxApplyError = 'This coupon is not active yet.';
            return;
          }

          // ✅ 2. Check Expiry
          if (today > endDate) {
            this.searchBoxApplyError = 'This coupon has expired.';
            return;
          }

          // ✅ 3. Check Minimum Order
          if (
            coupon.min_order_amount &&
            orderTotal < coupon.min_order_amount
          ) {
            this.searchBoxApplyError = `Minimum order amount should be $${coupon.min_order_amount}`;
            return;
          }

          // ✅ 4. Check Per User Limit
          let couponData = {
            couponName: coupon.coupon_name
          }
          this.orderService.checkCouponUsage(couponData)
            .subscribe({
              next: (res: any) => {

                if (res.data >= coupon.per_user_limit) {
                  this.searchBoxApplyError = 'You have already used this coupon.';
                  return;
                }

                console.log(this.appliedCoupon, "applied coupon details");

                // ✅ Apply coupon if valid
                this.appliedCoupon = coupon;

                if (coupon.type === 'percentage') {
                  this.discountAmount =
                    ((coupon.discount / 100) * orderTotal).toFixed(2);
                } else {
                  this.discountAmount = coupon.discount.toFixed(2);
                }

                this.closeCouponModal();
              },
              error: (err) => {
                this.searchBoxApplyError = err.error.message || 'Coupon validation failed';
              }
            });
        });
      } else {
        this.searchBoxApplyError = 'No coupon found with this name or code.';
      }
    });

    // Call your API or apply logic here
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.discountAmount = null;
  }

}
