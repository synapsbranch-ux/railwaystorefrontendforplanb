import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { StoreService } from 'src/app/shared/services/store.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { HomesliderService } from 'src/app/shared/services/homeslider.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from 'src/app/shared/services/product.service';
import { CriptoService } from 'src/app/shared/services/cripto.service';

@Component({
  selector: 'app-single-store-banner',
  templateUrl: './single-store-banner.component.html',
  styleUrls: ['./single-store-banner.component.scss']
})
export class SingleStoreBannerComponent implements OnInit {
  @Input() currency: any = this.productService.Currency; // Default Currency 
  public ImageSrc: string
  store_slug: any
  public sliders = [];
  categories: any
  allProducts: any[] = [];
  menProducts: any[] = [];
  womenProducts: any[] = [];
  unisexProducts: any[] = [];
  pradaProducts: any[] = [];
  gucciProducts: any[] = [];
  coachProducts: any[] = [];
  newArrivalProducts: any[] = [];
  is2Dshow: boolean = false;
  // Logo
  public brands = [];
  public home_brands = [];
  //// for 2D products
  public tagListData = [];
  public mediaTextData = [];
  currentPage = 1;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private route: ActivatedRoute,
    private homesliderservice: HomesliderService,
    private toaster: ToastrService,
    private productService: ProductService,
    private toastr: ToastrService,
    private criptoService: CriptoService
  ) { }

  private getCookieValue(name: string): string | null {
    try {
      const cookies = this.document.cookie.split(';');
      for (const cookie of cookies) {
        const [key, ...valParts] = cookie.trim().split('=');
        if (key.trim() === name) {
          return decodeURIComponent(valParts.join('='));
        }
      }
    } catch (e) {
      // document.cookie not available in SSR
    }
    return null;
  }

  ngOnInit() {
    // this.getAllBrands();
    if (localStorage.getItem('top_brands')) {
      this.brands = JSON.parse(localStorage.getItem('top_brands'));
    }

    if (localStorage.getItem('home_brands')) {
      this.home_brands = JSON.parse(localStorage.getItem('home_brands'));
    }

    this.route.params.subscribe(params => {
      if (params['slug']) {
        // Supports both /vendor/:slug (legacy) and /:slug (canonical)
        this.store_slug = params['slug'];
        localStorage.setItem('storeslug', this.store_slug);
      } else {
        // Priority: cookie (Lambda@Edge) > localStorage > environment default
        const cookieSlug = this.getCookieValue('storeslug');
        const localSlug = localStorage.getItem('storeslug');
        this.store_slug = cookieSlug || localSlug || environment.defaultStore;
        localStorage.setItem('storeslug', this.store_slug);
      }

      let storeObj = {
        store_slug: this.store_slug
      };
      // get all home slider data from API
      this.homesliderservice.getallVendorSliderData(storeObj).subscribe(
        res => {
          this.sliders = res.data;
        },
        error => {
          this.toaster.error(error.error.message);
          this.router.navigateByUrl('/');
        }
      );

      this.testMediaSectionList(this.store_slug);
    });

    this.productService.getallEyeGlassCategoryWithSubcat().subscribe(
      res => {
        this.categories = res['data'][0];
      },
      error => {
        this.toastr.error(error.error.message);
      });

    this.tagList();
  }

  // getAllBrands() {
  //   this.productService.getHomeBrands().subscribe(
  //     res => {
  //       this.brands = res['data'];
  //     },
  //     error => {
  //       // .... HANDLE ERROR HERE 
  //       this.toastr.error(error.error.message)
  //     });
  // }


  // fetchAllProducts() {
  //   const prodObj = {
  //     "store_slug": this.store_slug
  //   };

  //   this.productService.getHomeFilteredProduct(prodObj).subscribe(
  //     res => {
  //       this.allProducts = res['data'];
  //       this.filterProducts();
  //     },
  //     error => {
  //       // .... HANDLE ERROR HERE 
  //       this.toastr.success(error.error.message);
  //       this.router.navigateByUrl('/')
  //     }
  //   );
  // }

  tagList() {
    this.productService.gettagList().subscribe(
      res => {
        this.tagListData = res['data'];
        console.log(this.tagListData)
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.success(error.error.message);
      }
    );
  }

  testMediaSectionList(store_slug: any) {
    // Multi-Store Portal endpoint is the primary source for MTG sections
    this.productService.getVendorStoreLandingMTGs(store_slug).subscribe(
      res => {
        const mtgList = res?.data?.mtgList || [];
        this.mediaTextData = [...mtgList]
          .map((section: any) => this.normalizeMediaSection(section))
          .sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
        if (this.mediaTextData.length === 0) {
          this.loadLegacyMediaSections(store_slug);
        }
      },
      error => {
        this.loadLegacyMediaSections(store_slug);
      }
    );
  }

  private loadLegacyMediaSections(store_slug: any) {
    this.productService.gettestMediaSection(store_slug).subscribe(
      res => {
        const rawSections = res['data'] || [];
        this.mediaTextData = rawSections.map((section: any) => this.normalizeMediaSection(section));
      },
      error => {
        this.toastr.success(error.error.message);
      }
    );
  }

  private normalizeMediaSection(section: any): any {
    const targetStoreSlug = section?.shop_now_store_slug || this.store_slug;
    const targetStoreName = section?.shop_now_store_name || '';
    const targetStorePath = section?.shop_now_store_path || `/${targetStoreSlug}`;

    return {
      ...section,
      shop_now_store_slug: targetStoreSlug,
      shop_now_store_name: targetStoreName,
      shop_now_store_logo: section?.shop_now_store_logo || '',
      shop_now_store_path: targetStorePath,
      is_cross_store: section?.is_cross_store === true || targetStoreSlug !== this.store_slug
    };
  }

  goToMediaSectionStore(section: any) {
    const targetStoreSlug = section?.shop_now_store_slug || this.store_slug;
    if (!targetStoreSlug) {
      return;
    }
    this.router.navigate([`/${targetStoreSlug}`]);
  }

  getTagsProducts(tag: any) {
    const encryptedTag = this.criptoService.encryptParam(tag._id);

    // Navigate with encrypted query params
    this.router.navigate([`/all-products/${this.store_slug}/all`], {
      queryParams: {
        cat: this.criptoService.encryptParam(''),   // Encrypt the empty value
        brand: this.criptoService.encryptParam(''), // Encrypt the empty value
        tag: encryptedTag                           // Encrypt the tag ID
      }
    });
  }

  /**
   * Navigate to All Products with multiple tags from a media-text section.
   * This method tries to be flexible about where tag IDs are stored on the section object:
   * - section.tag_ids: string[] of tag IDs
   * - section.tags: array of objects or strings (uses _id | id | tag_id | value)
   * - section.tag: string[] of tag IDs
   * If no valid tags are found, it falls back to show all products.
   */
  getMediaSectionTagsProducts(section: any) {
    // Multi-Store Portal: if this MTG belongs to another store, navigate to that store
    if (section.shop_now_store_slug && section.shop_now_store_slug !== this.store_slug) {
      this.router.navigate([`/${section.shop_now_store_slug}`]);
      return;
    }

    // Expect section.tags: Tag[] where each Tag has _id
    const tagObjs = Array.isArray(section?.tags) ? section.tags : [];
    const tagIds = tagObjs.map((t: any) => t?._id).filter((id: any) => !!id);

    if (!tagIds.length) {
      // No tags available on this section, fallback to showing all products
      this.showAllProducts();
      return;
    }

    const encryptedTags = tagIds.map((id: any) => this.criptoService.encryptParam(id));

    this.router.navigate([`/all-products/${this.store_slug}/all`], {
      queryParams: {
        cat: this.criptoService.encryptParam(''),
        brand: this.criptoService.encryptParam(''),
        // Passing an array will generate repeated query params like ?tag=a&tag=b
        tag: encryptedTags
      }
    });
  }

  showAllProducts() {
    // Navigate with empty encrypted query params
    this.router.navigate([`/all-products/${this.store_slug}/all`], {
      queryParams: {
        cat: this.criptoService.encryptParam(''),
        brand: this.criptoService.encryptParam(''),
        tag: this.criptoService.encryptParam('')
      }
    });
  }

  filterProducts() {
    const menCategoryId = this.categories.find(cat => cat.category_name === 'Men')?.category_id;
    const womenCategoryId = this.categories.find(cat => cat.category_name === 'Women')?.category_id;
    const unisexCategoryId = this.categories.find(cat => cat.category_name === 'Unisex')?.category_id;
    if (this.allProducts.length > 0) {
      this.menProducts = this.getRandomItems(this.allProducts.filter(product =>
        product.product_sub_categories.some(subCat => subCat.child_category_id === menCategoryId)
      ), 4);

      this.womenProducts = this.getRandomItems(this.allProducts.filter(product =>
        product.product_sub_categories.some(subCat => subCat.child_category_id === womenCategoryId)
      ), 4);

      this.unisexProducts = this.getRandomItems(this.allProducts.filter(product =>
        product.product_sub_categories.some(subCat => subCat.child_category_id === unisexCategoryId)
      ), 4);

      this.pradaProducts = this.getRandomItems(this.allProducts.filter(product =>
        product.product_brand && product.product_brand.brand_name.toUpperCase() === 'PRADA'
      ), 4);

      this.gucciProducts = this.getRandomItems(this.allProducts.filter(product =>
        product.product_brand && product.product_brand.brand_name.toUpperCase() === 'GUCCI'
      ), 4);

      this.coachProducts = this.getRandomItems(this.allProducts.filter(product =>
        product.product_brand && product.product_brand.brand_name.toUpperCase() === 'COACH'
      ), 4);

      // Get 4 random items from new arrivals
      this.newArrivalProducts = this.getRandomItems(this.allProducts, 4);
    }
    else {
      this.is2Dshow = true;
    }

  }

  getRandomItems(array: any[], count: number): any[] {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return array.slice(0, count);
  }

  onPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
    localStorage.setItem('cur_page', pageNumber.toString())
    console.log('pageNumber================', pageNumber);
  }

}
