import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";
import { ToastrService } from 'ngx-toastr';
import { HomesliderService } from 'src/app/shared/services/homeslider.service';
import { CriptoService } from 'src/app/shared/services/cripto.service';

@Component({
  selector: 'app-all-2d-3d-products',
  templateUrl: './all-2d-3d-products.component.html',
  styleUrls: ['./all-2d-3d-products.component.scss']
})
export class AllTwoDThreeDProductsComponent implements OnInit {
  @Input() store_slug: string | undefined;
  @Input() currency: any = this.productService.Currency; // Default Currency 
  public ImageSrc: string
  public products: ProductNew[] = [];
  cat_id: any = '';
  cat_slug: any = '';
  brandList = [];
  selectedBrand: any = '';
  selectedBrandName: any
  categoryList = [];
  productList: ProductNew[] = [];
  noProducts: boolean = false;
  showBrand: boolean = false;
  activeCategoryIndex: number = 1;
  tag_id: any; // retained for backward reference but not used for API calls
  tag_ids: string[] = [];
  // p: any
  currentPage: number = 1; // Initialize with default page number
  limit: number = 12;
  totalProducts: any;
  isLoading: boolean = false;
  hasMoreProducts: boolean = true; // flag to track if more products exist
  public sliders = [];
  paginatedBrandList = []; // Brands to display
  currentIndex = 0;
  itemsPerPage = 28; // Number of brands to show per row
  // State persistence
  private restoring: boolean = false;
  private restoredScrollY: number | null = null;
  private didRestoreOnce: boolean = false;

  // Debug properties for tracking navigation
  private isNavigatingBack: boolean = false;
  private isNavigatingAway: boolean = false;

  // Monitor scroll position changes
  private lastKnownScrollY: number = 0;
  private scrollMonitorInterval: any = null;

  constructor(private router: Router,
    public productService: ProductService, private route: ActivatedRoute, private toastr: ToastrService, private homesliderservice: HomesliderService, private criptoService: CriptoService) {
    this.productService.compareItems.subscribe(response => this.products = response);

    // Start monitoring scroll position changes
    this.startScrollMonitor();
  }

  ngOnDestroy(): void {
    // Stop scroll monitoring
    this.stopScrollMonitor();
    // Persist latest page and scroll on destroy
    this.saveState();
  }

  // Monitor scroll position to detect unwanted changes
  private startScrollMonitor(): void {
    this.lastKnownScrollY = window.pageYOffset || 0;
    this.scrollMonitorInterval = setInterval(() => {
      const currentScrollY = window.pageYOffset || 0;
      if (Math.abs(currentScrollY - this.lastKnownScrollY) > 5) {
        this.lastKnownScrollY = currentScrollY;
      }
    }, 100);
  }

  private stopScrollMonitor(): void {
    if (this.scrollMonitorInterval) {
      clearInterval(this.scrollMonitorInterval);
      this.scrollMonitorInterval = null;
    }
  }

  // ------------------
  // State persistence helpers
  // ------------------
  private buildStateKey(): string {
    const tags = (this.tag_ids || []).join(',');
    return `allProductsState:${this.store_slug || ''}:${this.cat_slug || ''}:${this.selectedBrand || ''}:${tags}`;
  }

  private hasSavedState(): boolean {
    try { return !!localStorage.getItem(this.buildStateKey()); } catch { return false; }
  }

  private saveState(savePage: boolean = true): void {
    // Don't save state during restoration or immediately after browser back navigation
    if (this.restoring || this.isNavigatingBack) {
      return;
    }

    try {
      const currentScrollY = window.pageYOffset || 0;

      const lastLoadedPage = Math.max(1, this.currentPage - 1); // currentPage points to next page to fetch
      const data = {
        page: savePage ? lastLoadedPage : (JSON.parse(localStorage.getItem(this.buildStateKey()) || '{}').page || lastLoadedPage),
        scrollY: currentScrollY,
        cat_slug: this.cat_slug,
        selectedBrand: this.selectedBrand,
        tag_ids: this.tag_ids
      };
      localStorage.setItem(this.buildStateKey(), JSON.stringify(data));
    } catch (error) {
      // Error handling
    }
  }

  private clearSavedState(): void {
    try { localStorage.removeItem(this.buildStateKey()); } catch { }
  }

  private async tryRestoreState(): Promise<boolean> {
    try {
      const raw = localStorage.getItem(this.buildStateKey());

      if (!raw) {
        return false;
      }

      const saved = JSON.parse(raw);

      if (!saved || typeof saved.page !== 'number') {
        return false;
      }

      // If this is a page refresh (not browser back), scroll to top
      if (!this.isNavigatingBack &&
        (performance.navigation?.type === 1 ||
          (performance.getEntriesByType &&
            (performance.getEntriesByType('navigation')[0] as any)?.type === 'reload'))) {
        // Page refresh - clear state and scroll to top
        this.clearSavedState();
        window.scrollTo({ top: 0 });
        return false;
      }

      this.restoring = true;
      this.productList = [];
      this.currentPage = 1;
      this.hasMoreProducts = true;
      this.restoredScrollY = Number(saved.scrollY) || 0;

      // Load pages sequentially up to saved.page
      await this.loadUpToPage(saved.page);

      // Set next page correctly
      this.currentPage = saved.page + 1;
      this.restoring = false;

      // Scroll immediately after all products are loaded
      // Use requestAnimationFrame to ensure DOM has painted
      requestAnimationFrame(() => {
        const y = this.restoredScrollY > 0 ? this.restoredScrollY : this.estimateYForPage(saved.page);
        window.scrollTo({ top: y });
      });
      return true;
    } catch (error) {
      return false;
    }
  }


  private estimateYForPage(page: number): number {
    // Fallback estimate: scroll to a fraction of document height based on page
    const total = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const pagesLoaded = Math.max(1, page);
    const fraction = Math.min(0.95, (pagesLoaded - 1) / pagesLoaded);
    return Math.floor(total * fraction);
  }

  private async loadUpToPage(targetPage: number): Promise<void> {
    for (let p = 1; p <= targetPage; p++) {
      const result = await this.fetchProducts(p);
      this.productList = [...this.productList, ...result.products];
      console.log("loadUpToPage",this.productList );
      if (!result.hasMore) {
        this.hasMoreProducts = false;
        break;
      }
    }
  }

  private fetchProducts(page: number): Promise<{ products: any[]; hasMore: boolean }> {
    const prodObj: any = {
      product_category: this.cat_slug,
      store_slug: this.store_slug,
      brand: this.selectedBrand,
      page,
      limit: this.limit,
      tag_ids: this.tag_ids || []
    };
    console.log('Calling API with prodObj fetchProducts:', prodObj);
    return new Promise((resolve, reject) => {
      this.productService.get2D3DFilteredProduct(prodObj).subscribe(
        (res: any) => {
          console.log('API Response1:', res);
          const products = (res && res.data && res.data.products) ? res.data.products : [];
          const hasMore = products.length > 0;
          resolve({ products, hasMore });
        },
        (err: any) => reject(err)
      );
    });
  }

  // Save scroll/page on browser refresh or navigation
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload() {
    this.saveState();
  }

  ngOnInit(): void {
    

    this.route.queryParamMap.subscribe(paramMap => {
      // Decrypt single-value params
      const encCat = paramMap.get('cat');
      const encBrand = paramMap.get('brand');
      // Only update cat if query param exists; otherwise preserve current cat_slug (from slug)
      const nextCatSlug = encCat ? this.criptoService.decryptParam(encCat) : this.cat_slug;
      const nextBrand = encBrand ? this.criptoService.decryptParam(encBrand) : '';

      // Decrypt multi-value 'tag' params
      const encTags = paramMap.getAll('tag');
      const nextTags = (encTags || []).filter(Boolean).map(t => this.criptoService.decryptParam(t));
      // If any filter changed, clear persisted state and block restore
      const changed = (encCat && this.cat_slug !== undefined && (this.cat_slug !== nextCatSlug)) ||
        (this.selectedBrand !== undefined && (this.selectedBrand !== nextBrand)) ||
        JSON.stringify(this.tag_ids || []) !== JSON.stringify(nextTags || []);
      if (changed) {
        this.clearSavedState();
        this.didRestoreOnce = true;
        this.restoredScrollY = null;
        this.productList = [];
        this.currentPage = 1;
        this.hasMoreProducts = true;
        window.scrollTo({ top: 0 });
      }

      // Apply cat change only if provided via query param
      if (encCat) {
        this.cat_slug = nextCatSlug;
      }
      this.selectedBrand = nextBrand;

      this.tag_ids = nextTags;
      // Backward compatibility: set primary tag_id as first tag if present
      this.tag_id = this.tag_ids.length ? this.tag_ids[0] : '';

      // console.log('Decrypted Params:', {
      //   cat: this.cat_id || 'No category',
      //   brand: this.selectedBrand || 'No brand',
      //   tags: this.tag_ids.length ? this.tag_ids : 'No tags'
      // });
    });


    if (!this.store_slug) {
      this.route.paramMap.subscribe(params => {
        // Extract the 'slug' and 'page' values from the route parameters
        this.store_slug = params.get('storeSlug');
        const newCatSlug = params.get('catSlug') == 'all' ? '' : params.get('catSlug');

        // If slug changed AND we have categories loaded, trigger update
        if (this.cat_slug !== newCatSlug) {
          this.cat_slug = newCatSlug;
          if (this.categoryList && this.categoryList.length > 0) {
            this.resolveCategoryAndLoad();
          }
        }
      });
    }

    this.productService.getall2D3DBrands(this.store_slug).subscribe(
      res => {
        // console.log('res=========', res['data'])
        this.brandList = res['data'];
        this.updatePaginatedBrandList();
        this.selectedBrandName = this.getBrandName(this.brandList, this.selectedBrand)
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });

    this.productService.getallEyeGlassCategoryWithSubcat().subscribe(
      res => {
        this.categoryList = res['data'][0];
        if (this.cat_id !== '') {
          const matchedCategory = this.categoryList.find(category => category.category_id === this.cat_id);
          if (matchedCategory) {
            this.cat_id = matchedCategory.category_id;
            this.activeCategoryIndex = this.categoryList.indexOf(matchedCategory); // Set the active index

            // Avoid triggering initial API load if we will restore state
            if (!this.hasSavedState()) {
              this.getCategoryDetails(matchedCategory, this.activeCategoryIndex);
            }
            // If there is saved state and we haven't restored yet, try now (filters are ready)
            if (this.hasSavedState() && !this.didRestoreOnce) {
              this.tryRestoreState().then(r => { this.didRestoreOnce = r; if (!r) { this.loadProducts(); } });
            }
          } else {
            // If cat_id was provided but not found in list, fall back to slug or all
            if (this.cat_slug) {
              const bySlug = this.categoryList.find(category => category.category_slug === this.cat_slug);
              if (bySlug) {
                this.cat_id = bySlug.category_id;
                this.activeCategoryIndex = this.categoryList.indexOf(bySlug);
                if (!this.hasSavedState()) {
                  this.getCategoryDetails(bySlug, this.activeCategoryIndex);
                }
              } else {
                this.cat_id = '';
                this.productList = [];
                this.currentPage = 1;
                this.hasMoreProducts = true;
                if (!this.hasSavedState()) {
                  this.loadProducts();
                }
              }
            } else {
              this.cat_id = '';
              this.productList = [];
              this.currentPage = 1;
              this.hasMoreProducts = true;
              if (!this.hasSavedState()) {
                this.loadProducts();
              }
            }
          }
        } else if (this.cat_slug) {
          const matchedCategory = this.categoryList.find(category => category.category_slug === this.cat_slug);
          if (matchedCategory) {
            this.cat_id = matchedCategory.category_id;
            this.activeCategoryIndex = this.categoryList.indexOf(matchedCategory); // Set the active index
          }

          if (!this.hasSavedState()) {
            if (matchedCategory) {
              this.getCategoryDetails(matchedCategory, this.activeCategoryIndex);
            } else {
              // No matching category for slug, treat as 'all'
              this.cat_id = '';
              this.productList = [];
              this.currentPage = 1;
              this.hasMoreProducts = true;
              this.loadProducts();
            }
          }
          if (this.hasSavedState() && !this.didRestoreOnce) {
            this.tryRestoreState().then(r => { this.didRestoreOnce = r; if (!r) { this.loadProducts(); } });
          }
        }
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
        // this.router.navigateByUrl('/')
      }
    );

    // Save state when navigating away via router
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {

        // Check if this is a browser back navigation
        if (event.navigationTrigger === 'popstate') {
          this.isNavigatingBack = true;
          // Reset restoration flag to allow restoration on back navigation
          this.didRestoreOnce = false;
        } else {
          // Regular navigation away
          this.isNavigatingAway = true;
          this.saveState();
        }
      }

      if (event instanceof NavigationEnd) {

        // Check if this is a return to the same component (back button)
        if (this.isNavigatingBack && this.hasSavedState()) {
          // Attempt to restore state after a short delay to ensure DOM is ready
          setTimeout(() => {
            if (this.hasSavedState() && !this.didRestoreOnce) {
              this.tryRestoreState().then(r => {
                this.didRestoreOnce = r;
                // Clear the back navigation flag after restoration attempt
                setTimeout(() => {
                  this.isNavigatingBack = false;
                }, 1000);
              });
            }
          }, 100);
        } else {
          // Reset navigation flags
          this.isNavigatingAway = false;
          this.isNavigatingBack = false;
        }
      }
    });

    // Early attempt to restore; if filters not ready, a later attempt will run after categories load
    this.tryRestoreState().then(restored => {
      this.didRestoreOnce = restored;
      if (!restored && !this.hasSavedState()) {
        // Check if we have a specific category slug in the route or query params
        const catSlug = this.route.snapshot.paramMap.get('catSlug');
        const hasCategorySlug = catSlug && catSlug !== 'all';
        const hasCategoryQuery = this.route.snapshot.queryParamMap.has('cat');

        // Only load default products if we are NOT waiting for a specific category to be resolved
        if (!hasCategorySlug && !hasCategoryQuery) {
          this.loadProducts();
        }
      }
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
    // console.log('Calling Load Product', this.isLoading, this.hasMoreProducts);

    if (this.isLoading || !this.hasMoreProducts) {
      // console.log('Exiting due to isLoading or hasMoreProducts condition.');
      return; // Exit early if loading or no more products
    }

    this.isLoading = true; // Set loading state to true
  
    // Use the fixed limit for each page, and just increase the page number
    let prodObj: any = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,  // Incremented page number
      "limit": this.limit  // Fixed limit per page
    };

    // Always use tag_ids for API (backend now supports arrays)
    prodObj["tag_ids"] = this.tag_ids || [];

    console.log('Calling API with prodObj loadProducts:', prodObj);

    this.productService.get2D3DFilteredProduct(prodObj).subscribe(
      (res: any) => {
        console.log('API Response2:', res);
        const newProducts = Array.isArray(res?.data?.products) ? res.data.products : [];
        const current = Array.isArray(this.productList) ? this.productList : [];
        console.log("pppppppppp6",this.productList)

        // Merge with de-duplication based on unique id/slug
        const merged = [...current, ...newProducts];
        const seen = new Set<string>();
        this.productList = merged.filter(p => {
          const key = (p && (p._id || p.id || p.product_slug || '')) + '';
          if (!key) return true;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        console.log("pppppppppp5",this.productList)

        this.noProducts = this.productList.length === 0;

        // Update total if available
        const total = Number(res?.data?.totalCount);
        if (!isNaN(total)) {
          this.totalProducts = total;
        }

        if (newProducts.length === 0) {
          this.hasMoreProducts = false;
        } else {
          // Determine if there are more items using totalCount when present
          if (this.totalProducts) {
            this.hasMoreProducts = this.productList.length < this.totalProducts;
          } else {
            this.hasMoreProducts = newProducts.length >= this.limit;
          }
          this.currentPage++;
        }
        this.isLoading = false;
        // Persist state after each successful load
        this.saveState();
      },
      (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false; // Reset loading state in case of error
      }
    );
  }

  // Listen to window scroll event to trigger pagination
  @HostListener('window:scroll', [])
  onScroll(): void {
    // Don't save scroll position during restoration or browser back navigation
    if (this.restoring || this.isNavigatingBack) {
      return;
    }

    const currentScrollY = window.pageYOffset || 0;

    const windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    const windowBottom = windowHeight + currentScrollY;

    if (windowBottom >= docHeight - 100) {
      // If scrolled near the bottom, load more products
      this.loadProducts();
    }
    // Update scroll position in persisted state
    this.saveState(false);
  }

  // Add to Wishlist
  addToWishlist(product: any) {
    product.addonsprice = 0;
    let addonSelectedResult = [];
    product.addons = addonSelectedResult
    this.productService.addToWishlist(product);
  }

  barndPopup() {
    this.showBrand = true;
  }

  barndPopupClose() {
    event.preventDefault();
    this.showBrand = false;
  }

  getAllProducts() {
    this.tag_id = ''
    this.tag_ids = []
    this.cat_id = '';
    this.cat_slug = '';
    this.selectedBrand = '';
    this.selectedBrandName = ''
    this.currentPage = 1;
    
    let prodObj: any = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": '',
      "page": this.currentPage,
      "limit": this.limit
    }
    console.log('Calling API with prodObj getAllProducts:', prodObj);
    // Always send array of tag ids
    prodObj["tag_ids"] = this.tag_ids || [];
    this.productService.get2D3DFilteredProduct(prodObj).subscribe(
      (res: any) => {
        console.log('API Response3:', res);
        const products = Array.isArray(res?.data?.products) ? res.data.products : [];
        this.productList = products;
        console.log("pppppppppp4",this.productList)
        this.totalProducts = Number(res?.data?.totalCount) || 0;
        this.noProducts = this.productList.length === 0;
        // Determine hasMore using totalCount when present, otherwise by page size
        if (this.totalProducts) {
          this.hasMoreProducts = this.productList.length < this.totalProducts;
        } else {
          this.hasMoreProducts = products.length >= this.limit;
        }
        // Prepare next page for infinite scroll
        this.currentPage = this.noProducts ? 1 : 2;
        this.isLoading = false;
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });

    // Navigate with encrypted query params to update the URL
    const encTags = (this.tag_ids && this.tag_ids.length)
      ? this.tag_ids.map(id => this.criptoService.encryptParam(id))
      : [];
    this.router.navigate([`/all-products/${this.store_slug}/all`], {
      queryParams: {
        cat: this.criptoService.encryptParam(this.cat_slug),
        brand: this.criptoService.encryptParam(this.selectedBrand),
        ...(encTags.length ? { tag: encTags } : {})
      }
    });
    // Clear any saved state on Clear Filter
    this.clearSavedState();
    this.didRestoreOnce = true;
    this.restoredScrollY = null;
    window.scrollTo({ top: 0 });
  }

  getCategoryDetailsQuery(category: any, index: number) {
    this.activeCategoryIndex = index;
    this.currentPage = 1;  // Reset to page 1
    this.cat_id = category.category_id;
    this.cat_slug = category.category_slug;

    // Update the URL by navigating with new encrypted path parameters
    // Build tags for URL
    const encTags2 = (this.tag_ids && this.tag_ids.length)
      ? this.tag_ids.map(id => this.criptoService.encryptParam(id))
      : [];

    // Navigate to path with category slug instead of 'all'
    const nextCatSlug = category.category_slug || 'all';
    this.router.navigate(
      ['/all-products', this.store_slug, nextCatSlug],
      {
        queryParams: {
          // Do not send 'cat' in query since slug is in the path
          brand: this.criptoService.encryptParam(this.selectedBrand),
          ...(encTags2.length ? { tag: encTags2 } : {})
        }
      }
    );

    // API call with normal values (not encrypted)
    let prodObj2: any = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    };

    prodObj2["tag_ids"] = this.tag_ids || [];

    console.log('Calling API with prodObj getCategoryDetailsQuery:', prodObj2);


    this.productService.get2D3DFilteredProduct(prodObj2).subscribe(
      (res: any) => {
        console.log('API Response4:', res);
        const products = Array.isArray(res?.data?.products) ? res.data.products : [];
        this.productList = products;
        console.log("pppppppppp3",this.productList)
        this.totalProducts = Number(res?.data?.totalCount) || 0;
        this.noProducts = this.productList.length === 0;
        if (this.totalProducts) {
          this.hasMoreProducts = this.productList.length < this.totalProducts;
        } else {
          this.hasMoreProducts = products.length >= this.limit;
        }
        this.currentPage = this.noProducts ? 1 : 2;
        this.isLoading = false;
      },
      error => {
        this.toastr.error(error.error.message);
      }
    );
    this.clearSavedState();
    this.didRestoreOnce = true;
    this.restoredScrollY = null;
    window.scrollTo({ top: 0 });
  }

  resolveCategoryAndLoad() {
    if (!this.categoryList || this.categoryList.length === 0) return;

    if (this.cat_slug) {
      const matchedCategory = this.categoryList.find(category => category.category_slug === this.cat_slug);
      if (matchedCategory) {
        this.getCategoryDetails(matchedCategory, this.categoryList.indexOf(matchedCategory));
      }
    } else {
      this.cat_id = '';
      this.productList = [];
      this.currentPage = 1;
      this.hasMoreProducts = true;
      this.loadProducts();
    }
  }

  getCategoryDetails(category: any, index: number) {
    this.activeCategoryIndex = index;
    this.currentPage = 1;  // Reset to page 1
    this.cat_id = category.category_id;
    this.cat_slug = category.category_slug;

    // API call with normal values (not encrypted)
    let prodObj3: any = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    };
    prodObj3["tag_ids"] = this.tag_ids || [];

    console.log('Calling API with prodObj getCategoryDetails:', prodObj3);

    this.productService.get2D3DFilteredProduct(prodObj3).subscribe(
      (res: any) => {
        console.log('API Response5:', res);
        const products = Array.isArray(res?.data?.products) ? res.data.products : [];
        this.productList = products;
        console.log("pppppppppp2",this.productList)
        this.totalProducts = Number(res?.data?.totalCount) || 0;
        this.noProducts = this.productList.length === 0;
        if (this.totalProducts) {
          this.hasMoreProducts = this.productList.length < this.totalProducts;
        } else {
          this.hasMoreProducts = products.length >= this.limit;
        }
        this.currentPage = this.noProducts ? 1 : 2;
        this.isLoading = false;
      },
      error => {
        this.toastr.error(error.error.message);
      }
    );
    this.clearSavedState();
    this.didRestoreOnce = true;
    this.restoredScrollY = null;
    window.scrollTo({ top: 0 });
  }


  changeBrandname(brand: any) {
    event.preventDefault();
    this.showBrand = false;
    this.currentPage = 1;  // Reset to page 1
    this.selectedBrand = brand._id;
    this.selectedBrandName = brand.brand_name;

    console.log('this.selectedBrandName----', this.selectedBrandName);

    // Update the URL by navigating with new encrypted path parameters
    // Build tags for URL
    const encTags3 = (this.tag_ids && this.tag_ids.length)
      ? this.tag_ids.map(id => this.criptoService.encryptParam(id))
      : [];

    this.router.navigate(
      ['/all-products', this.store_slug, 'all'],
      {
        queryParams: {
          cat: this.criptoService.encryptParam(this.cat_slug),
          brand: this.criptoService.encryptParam(this.selectedBrand),
          ...(encTags3.length ? { tag: encTags3 } : {})
        }
      }
    );

    // API call with normal values (not encrypted)
    let prodObjBrand: any = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    };
    prodObjBrand["tag_ids"] = this.tag_ids || [];

    console.log('Calling API with prodObj changeBrandname:', prodObjBrand);

    this.productService.get2D3DFilteredProduct(prodObjBrand).subscribe(
      (res: any) => {
        console.log('API Response6:', res);
        const products = Array.isArray(res?.data?.products) ? res.data.products : [];
        this.productList = products;
        console.log("pppppppppp1",this.productList)
        this.totalProducts = Number(res?.data?.totalCount) || 0;
        this.noProducts = this.productList.length === 0;
        if (this.totalProducts) {
          this.hasMoreProducts = this.productList.length < this.totalProducts;
        } else {
          this.hasMoreProducts = products.length >= this.limit;
        }
        this.currentPage = this.noProducts ? 1 : 2;
        this.isLoading = false;
      },
      error => {
        this.toastr.error(error.error.message);
      }
    );
    this.clearSavedState();
    this.didRestoreOnce = true;
    this.restoredScrollY = null;
    window.scrollTo({ top: 0 });
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
