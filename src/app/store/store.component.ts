import { Component, OnInit } from '@angular/core';
import { StoreService } from 'src/app/shared/services/store.service';
import { Store } from 'src/app/shared/classes/store';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent implements OnInit {
  public stores: Store[] = [];

  constructor(public storeService: StoreService) { 
    this.storeService.getStoresMore.subscribe(response => {
      console.log(response);
      if(response["error"] === 0){
        console.log('Store response=====>>>', response["status"]);
        this.stores = response["data"];
      }
    });
  }

  ngOnInit(): void {
  }

  getMoreStores(){
    this.storeService.getStoresMore.subscribe(response => {
      console.log(response);
      if(response["error"] === 0){
        console.log('Store response=====>>>', response["status"]);
        this.stores = response["data"];
      }
    });
  }

}
