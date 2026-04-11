import { Component, OnInit, Injectable, PLATFORM_ID, Inject, SimpleChanges, DoCheck } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from "../../services/product.service";
import { ProductNew } from "../../classes/product";
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, DoCheck {

  cartproducts = [];
  product_img: any;

  user_: string
  public products: ProductNew[] = [];
  public search: boolean = false;

  public languages = [{
    name: 'English',
    code: 'en'
  }, {
    name: 'French',
    code: 'fr'
  }];

  public currencies = [{
    name: 'Euro',
    currency: 'EUR',
    price: 0.90 // price of euro
  }, {
    name: 'Rupees',
    currency: 'INR',
    price: 70.93 // price of inr
  }, {
    name: 'Pound',
    currency: 'GBP',
    price: 0.78 // price of euro
  }, {
    name: 'Dollar',
    currency: 'USD',
    price: 1 // price of usd
  }]

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService,
    private router: Router, public product_service: ProductService) {
  }

  ngOnInit(): void {
    this.user_ = localStorage.getItem("user_");

  }

  ngDoCheck(): void {
    this.products = JSON.parse(localStorage.getItem('cartItems'));
    this.user_ = localStorage.getItem("user_");
  }

  searchToggle() {
    this.search = !this.search;
  }

  changeLanguage(code) {
    if (isPlatformBrowser(this.platformId)) {
      this.translate.use(code)
    }
  }

  get getTotal(): Observable<number> {
    return this.product_service.cartTotalAmount();
  }

  get getTotalAddons(): Observable<number> {
    return this.product_service.cartAddonsTotalAmount();
  }

  removeItem(product: any) {
    this.product_service.removeCartItem(product);
    this.product_service.cartItems.subscribe(response => this.products = response);
  }

  changeCurrency(currency: any) {
    this.product_service.Currency = currency
  }

  logout() {
    event.preventDefault();
    localStorage.removeItem('u_token');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('user_');
    this.router.navigate(['/login'])
  }

}
