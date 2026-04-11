import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-all-2d-products',
  templateUrl: './all-2d-products.component.html',
  styleUrls: ['./all-2d-products.component.scss']
})
export class AllTwoDProductsComponent implements OnInit {
  @Input() store_slug: string | undefined;
  @Input() currency: any = this.productService.Currency; // Default Currency 
  public ImageSrc: string
  public products: ProductNew[] = [];
  cat_slug: any = '';
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
    if (localStorage.getItem('cur_page_2d')) {
      this.currentPage = Number(localStorage.getItem('cur_page_2d'));
    }
    else {
      this.currentPage = 1
    }
    if (localStorage.getItem('brand')) {
      this.selectedBrand = localStorage.getItem('brand')
    }
    else {
      this.selectedBrand = ''
    }

    if (localStorage.getItem('cat_slug')) {
      this.cat_slug = localStorage.getItem('cat_slug')
    }
    else {
      this.cat_slug = ''
    }

    if (!this.store_slug) {
      this.route.paramMap.subscribe(params => {
        // Extract the 'storeSlug' value from the route parameters
        this.store_slug = params.get('storeSlug');
      });
    }
    this.productService.getall2DBrands(this.store_slug).subscribe(
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
        this.productService.get2DProductList(prodObj).subscribe(
          res => {
            this.productList = res['data'].products
            this.totalProducts = res['data'].totalCount
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

  getAllProducts() {

    this.cat_slug = '';
    this.cat_id = '';
    this.selectedBrand = '';
    this.selectedBrandName = ''
    let pageNumber = 1;
    localStorage.setItem('cur_page_2d', pageNumber.toString())
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
    this.productService.get2DProductList(prodObj).subscribe(
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
    localStorage.setItem('cur_page_2d', pageNumber.toString())
    localStorage.setItem('cur_cat', Category.category_slug)
    console.log('Category============', Category);
    this.cat_slug = Category.category_slug;
    this.cat_id = Category.category_id;
    let prodObj = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.get2DProductList(prodObj).subscribe(
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
    localStorage.setItem('cur_page_2d', pageNumber.toString())
    this.selectedBrand = brand._id
    this.selectedBrandName = brand.brand_name;
    console.log('this.selectedBrandName----', this.selectedBrandName);
    localStorage.setItem('brand', this.selectedBrand);
    let prodObj = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.get2DProductList(prodObj).subscribe(
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


  groupItemsIntoSections(items) {
    this.groupedItems = [];
    if (items) {
      for (let i = 0; i < items.length; i += this.numItemsPerSection) {
        const section = items.slice(i, i + this.numItemsPerSection);
        this.groupedItems.push(section);
      }
    }
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
    localStorage.setItem('cur_page_2d', pageNumber.toString())
    console.log('pageNumber================', pageNumber);
    // Do whatever you need to do when the page changes
    // For example, fetch data for the new page
    let prodObj = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.get2DProductList(prodObj).subscribe(
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

}
