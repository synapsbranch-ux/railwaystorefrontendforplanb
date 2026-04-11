import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";
import { Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {

  public products: ProductNew[] = [];
  backlink: any
  constructor(private router: Router,
    public productService: ProductService) {
    this.productService.wishlistItems.subscribe(
      response => {
        this.products = response
      }



    );
  }

  ngOnInit(): void {

    let store_slug = localStorage.getItem('storeslug');
    if (store_slug) {
      this.backlink = `/vendor/${store_slug}`;
    }
    else {
      this.backlink = '/'
    }
  }

  public get getTotal(): Observable<number> {
    return this.productService.cartTotalAmount();
  }

  async addToCart(product: any) {
    let quantity = 1;
    const status = await this.productService.addToCart(product, quantity, false);
    this.getTotal.subscribe();
    product.stock = (product.stock - 1);
      // Introduce a delay of 1000ms (1 second) using RxJS timer
      timer(3000).pipe(
        switchMap(() => this.router.navigate(['/cart']))
      ).subscribe();

    this.removeItem(product);
  }

  removeItem(product: any) {
    this.productService.removeWishlistItem(product);
  }

}
