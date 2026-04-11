import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-store-3d-products',
  templateUrl: './store-3d-products.component.html',
  styleUrls: ['./store-3d-products.component.scss']
})
export class Store3DproductsComponent implements OnInit {

  public products: ProductNew[] = [];
  store_slug: any;
  cat_slug: any
  cat_id: any
  brandList = [];
  selectedBrand: any
  selectedBrandName: any
  categoryList = [];
  productList = [];
  // p: any
  currentPage: number = 1; // Initialize with default page number
  numItemsPerSection = 3;
  limit: number = 9;
  groupedItems = [];
  totalProducts: any;
  constructor(private router: Router,
    public productService: ProductService, private route: ActivatedRoute, private toastr: ToastrService) {
    this.productService.compareItems.subscribe(response => this.products = response);
  }

  ngOnInit(): void {
    if (localStorage.getItem('cur_page')) {
      this.currentPage = Number(localStorage.getItem('cur_page'));
    }
    if (localStorage.getItem('brand')) {
      this.selectedBrand = localStorage.getItem('brand')
    }

    this.route.paramMap.subscribe(params => {
      // Extract the 'slug' and 'page' values from the route parameters
      this.store_slug = params.get('storeSlug');
      this.cat_slug = params.get('catSlug');
    });
    if (this.cat_slug == 'all') {
      this.cat_slug = ''
      this.cat_id = ''
    }



    this.productService.getall3DBrands(this.store_slug).subscribe(
      res => {
        console.log('res=========', res['data'])
        this.brandList = res['data'];
        this.selectedBrandName = this.getBrandName(this.brandList, this.selectedBrand)
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });

    this.productService.getallEyeGlassCategoryWithSubcat().subscribe(
      res => {
        console.log('res=========', res['data'])
        this.categoryList = res['data'];

        if (this.cat_slug !== '' && this.cat_slug !== 'all') {
          let filter_cat = this.categoryList[0].filter((cat) => cat.category_slug === this.cat_slug);
          console.log('filter_cat', filter_cat);

          // Check if filter_cat has any elements before accessing the first one
          if (filter_cat.length > 0) {
            console.log('filter_cat id', filter_cat[0].category_id);
            this.cat_id = filter_cat[0].category_id;
          } else {
            console.log('No matching category found');
          }
        }

        let prodObj = {
          "product_category": this.cat_slug,
          "store_slug": this.store_slug,
          "brand": this.selectedBrand,
          "page": this.currentPage,
          "limit": this.limit
        }
        this.productService.getallFilteredProduct(prodObj).subscribe(
          res => {
            this.productList = res['data'].products
            this.totalProducts = res['data'].totalCount
            this.groupItemsIntoSections(this.productList);
          },
          error => {
            // .... HANDLE ERROR HERE 
            this.toastr.error(error.error.message)
          });

      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });


  }

  groupItemsIntoSections(items) {
    this.groupedItems = [];
    if (items) {
      for (let i = 0; i < items.length; i += this.numItemsPerSection) {
        const section = items.slice(i, i + this.numItemsPerSection);
        this.groupedItems.push(section);
      }
    }
  }

  getAllProducts() {

    this.cat_slug = '';
    this.selectedBrand = '';
    this.selectedBrandName = ''
    let pageNumber = 1;
    this.cat_id = '';;

    localStorage.setItem('cur_page', pageNumber.toString())
    localStorage.setItem('brand', this.selectedBrand);
    localStorage.setItem('cat_slug', this.cat_slug);
    localStorage.setItem('cur_cat', this.cat_slug);
    let prodObj = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": '',
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.getallFilteredProduct(prodObj).subscribe(
      res => {
        this.productList = res['data'].products
        this.totalProducts = res['data'].totalCount
        this.groupItemsIntoSections(this.productList);
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }

  getCAtegoryDeatils(Category: any) {
    let pageNumber = 1;
    localStorage.setItem('cur_page', pageNumber.toString())
    console.log('Category============', Category);
    if (!this.store_slug) {
      this.route.paramMap.subscribe(params => {
        this.store_slug = params.get('storeSlug');
        this.cat_slug = params.get('catSlug');
      });
    }
    this.router.navigateByUrl('settings-header', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/store-2d-products/${this.store_slug}/${Category.category_slug}`]);
    })
    // this.router.navigateByUrl(`/store-2d-products/${this.store_slug}/${Category.category_slug}`);
    this.cat_slug = Category.category_slug;
    this.cat_id = Category.category_id;
    let prodObj = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.getallFilteredProduct(prodObj).subscribe(
      res => {
        this.productList = res['data'].products
        this.totalProducts = res['data'].totalCount
        this.groupItemsIntoSections(this.productList);
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }

  changeBrandname(brand: any) {
    let pageNumber = 1;
    localStorage.setItem('cur_page', pageNumber.toString())
    this.selectedBrand = brand._id
    this.selectedBrandName = brand.brand_name;
    console.log('this.selectedBrandName----', this.selectedBrandName);
    localStorage.setItem('brand', this.selectedBrand);
    if (!this.store_slug) {
      this.route.paramMap.subscribe(params => {
        this.store_slug = params.get('storeSlug');
      });
    }
    if (!this.cat_slug) {
      this.cat_slug = 'all'
      this.cat_id = ''
    }
    console.log('`/store-2d-products/${this.store_slug}/${this.cat_slug}`', `/store-2d-products/${this.store_slug}/${this.cat_slug}`)
    this.router.navigateByUrl('settings-header', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/store-2d-products/${this.store_slug}/${this.cat_slug}`]);
    })
    let prodObj = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.getallFilteredProduct(prodObj).subscribe(
      res => {
        this.productList = res['data'].products
        this.groupItemsIntoSections(this.productList);
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }


  getBrandName(brandarr, brandId) {
    if (brandarr.length > 0) {
      for (const brand of brandarr) {
        if (brand._id == brandId) {
          return brand.brand_name
        }
      }
    }
    return null
  }

  onPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
    localStorage.setItem('cur_page', pageNumber.toString())

    // Create the request object
    let prodObj = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    };

    // Call the API to get the filtered products
    this.productService.getallFilteredProduct(prodObj).subscribe(
      res => {
        this.productList = res['data'].products;
        this.totalProducts = res['data'].totalCount
        this.groupItemsIntoSections(this.productList);
      },
      error => {
        // Handle error here
        this.toastr.error(error.error.message);
      }
    );
  }

}
