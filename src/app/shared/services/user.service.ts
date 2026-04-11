import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SecurityService } from 'src/security.service';
import { Otp } from '../classes/otp';
import { Usersignup } from '../classes/usersignup';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  useraddressid: any
  userorderid: any
  public Otp;
  public Usersignup;
  constructor(private http: HttpClient, private router: Router, private securityService: SecurityService) { }

  genOtp(data: any): Observable<Otp> {
    const url = environment.baseUrl + 'user/generateOTP';
    return this.securityService.signedRequest('POST', url, data);
  }

  genOtpPages(data: any): Observable<Otp> {
    const url = environment.baseUrl + 'user/generateOTPPages';
    return this.securityService.signedRequest('POST', url, data);
  }


  userSignUp(data: any): Observable<Usersignup> {
    const url = environment.baseUrl + 'user/signup';
    return this.securityService.signedRequest('POST', url, data);
  }

  vendorSignUp(data: any): Observable<Usersignup> {
    const url = environment.baseUrl + 'vendor/signup';
    return this.securityService.signedRequest('POST', url, data);
  }

  vendorgenerateOTP(data: any): Observable<any> {
    const url = environment.baseUrl + 'vendor/generateOTP';
    return this.securityService.signedRequest('POST', url, data);
  }

  userLogin(data) {
    const url = environment.baseUrl + 'user/login';
    return this.securityService.signedRequest('POST', url, data);
  }

  userContact(data) {
    const url = environment.baseUrl + 'user/contact';
    return this.securityService.signedRequest('POST', url, data);
  }

  userVendorRoomCount(data) {
    const url = environment.baseUrl + 'user/vendor-roomcheck';
    return this.securityService.signedRequest('POST', url, data);
  }



  getAllAddress() {
    const url = environment.baseUrl + 'user/addressList';
    return this.securityService.signedRequest('GET', url);
  }
  getAllOrderList() {
    const url = environment.baseUrl + 'user/orderList';
    return this.securityService.signedRequest('GET', url);
  }
  getAllOrderDetailsList(data) {
    const url = environment.baseUrl + 'user/orderList';
    return this.securityService.signedRequest('POST', url, data);
  }
  getSingleAddress(data: any) {
    const url = environment.baseUrl + 'user/updateAddress';
    return this.securityService.signedRequest('POST', url, data);
  }
  getUserDetails() {
    const url = environment.baseUrl + 'user/details';
    return this.securityService.signedRequest('GET', url);
  }
  userUpdateAddress(data: any) {
    const url = environment.baseUrl + 'user/updateAddress';
    return this.securityService.signedRequest('POST', url, data);
  }

  addNewAddress(data: any) {
    const url = environment.baseUrl + 'user/addAddress';
    return this.securityService.signedRequest('POST', url, data);
  }

  getSingleAddressDetails(data: any) {
    const url = environment.baseUrl + 'user/addressDetails';
    return this.securityService.signedRequest('POST', url, data);
  }
  setDefaultAddress(data: any) {
    const url = environment.baseUrl + 'user/updateAddress';
    return this.securityService.signedRequest('POST', url, data);
  }

  deleteAddress(data: any) {
    const url = environment.baseUrl + 'user/deleteAddress';
    return this.securityService.signedRequest('POST', url, data);
  }

  userUpdateProdile(data: any) {
    const url = environment.baseUrl + 'user/update';
    return this.securityService.signedRequest('POST', url, data);
  }

  changePassword(data: any) {
    const url = environment.baseUrl + 'user/changepassword';
    return this.securityService.signedRequest('POST', url, data);
  }

  samepasswordcheck(data: any) {
    const url = environment.baseUrl + 'user/checkSamePassword';
    return this.securityService.signedRequest('POST', url, data);
  }

  forgotPassword(data: any) {
    const url = environment.baseUrl + 'user/forgotpassword';
    return this.securityService.signedRequest('POST', url, data);
  }

  setUserAddressid(userAddtrss: any) {
    this.useraddressid = userAddtrss;
  }

  getUserAddressid() {
    return this.useraddressid;
  }

  setUserOrderid(userOrderId: any) {
    this.userorderid = userOrderId;
  }

  getUserOrderid() {
    return this.userorderid;
  }

  isTokenExpired(token: string): boolean {
    if (!token) {
      return true; // No token means it's not valid or expired
    }

    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the payload
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds

    return payload.exp < currentTime; // Check if token is expired
  }

  logout() {
    localStorage.removeItem('u_token');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('user_');
    localStorage.removeItem('vendor_id');
    this.router.navigate(['/login'])
  }

  sendAffiliateMail(data) {
    const url = environment.baseUrl + 'user/sendAffiliateMail';
    return this.securityService.signedRequest('POST', url, data);
  }

  sendAffinityMail(data) {
    const url = environment.baseUrl + 'user/sendAffinityMail';
    return this.securityService.signedRequest('POST', url, data);
  }

  sendCreateBusinessAccountMail(data) {
    const url = environment.baseUrl + 'user/sendCreateBusinessAccountMail';
    return this.securityService.signedRequest('POST', url, data);
  }

}
