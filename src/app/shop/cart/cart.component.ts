import { ToastrService } from 'ngx-toastr';
import { element } from 'protractor';
import { Component, OnInit, OnChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductSlider } from '../../shared/data/slider';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";
import { NavigationStart, Router } from '@angular/router';
import { emit } from 'process';

const state = {

  products: JSON.parse(localStorage.getItem('products') || '[]'),
  wishlist: JSON.parse(localStorage['wishlistItems'] || '[]'),
  compare: JSON.parse(localStorage['compareItems'] || '[]'),
  cart: JSON.parse(localStorage['cartItems'] || '[]')
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {



  public products: ProductNew[] = [];
  public ProductSliderConfig: any = ProductSlider;
  cartproducts = [];
  product_img: any;
  cartproductlist = [];
  desableincrement: boolean = false;
  desabledecrement: boolean = false
  delay: boolean = false;
  productWishliststatus: boolean = false;
  shipping_charge_value = 0;
  tax_percentage_value = 0;
  totalstock: number = 0;

  constructor(public product_service: ProductService, private toaster: ToastrService, private router: Router, private cdr: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.products = JSON.parse(localStorage.getItem('cartItems'));
    console.log('this.products--------', this.products);
    this.product_service.cartItems.subscribe(response => response ? this.products = response : this.products = []);
    this.detectNavigationType();
    console.log("ocalStorage.getItem('tax')", localStorage.getItem('tax'));
    const effectiveVendorId = this.resolveEffectiveVendorFromCart();
    if (effectiveVendorId) {
      localStorage.setItem('vendor_id', effectiveVendorId);
      this.getShippingTax();
    }
  }

  private resolveEffectiveVendorFromCart(): string | null {
    const cartLines = JSON.parse(localStorage.getItem('cartItems') || '[]') || [];
    if (!Array.isArray(cartLines) || cartLines.length === 0) {
      return null;
    }
    const first = cartLines[0];
    return first?.effective_vendor_id || first?.fulfiller_vendor_id || first?.product_owner_id || null;
  }

  getShippingTax() {
    let vendorObj =
    {
      vendor_id: localStorage.getItem('vendor_id') ? localStorage.getItem('vendor_id') : ''
    }
    this.product_service.getallShippingTaxs(vendorObj).subscribe(
      res => {
        this.shipping_charge_value = res['data'][0].shipping_charge;
        this.tax_percentage_value = res['data'][0].tax_percentage;
        localStorage.setItem('shipping', this.shipping_charge_value.toString());
        localStorage.setItem('tax', this.tax_percentage_value.toString());
        // Trigger change detection manually
        this.cdr.detectChanges();
      },
      error => {
        this.toaster.error(error.error.message)
      }
    )
  }

  removeAddon(product: any, addonIndex: number): void {
    const addonToRemove = product.addons[addonIndex];
    console.log('addonToRemove', addonToRemove);
    // Remove the addon from the product's addons array
    product.addons.splice(addonIndex, 1);
    // Subtract the addon price from the total addons price
    if (product.addonsprice && !addonToRemove?.extra_document) {
      product.addonsprice -= addonToRemove.price;
    }



    this.product_service.updateCartQuantity(product, 0)
    // this.getTotal.subscribe();
  }

  private detectNavigationType(): void {
    // Check if the navigation is a hard refresh
    if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
      this.product_service.allCartProducts().subscribe(
        res => {
          let bodydata = res['data'];
          if (bodydata) {
            if (bodydata.hasOwnProperty('products')) {
              localStorage.setItem('cart_', res['data']._id)
              this.cartproducts = [];
              let shippingLoaded = false;
              for (const element of res['data'].products) {
                this.product_service.getproductsBySlugs(element.pro_slug).subscribe(product => {
                  if (product['data']) {
                    const effectiveVendorId = element.fulfiller_vendor_id || element.product_owner_id || product['data'].product_owner?._id;
                    if (effectiveVendorId) {
                      localStorage.setItem('vendor_id', String(effectiveVendorId));
                    }

                    // Safely access product_image with proper null/undefined checks
                    this.product_img = (product['data'].product_image && product['data'].product_image.length > 0 && product['data'].product_image[0])
                      ? product['data'].product_image[0].pro_image
                      : 'assets/images/product/placeholder.jpg';

                    // Safely access attributes array
                    const packValue = (product['data'].attributes && product['data'].attributes.length > 0 && product['data'].attributes[0])
                      ? product['data'].attributes[0].value
                      : '';

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
                      "addonsprice": element.addonsprice,
                      "product_owner_id": element.product_owner_id || product['data'].product_owner?._id,
                      "fulfiller_vendor_id": element.fulfiller_vendor_id || null,
                      "effective_vendor_id": effectiveVendorId,
                      "pack": packValue,
                    }
                    this.cartproducts.push(data);
                    this.products = this.cartproducts;
                    state.cart.push(this.cartproducts);
                    localStorage.setItem("cartItems", JSON.stringify(this.cartproducts));
                    if (!shippingLoaded && localStorage.getItem('vendor_id')) {
                      shippingLoaded = true;
                      this.getShippingTax();
                    }
                  }
                })
              }
            }
          }
        }
      )
    }
  }
  ngOnChanges(changes) {
  }

  public get getTotal(): Observable<number> {
    return this.product_service.cartTotalAmount();
  }

  // Increament
  increment(product, qty = 1) {
    console.log('product.stock', product.stock);
    console.log('product.quantity', product.quantity);

    this.desabledecrement = false;
    this.delay = true;
    setTimeout(() => {
      this.delay = false
    }, 1000);
    console.log('product.quantity===============', product.quantity);
    if (product.stock > 0) {
      product.stock = (product.stock - 1)
      product.quantity = product.quantity + 1

      let incremtstatus = this.product_service.updateCartQuantity(product, 0);
      console.log('incremtstatus------------------', incremtstatus);
      // this.getTotal.subscribe();
      this.desableincrement = false;
    }
    else {
      this.toaster.error('This product is out of stock.');
      this.desableincrement = true;
    }

    if (product.quantity >= 1) {
      this.desableincrement = false;
    }

    console.log('product.quantity===============', product.quantity);
  }

  // Decrement
  decrement(product, qty = -1) {
    console.log('product.stock', product.stock);
    console.log('product.quantity', product.quantity);

    this.desableincrement = false;
    this.delay = true;
    setTimeout(() => {
      this.delay = false
    }, 1000);


    if (product.quantity == 1) {
      this.desabledecrement = true;
    }
    else {
      product.stock = (product.stock + 1);
      product.quantity = product.quantity - 1
      this.desabledecrement = false;
      this.product_service.updateCartQuantity(product, 0);
      // this.getTotal.subscribe();
    }


  }

  // ------------------------------ Left Eye
  // Increament
  increment1(product, qty = 1) {

    this.desabledecrement = false;
    this.delay = true;
    setTimeout(() => {
      this.delay = false
    }, 1000);
    console.log('product.quantity===============', product.quantity);
    if (product.stock > 0) {
      product.stock = (product.stock - 1)
      product.quantity = product.quantity + 1
      product.left_eye_qty = product.left_eye_qty + 1

      this.totalstock = (product.left_eye_qty + product.right_eye_qty);

      let incremtstatus = this.product_service.updateCartQuantity(product, 0);
      console.log('incremtstatus------------------', incremtstatus);
      // this.getTotal.subscribe();
      this.desableincrement = false;
    }
    else {
      this.toaster.error('This product is out of stock.');
      this.desableincrement = true;
    }

    if (product.quantity >= 1) {
      this.desableincrement = false;
    }
    console.log('product.quantity===============', product.quantity);
  }

  // Decrement
  decrement1(product, qty = -1) {

    this.desableincrement = false;
    this.delay = true;
    setTimeout(() => {
      this.delay = false
    }, 1000);


    if (product.quantity == 1) {
      this.desabledecrement = true;
    }
    else {
      if (product.left_eye_qty > 0) {
        product.stock = (product.stock + 1);
        product.quantity = product.quantity - 1
        product.left_eye_qty = product.left_eye_qty - 1

        this.totalstock = (product.left_eye_qty + product.right_eye_qty);

        this.desabledecrement = false;
        this.product_service.updateCartQuantity(product, 0);
      }
      // this.getTotal.subscribe();
    }


  }

  // ------------------------------ Right Eye
  // Increament
  increment2(product, qty = 1) {
    this.desabledecrement = false;
    this.delay = true;
    setTimeout(() => {
      this.delay = false
    }, 1000);
    if (product.stock > 0) {
      product.stock = (product.stock - 1)
      product.quantity = product.quantity + 1
      product.right_eye_qty = product.right_eye_qty + 1

      this.totalstock = (product.left_eye_qty + product.right_eye_qty);


      let incremtstatus = this.product_service.updateCartQuantity(product, 0);
      console.log('incremtstatus------------------', incremtstatus);
      // this.getTotal.subscribe();
      this.desableincrement = false;
    }
    else {
      this.toaster.error('This product is out of stock.');
      this.desableincrement = true;
    }

    if (product.quantity >= 1) {
      this.desableincrement = false;
    }
  }

  // Decrement
  decrement2(product, qty = -1) {
    this.desableincrement = false;
    this.delay = true;
    setTimeout(() => {
      this.delay = false
    }, 1000);


    if (product.quantity == 1) {
      this.desabledecrement = true;
    }
    else {
      if (product.right_eye_qty > 0) {
        product.stock = (product.stock + 1);
        product.quantity = product.quantity - 1
        product.right_eye_qty = product.right_eye_qty - 1

        this.totalstock = (product.left_eye_qty + product.right_eye_qty);

        this.desabledecrement = false;
        this.product_service.updateCartQuantity(product, 0);
      }
      // this.getTotal.subscribe();
    }
  }

  public checkwishlist(product) {
    return this.product_service.wishlistProductCheck(product)
  }

  public addwishlist(product) {
    this.productWishliststatus = this.product_service.wishlistProductCheck(product)
    if (!this.productWishliststatus) {
      this.product_service.addToWishlist(product);
    }

  }

  public removeItem(product: any) {
    product.stock = (product.stock + product.quantity);
    this.product_service.removeCartItem(product);
    this.product_service.cartItems.subscribe(response => this.products = response);

  }

}
