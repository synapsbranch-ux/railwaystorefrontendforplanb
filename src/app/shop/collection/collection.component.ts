import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from '../../shared/classes/product';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

const state = {

  products: JSON.parse(localStorage['products'] || '[]'),
  wishlist: JSON.parse(localStorage['wishlistItems'] || '[]'),
  compare: JSON.parse(localStorage['compareItems'] || '[]'),
  cart: JSON.parse(localStorage['cartItems'] || '[]')
}

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {

  public grid: string = 'col-xl-3 col-md-6';
  public layoutView: string = 'grid-view';
  public products: ProductNew[] = [];
  public product_list: ProductNew[] = [];
  public minPrice: number = 0;
  public maxPrice: number = 12000;
  public tags: any[] = [];
  public category: string;
  public pageNo: number = 1;
  public paginate: any = {}; // Pagination use only
  public sortBy: string; // Sorting Order
  public mobileSidebar: boolean = false;
  public loader: boolean = true;
  categories_image: any;
  no_results: any = 0
  storeurl: any;
  store_slug:any
  page_no:any

  constructor(private route: ActivatedRoute, private router: Router,
    private viewScroller: ViewportScroller, public productService: ProductService, private toastr : ToastrService) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      // Extract the 'slug' and 'page' values from the route parameters
      this.store_slug = params.get('slug');
      this.page_no = params.get('page');
    });

    let catdata =
    {
      'store_slug': this.store_slug,
      "page": 1,
      "limit": 100
    }
    this.productService.get2DProductList(catdata).subscribe(
      res => {
        this.products = res['data'].product_list;
        this.product_list = res['data'].product_list;
        this.no_results = res['data'].product_count;
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
   });
    // Get Query params..
    this.route.queryParams.subscribe(params => {
      console.log('Param Details in collection page', params);
      this.minPrice = params.minPrice ? params.minPrice : this.minPrice;
      this.maxPrice = params.maxPrice ? params.maxPrice : this.maxPrice;
      this.sortBy = params.sortBy ? params.sortBy : 'ascending';
      this.pageNo = params.page ? params.page : this.pageNo;
      // Sorting Filter
      this.products = this.productService.sortProducts(this.product_list, this.sortBy);
      // Price Filter
      this.products = this.products.filter((item: any) => {
        let product_price = 0;
        if (item.product_sale_price == null) {
          product_price = item.product_retail_price
        }
        else {
          product_price = item.product_sale_price
        }
        return (product_price >= this.minPrice && product_price <= this.maxPrice)
      });

      console.log('Product Price Check', this.products);

      // Paginate Products
      this.paginate = this.productService.getPager(this.products.length, +this.pageNo);     // get paginate object from service
      this.products = this.products.slice(this.paginate.startIndex, this.paginate.endIndex + 1); // get current page of items
      console.log('Product Paginate Check', this.products);
    })

    this.storeurl =`${environment.storeUrl}/${this.store_slug}/${this.page_no}`;
  }


  // Append filter value to Url
  updateFilter(tags: any) {
    tags.page = null; // Reset Pagination
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: tags,
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products'); // Anchore Link
    });
  }

  // SortBy Filter
  sortByFilter(value) {
    console.log('================>>', this.products);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sortBy: value ? value : null },
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products'); // Anchore Link

    });
  }

  // Clear Tags
  removeAllTags() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products'); // Anchore Link
    });
  }

  // product Pagination
  setPage(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page },
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.setOffset([10, 10]);
      this.viewScroller.scrollToAnchor('products'); // Anchore Link
    });
  }

  // Change Grid Layout
  updateGridLayout(value: string) {
    this.grid = value;
  }

  // Change Layout View
  updateLayoutView(value: string) {
    this.layoutView = value;
    if (value == 'list-view')
      this.grid = 'col-lg-12';
    else
      this.grid = 'col-xl-3 col-md-6';
  }

  // Mobile sidebar
  toggleMobileSidebar() {
    this.mobileSidebar = !this.mobileSidebar;
  }

}
