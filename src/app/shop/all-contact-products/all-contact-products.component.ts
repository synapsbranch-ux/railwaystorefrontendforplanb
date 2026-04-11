import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";
import { ToastrService } from 'ngx-toastr';
import { HomesliderService } from 'src/app/shared/services/homeslider.service';
import { CriptoService } from 'src/app/shared/services/cripto.service';

@Component({
  selector: 'app-all-contact-products',
  templateUrl: './all-contact-products.component.html',
  styleUrls: ['./all-contact-products.component.scss']
})
export class AllContactProductsComponent implements OnInit {
  @Input() store_slug: string | undefined;
  @Input() currency: any = this.productService.Currency; // Default Currency 
  public ImageSrc: string
  public products: ProductNew[] = [];
  public sliders = [];
  cat_id: any
  brandList = [];
  selectedBrand: any
  selectedBrandName: any
  productList = [];
  topBransList = []
  // p: any
  showBrand: boolean = false;
  currentPage: number = 1; // Initialize with default page number
  limit: number = 12;
  totalProducts: any;
  isLoading: boolean = false;
  hasMoreProducts: boolean = true; // flag to track if more products exist
  paginatedBrandList = []; // Brands to display
  currentIndex = 0;
  itemsPerPage = 28; // Number of brands to show per row
  // persistence flags
  private restoring: boolean = false;
  private restoredScrollY: number | null = null;
  private didRestoreOnce: boolean = false;

  constructor(private router: Router,
    public productService: ProductService, private route: ActivatedRoute, private toastr: ToastrService, private homesliderservice: HomesliderService, private criptoService: CriptoService) {
    this.productService.compareItems.subscribe(response => this.products = response);
  }

  // ------------------
  // Persistence helpers
  // ------------------
  private buildStateKey(): string {
    return `contactProductsState:${this.store_slug || ''}:${this.selectedBrand || ''}`;
  }

  private hasSavedState(): boolean {
    try { return !!localStorage.getItem(this.buildStateKey()); } catch { return false; }
  }

  private saveState(savePage: boolean = true): void {
    try {
      const lastLoadedPage = Math.max(1, this.currentPage - 1);
      const prev = JSON.parse(localStorage.getItem(this.buildStateKey()) || '{}');
      const data = {
        page: savePage ? lastLoadedPage : (prev.page || lastLoadedPage),
        scrollY: window.pageYOffset || 0,
        selectedBrand: this.selectedBrand
      };
      localStorage.setItem(this.buildStateKey(), JSON.stringify(data));
    } catch { }
  }

  private clearSavedState(): void {
    try { localStorage.removeItem(this.buildStateKey()); } catch { }
  }

  private async tryRestoreState(): Promise<boolean> {
    try {
      const raw = localStorage.getItem(this.buildStateKey());
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved.page !== 'number') return false;

      this.restoring = true;
      this.productList = [];
      this.currentPage = 1;
      this.hasMoreProducts = true;
      this.restoredScrollY = Number(saved.scrollY) || 0;

      await this.loadUpToPage(saved.page);

      this.currentPage = saved.page + 1;
      this.restoring = false;
      this.restoreScrollWithRetries(this.restoredScrollY || 0, saved.page, 12, 12);
      return true;
    } catch {
      return false;
    }
  }

  private async loadUpToPage(targetPage: number): Promise<void> {
    for (let p = 1; p <= targetPage; p++) {
      const result = await this.fetchProducts(p);
      this.productList = [...this.productList, ...result.products];
      if (!result.hasMore) { this.hasMoreProducts = false; break; }
    }
  }

  private fetchProducts(page: number): Promise<{ products: any[]; hasMore: boolean }> {
    const prodObj: any = {
      product_category: this.cat_id,
      store_slug: this.store_slug,
      brand: this.selectedBrand,
      page,
      limit: this.limit
    };
    return new Promise((resolve, reject) => {
      this.productService.getContactFilterdProductList(prodObj).subscribe(
        (res: any) => {
          const products = (res && res.data && res.data.products) ? res.data.products : [];
          const hasMore = products.length > 0;
          resolve({ products, hasMore });
        },
        (err: any) => reject(err)
      );
    });
  }

  private restoreScrollWithRetries(targetY: number, savedPage: number, limit: number, maxAttempts: number) {
    let attempts = 0;
    const tryScroll = () => {
      attempts++;
      const ready = document.body.scrollHeight > targetY || (this.productList.length >= savedPage * this.limit);
      if (ready) {
        const y = targetY > 0 ? targetY : this.estimateYForPage(savedPage);
        window.scrollTo({ top: y });
        return;
      }
      if (attempts < maxAttempts) {
        requestAnimationFrame(tryScroll);
      }
    };
    setTimeout(() => requestAnimationFrame(tryScroll), 100);
  }

  private estimateYForPage(page: number): number {
    const total = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const pagesLoaded = Math.max(1, page);
    const fraction = Math.min(0.95, (pagesLoaded - 1) / pagesLoaded);
    return Math.floor(total * fraction);
  }

  ngOnInit(): void {
    if (localStorage.getItem('top_brands')) {
      this.topBransList = JSON.parse(localStorage.getItem('top_brands'));
      console.log('this.topBransList----------------', this.topBransList)
    }

    this.route.queryParams.subscribe(params => {
      this.selectedBrand = this.criptoService.decryptParam(params['brand']);
      console.log('Decrypted Params:', this.criptoService.decryptParam(params['brand']));
    });
    
    // this.route.queryParams.subscribe(params => {
    //   this.selectedBrand = params['brand'] ? this.criptoService.decryptParam(params['brand']) : '';
    //   console.log('Decrypted Params:', this.selectedBrand || 'No brand');
    // });

    

    if (!this.store_slug) {
      this.route.paramMap.subscribe(params => {
        // Extract the 'storeSlug' value from the route parameters
        this.store_slug = params.get('storeSlug');
      });
    }
    this.productService.getallContactBrands(this.store_slug).subscribe(
      res => {
        console.log('res=========', res['data'])
        this.brandList = res['data'];
        this.updatePaginatedBrandList();
        this.selectedBrandName = this.getBrandName(this.brandList, this.selectedBrand)
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });

    let storeObj =
    {
      store_slug: this.store_slug
    }
    // get all home slider date from API
    this.homesliderservice.getallVendorSliderData(storeObj).subscribe(
      res => {
        this.sliders = res.data;
      },
      error => {
        this.toastr.error(error.error.message);
        this.router.navigateByUrl('/')
      }
    );

    // Save state when navigating away via router
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationStart) {
        this.saveState();
      }
    });

    // Try to restore; if nothing saved, load normally
    this.tryRestoreState().then(restored => {
      this.didRestoreOnce = restored;
      if (!restored) this.loadProducts();
    });
  }


  updatePaginatedBrandList() {
    this.paginatedBrandList = this.brandList.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);
  }

  showNext() {
    if (this.currentIndex + this.itemsPerPage < this.brandList.length) {
      this.currentIndex += this.itemsPerPage;
      this.updatePaginatedBrandList();
    }
  }

  showPrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex -= this.itemsPerPage;
      this.updatePaginatedBrandList();
    }
  }


  // Method to load products from the API
  loadProducts(): void {
    if (this.isLoading || !this.hasMoreProducts) return;

    this.isLoading = true;
    let prodObj = {
      "product_category": this.cat_id,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.getContactFilterdProductList(prodObj).subscribe(
      (res: any) => {
        if (res['data'].hasOwnProperty('products') && res['data'].products.length > 0) {
          // Append the new products to the existing list
          this.productList = [...this.productList, ...res['data'].products];
          this.currentPage++; // Increment the page number for the next load
        } else {
          this.hasMoreProducts = false; // No more products available
        }
        this.isLoading = false;
        this.saveState();
      },
      (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    );
  }

  // Listen to window scroll event to trigger pagination
  @HostListener('window:scroll', [])
  onScroll(): void {
    const windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    const windowBottom = windowHeight + window.pageYOffset;

    if (windowBottom >= docHeight - 100) {
      // If scrolled near the bottom, load more products
      this.loadProducts();
    }
    this.saveState(false);
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload() {
    this.saveState();
  }

  barndPopup() {
    this.showBrand = true;
  }

  barndPopupClose() {
    this.showBrand = false;
  }

  getAllProducts() {
    this.cat_id = '';
    this.selectedBrand = '';
    this.selectedBrandName = ''
    this.currentPage = 1;
    let prodObj = {
      "product_category": '',
      "store_slug": this.store_slug,
      "brand": '',
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.getContactFilterdProductList(prodObj).subscribe(
      res => {
        this.productList = res['data'].products
        this.totalProducts = res['data'].totalCount

      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });

    // Navigate with encrypted query params to update the URL (only query params are encrypted)
    this.router.navigate([`/contact-products/${this.store_slug}`], {
      queryParams: {
        brand: this.criptoService.encryptParam(this.selectedBrand), // Encrypt selectedBrand for URL query param
      }
    });
    this.clearSavedState();
    window.scrollTo({ top: 0 });
  }

  changeBrandname(brand: any) {
    this.showBrand = false;
    this.currentPage = 1;
    this.selectedBrand = brand._id
    this.selectedBrandName = brand.brand_name;
    this.router.navigate(
      ['/contact-products', this.store_slug], // Absolute path navigation
      {
        queryParams: {
          brand: this.criptoService.encryptParam(this.selectedBrand),  // Encrypt brand ID for the URL
        }
      }
    );
    let prodObj = {
      "product_category": this.cat_id,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.getContactFilterdProductList(prodObj).subscribe(
      res => {
        this.productList = res['data'].products
        this.totalProducts = res['data'].totalCount

      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
    this.clearSavedState();
    window.scrollTo({ top: 0 });
  }

  // Add to Wishlist
  addToWishlist(product: any) {
    product.addonsprice = 0;
    let addonSelectedResult = [];
    product.addons = addonSelectedResult
    this.productService.addToWishlist(product);
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

}
