import { HomesliderService } from './../../../shared/services/homeslider.service';
import { Component, OnInit } from '@angular/core';
import { ProductSlider } from '../../../shared/data/slider';
import { Product } from '../../../shared/classes/product';
import { ProductService } from '../../../shared/services/product.service';
import { StoreService } from 'src/app/shared/services/store.service';
import { Store } from 'src/app/shared/classes/store';
import { Router } from '@angular/router';


@Component({
  selector: 'app-fashion-one',
  templateUrl: './fashion-one.component.html',
  styleUrls: ['./fashion-one.component.scss']
})
export class FashionOneComponent implements OnInit {

  public products: Product[] = [];
  public productCollections: any[] = [];
  public stores: Store[] = [];
  public homeslider:any=[];
  public allcategories:any=[];
  
  constructor(public productService: ProductService,public storeService: StoreService, public homesliderservice: HomesliderService) {

  }
  public ProductSliderConfig: any = ProductSlider;
  public sliders = [];

// Get store Data

  get(): void {
    this.storeService.getStores.subscribe(response => {

      if(response["error"] === 0){
        this.stores = response["data"];
      }
    });
  }


  ngOnInit(): void {
    this.get();
    // this.getvendorlist();
    // get all home slider date from API
    this.homesliderservice.getallSliderData().subscribe(
      res =>
      {
        this.sliders=res.data;
      }
    )

  }

// Vendor list, with matching slider on particular vendor 

  getvendorlist()
  {
    this.homesliderservice.getallvendorlist().subscribe(
      res =>
      {
        let vendors = res['data']
        vendors.map( (vid) =>
        {
          let SData=
          {
            vendor_id : vid._id
          }
          this.homesliderservice.getallVendorSliderData(SData).subscribe(
            res =>
            {
  
              for (const element of res.data) {
                this.sliders.push(element)
              }
            }
          )
        });
      }
    )
  }

  // Product Tab collection
  getCollectionProducts(collection) {
    return this.products.filter((item) => {
      if (item.collection.find(i => i === collection)) {
        return item
      }
    })
  }
}
