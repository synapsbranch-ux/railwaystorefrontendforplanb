import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, Validator } from '@angular/forms';
import { UserService } from 'src/app/shared/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from 'src/app/shared/services/product.service';
import { ProductNew } from 'src/app/shared/classes/product';
import { ToastrService } from 'ngx-toastr';
import { PasswordStrengthValidator } from 'src/app/password-strength.validators';

const state = {
  products: JSON.parse(localStorage.getItem('products') || '[]'),
  wishlist: JSON.parse(localStorage['wishlistItems'] || '[]'),
  compare: JSON.parse(localStorage['compareItems'] || '[]'),
  cart: JSON.parse(localStorage['cartItems'] || '[]')
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginMassage: string = "";
  loginValid: boolean = false;
  loginInValid: boolean = false;
  form: FormGroup;
  submitted = false;
  returnUrl: string;
  cartproducts = [];
  product_img: any;
  public products: ProductNew[] = [];
  passworfieldtype = 'password';
  passwordicon = 'fa-eye fa-eye-slash';
  pstatus: boolean = false;

  constructor(private formBuilder: FormBuilder, public userService: UserService, private router: Router, private route: ActivatedRoute, public product_service: ProductService, private toaster: ToastrService) { }

  ngOnInit(): void {
    // current state cart product list
    this.cartproducts = state.cart;
    //check user already login or not
    const currentUser = localStorage.getItem("user_");
    if (currentUser) {
      this.router.navigate(['/dashboard'])
    }

    // form initialization
    this.form = new FormGroup({
      'phone_email': new FormControl(null, [Validators.required]),
      'login_password': new FormControl(null, [Validators.required, Validators.minLength(8), Validators.maxLength(15)]),
    });

    // store current return URL
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';


  }

  get phone_email() { return this.form.get('phone_email'); }
  get login_password() { return this.form.get('login_password'); }


  // Submit loginform 

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    let formData = this.form.value;
    let data = {
      'email_phone': formData.phone_email,
      'password': formData.login_password.trim(),
    }
    this.login(data);

  }

  login = async (data) => {
    this.userService.userLogin(data).subscribe(
      async res => {
        localStorage.setItem('user_', res['data'].user_id);
        localStorage.setItem('u_token', res['data'].token);
        localStorage.setItem('currentUser', JSON.stringify(res));

        this.loginValid = true;
        this.loginInValid = false;
        // this.loginMassage="Login successful";
        this.toaster.success('Login successful');
        /////////////////////////////////////////////////////////


        //Cart Details
        ///////////////////////////////////////////////////////////
        this.cartproducts = JSON.parse(localStorage.getItem('cartItems'))
        let productArr = [];
        if (this.cartproducts != null) {
          console.log('Primary Cart Not Empty');

          for (const element of this.cartproducts) {
            let product_price = 0;
            if (element.product_sale_price == null) {
              product_price = element.product_retail_price
            }
            else {
              product_price = element.product_sale_price
            }

            let cdata =
            {
              "pro_id": element._id,
              "pro_name": element.product_name,
              "pro_image": (element.product_image && element.product_image.length > 0 && element.product_image[0]) ? element.product_image[0].pro_image : 'assets/images/product/placeholder.jpg',
              "pro_slug": element.product_slug,
              "qty": element.quantity,
              "left_eye_qty": element.left_eye_qty,
              "right_eye_qty": element.right_eye_qty,
              "price": product_price,
              "addons": element.addons,
              "addonsprice": element.addonsprice
            }

            productArr.push(cdata);
          }

          let prodsendObj =
          {
            products: productArr
          }

          this.product_service.addToCartDbBulk(prodsendObj).subscribe(
            res => {

              let bodydata = res['data'];
              console.log('bodydata=========================>', bodydata);
              if (bodydata.hasOwnProperty('products')) {
                this.cartproducts = [];
                for (const element of res['data'].products) {
                  this.product_service.getproductsBySlugs(element.pro_slug).subscribe(product => {
                    if (product['data']) {
                      // Safely access product_image with proper null/undefined checks
                      this.product_img = (product['data'].product_image && product['data'].product_image.length > 0 && product['data'].product_image[0])
                        ? product['data'].product_image[0].pro_image
                        : 'assets/images/product/placeholder.jpg';
                      let data =
                      {
                        "_id": element.pro_id,
                        "product_image": [
                          {
                            "pro_image": this.product_img,
                            "status": "active"
                          },
                        ],
                        "cart_id": res['data']._id,
                        "product_name": element.pro_name,
                        "product_slug": element.pro_slug,
                        "quantity": element.qty,
                        "left_eye_qty": element.left_eye_qty,
                        "right_eye_qty": element.right_eye_qty,
                        "stock": (product['data'].stock - element.qty),
                        "product_sale_price": element.price,
                        "addons": element.addons,
                        "addonsprice": element.addonsprice
                      }
                      this.cartproducts.push(data);
                      this.products = this.cartproducts;
                      localStorage.setItem("cartItems", JSON.stringify(this.cartproducts));
                    }
                  })

                }
              }
            }
          )
        }
        else {
          console.log('Primary Cart Empty');
          this.product_service.allCartProducts().subscribe(
            res => {
              let bodydata = res['data'];
              console.log('bodydata=========================>', bodydata);
              if (bodydata) {
                if (bodydata.hasOwnProperty('products')) {
                  this.cartproducts = [];
                  for (const element of res['data'].products) {
                    this.product_service.getproductsBySlugs(element.pro_slug).subscribe(product => {
                      if (product['data']) {
                        // Safely access product_image with proper null/undefined checks
                        this.product_img = (product['data'].product_image && product['data'].product_image.length > 0 && product['data'].product_image[0])
                          ? product['data'].product_image[0].pro_image
                          : 'assets/images/product/placeholder.jpg';
                        let data =
                        {
                          "_id": element.pro_id,
                          "product_image": [
                            {
                              "pro_image": this.product_img,
                              "status": "active"
                            },
                          ],
                          "cart_id": res['data']._id,
                          "product_name": element.pro_name,
                          "product_slug": element.pro_slug,
                          "quantity": element.qty,
                          "left_eye_qty": element.left_eye_qty,
                          "right_eye_qty": element.right_eye_qty,
                          "stock": (product['data'].stock - element.qty),
                          "product_sale_price": element.price,
                          "addons": element.addons,
                          "addonsprice": element.addonsprice
                        }
                        this.cartproducts.push(data);
                        this.products = this.cartproducts;
                        state.cart.push(this.cartproducts);
                        localStorage.setItem("cartItems", JSON.stringify(this.cartproducts));
                        console.log('this.cartproducts', this.cartproducts);
                      }
                    })

                  }
                }
              }

            }
          )

        }
        setTimeout(() => {
          if (this.returnUrl != '/') {
            // login successful so redirect to return url
            this.router.navigateByUrl('settings-header', { skipLocationChange: true }).then(() => {
              this.router.navigate([this.returnUrl]);
            })
          }
          else {
            this.router.navigateByUrl('settings-header', { skipLocationChange: true }).then(() => {
              this.router.navigate(['dashboard']);
            })
          }
        }, 2500)

      },
      error => {
        // .... HANDLE ERROR HERE 
        this.loginValid = false;
        this.loginInValid = true;
        // this.loginMassage="Username and Password does not match";
        this.toaster.error(error.error.message);
      }
    );
  }

  changeIcon() {
    this.pstatus = !this.pstatus

    if (this.pstatus) {
      this.passworfieldtype = 'text';
      this.passwordicon = 'fa-fw fa-eye';

    }
    else {
      this.passworfieldtype = 'password';
      this.passwordicon = 'fa-eye fa-eye-slash';
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
