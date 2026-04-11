import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SecurityService } from 'src/security.service';

@Injectable({
  providedIn: 'root'
})
export class HomesliderService {
  constructor(private http: HttpClient, private securityService: SecurityService) {  }

  // get Stores
  getallSliderData(): Observable<any>{
    const url = environment.baseUrl + 'banner/list';
    return this.securityService.signedRequest('GET', url);
  }

  getallVendorSliderData(data): Observable<any>{
    const url = environment.baseUrl + 'vendorbanner/list';
    return this.securityService.signedRequest('POST', url, data);
  }

  getallvendorlist(): Observable<any>{
    const url = environment.baseUrl + 'vendorlist';
    return this.securityService.signedRequest('GET', url);
  }

}
