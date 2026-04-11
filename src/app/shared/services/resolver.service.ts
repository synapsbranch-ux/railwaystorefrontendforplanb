import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { ProductNew } from '../classes/product';
import { ProductService } from './product.service';

@Injectable({
	providedIn: 'root'
})
export class Resolver implements Resolve<ProductNew> {
  
  public product: ProductNew = {};

  constructor(
    private router: Router,
    public productService: ProductService
  ) {}

  // Resolver
  async resolve(route: ActivatedRouteSnapshot): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Single Product Resolver Slug',route.params.slug); 
    localStorage.setItem('product_slug', route.params.slug);
    this.productService.getProductBySlug(route.params.slug).subscribe(productdt => {
      console.log('Single Product Resolver',productdt);
      if(productdt)
      {
        this.product = productdt
      }
      // if(!product) { // When product is empty redirect 404
      //     this.router.navigateByUrl('/pages/404', {skipLocationChange: true});
      // } else {
          
      // }
    })
    return this.product;
  }
}
