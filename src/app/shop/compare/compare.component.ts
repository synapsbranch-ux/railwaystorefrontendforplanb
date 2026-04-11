import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent implements OnInit {

  public products: ProductNew[] = [];

  constructor(private router: Router, 
    public productService: ProductService) {
    this.productService.compareItems.subscribe(response => this.products = response);
  }

  ngOnInit(): void {
  }

  async addToCart(product: any) {
    const status = await this.productService.addToCart(product,1,false);
    if(status) {
      this.router.navigate(['/cart']);
    }
  }

  removeItem(product: any) {
    this.productService.removeCompareItem(product);
  }

}
