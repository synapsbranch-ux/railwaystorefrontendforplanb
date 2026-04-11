import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Store } from '../classes/store';
import { SecurityService } from 'src/security.service';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  public Stores
  constructor(private http: HttpClient, private securityService: SecurityService) {  }

  // get Stores
  public get getStores(): Observable<Store[]>{
    const body={"page": 1, "limit": 100}
    const url = environment.baseUrl + 'stores';
    this.Stores = this.securityService.signedRequest('POST', url, body);
    console.log('Store Service called!', this.Stores);
    return this.Stores;
  }
  public get getStoresMore(): Observable<Store[]>{
    const body={"page": 1, "limit": 50}
    const url = environment.baseUrl + 'stores';
    this.Stores = this.securityService.signedRequest('POST', url, body);
    
    return this.Stores;
  }
  
  roomAvailableCheck(data: any): Observable<any>{
    const url = environment.baseUrl + 'stores/roomconfiguration';
    return this.securityService.signedRequest('POST', url, data);
  } 

  storeviewcount(data: any): Observable<any>{
    const url = environment.baseUrl + 'stores/storeview';
    return this.securityService.signedRequest('POST', url, data);
  } 

  vendorstoredetails(data: any): Observable<any>{
    const url = environment.baseUrl + 'stores/vendor-store-details';
    return this.securityService.signedRequest('POST', url, data);
  } 

}
