import { environment } from './../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SecurityService } from 'src/security.service';

const state = {
  checkoutItems: JSON.parse(localStorage['checkoutItems'] || '[]')
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient, private router: Router, private securityService: SecurityService) { }

  // Get Checkout Items
  public get checkoutItems(): Observable<any> {
    const itemsStream = new Observable(observer => {
      observer.next(state.checkoutItems);
      observer.complete();
    });
    return <Observable<any>>itemsStream;
  }
  

  // Create order
  public createOrder2(product: any, details: any, orderId: any, amount: any) {
    var item = {
        shippingDetails: details,
        product: product,
        orderId: orderId,
        totalAmount: amount
    };
    state.checkoutItems = item;
    localStorage.setItem("checkoutItems", JSON.stringify(item));
    localStorage.removeItem("cartItems");
    this.router.navigate(['/checkout/success', orderId]);
  }

  getAllAddress()
  {
    const url = environment.baseUrl + 'user/addressList';
    return this.securityService.signedRequest('GET', url);
  }

  userCreateOrder(data:Object)
  {
    const url = environment.baseUrl + 'user/orderCreate';
    return this.securityService.signedRequest('POST', url, data);
  }

  userCreateOrderPayment(data:Object)
  {
    const url = environment.baseUrl + 'user/orderPayment';
    return this.securityService.signedRequest('POST', url, data);
  }

  userSingleOrderDetails(data:Object)
  {
    const url = environment.baseUrl + 'user/orderDetails';
    return this.securityService.signedRequest('POST', url, data);
  }

  fetchCoupons(){
    const url = environment.baseUrl + 'user/couponsList';
    return this.securityService.signedRequest('GET', url);
  }

  searchCouponByCouponName(search: any) {
    const url = environment.baseUrl + `user/coupons/search?search=${search}`;
    return this.securityService.signedRequest('GET', url);
  }

  searchCouponByCouponNameAndCode(data: Object) {
    const url = environment.baseUrl + 'user/coupons/search-name-code';
    return this.securityService.signedRequest('POST', url, data);
  }

  checkCouponUsage(data:Object){
    const url = environment.baseUrl + 'user/coupons/checkUsage';
    return this.securityService.signedRequest('POST', url, data);
  }
  
  
}
