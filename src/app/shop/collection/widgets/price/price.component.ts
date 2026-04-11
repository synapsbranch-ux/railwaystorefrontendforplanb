import { ProductNew } from 'src/app/shared/classes/product';
import { ProductService } from 'src/app/shared/services/product.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Output, Input, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Options } from 'ng5-slider';

@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.scss']
})
export class PriceComponent implements OnInit {
  
  // Using Output EventEmitter
  @Output() priceFilter : EventEmitter<any> = new EventEmitter<any>();
  public products: ProductNew[] = [];
  // define min, max and range
  @Input() min: number;
  @Input() max: number;

  public collapse: boolean = true;
  public isBrowser: boolean = false;

  public price: any;
  maxdata=0;

  options: Options = {
    floor: 0,
    ceil: 9999
  };
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private route: ActivatedRoute, private productservice: ProductService) { 
    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true; // for ssr
    }
    // let catdata=
    // {
    // 'category': this.route.snapshot.paramMap.get('slug'),
    // }
    // this.productservice.getProductsBycat(catdata).subscribe(
    // res =>
    // {
    // this.products=res['data'];
    // let maxprice =  this.products.reduce((prev, curr) => (prev['product_sale_price'] < curr['product_sale_price']) ? curr : prev)
    // this.maxdata=maxprice['product_sale_price'];
    // this.options.ceil=maxprice['product_sale_price'];
    // }
    // )

  }
  
  ngOnInit(): void {  }

  // Range Changed
  appliedFilter(event: any) {
    this.price = { minPrice: event.value, maxPrice: event.highValue };
    this.priceFilter.emit(this.price);
  }

}
