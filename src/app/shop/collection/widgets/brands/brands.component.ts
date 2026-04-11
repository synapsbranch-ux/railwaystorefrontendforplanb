import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProductNew } from '../../../../shared/classes/product';

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit {

  @Input() products: ProductNew[] = [];
  @Input() brands: any[] = [];

  @Output() brandsFilter: EventEmitter<any> = new EventEmitter<any>();
  
  public collapse: boolean = true;

  constructor() { 
  }

  ngOnInit(): void {
  }

  get filterbyBrand() {
    const uniqueBrands = [];
    this.products.filter((product) => {
      if (product.product_store) {
console.log('Product Store Lists  ===', product.product_store[0].store_name);

        const index = uniqueBrands.indexOf(product.product_store[0].store_name)
        if (index === -1) uniqueBrands.push(product.product_store[0].store_name)
      }
    })
    return uniqueBrands
  }

  appliedFilter(event) {
    let index = this.brands.indexOf(event.target.value);  // checked and unchecked value
    if (event.target.checked)   
      this.brands.push(event.target.value); // push in array cheked value
    else 
      this.brands.splice(index,1);  // removed in array unchecked value  
    
    let brands = this.brands.length ? { brand: this.brands.join(",") } : { brand: null };
    this.brandsFilter.emit(brands);
  }

  // check if the item are selected
  checked(item){
    if(this.brands.indexOf(item) != -1){
      return true;
    }
  }

}
