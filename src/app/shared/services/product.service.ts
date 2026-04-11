import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, startWith, delay } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ProductNew } from '../classes/product';
import { environment } from 'src/environments/environment';
import { SecurityService } from 'src/security.service';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserService } from './user.service';

const state = {

  products: JSON.parse(localStorage['products'] || '[]'),
  wishlist: JSON.parse(localStorage['wishlistItems'] || '[]'),
  compare: JSON.parse(localStorage['compareItems'] || '[]'),
  cart: JSON.parse(localStorage['cartItems'] || '[]')
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  public Currency = { name: 'Dollar', currency: 'USD', price: 1 } // Default Currency
  public OpenCart: boolean = false;
  public Products
  catagories: any = "";
  public catagoriesalt;
  token: any;
  catarr = {};


  constructor(private http: HttpClient, private route: ActivatedRoute,
    private toastrService: ToastrService, private router: Router, private userService: UserService, private securityService: SecurityService) {

  }

  /*
    ---------------------------------------------
    ---------------  Product  -------------------
    ---------------------------------------------
  */


  // Product


  private get products(): Observable<ProductNew[]> {
    this.catagories = this.route.snapshot.paramMap.get('slug');

    if (this.catagories != null) {
      this.catarr = {
        'category': this.catagories,
      };
    }
    if (this.catagories === null) {
      if (localStorage.getItem("product_slug")) {
        this.getproductsBySlugs(localStorage.getItem("product_slug")).subscribe(
          res => {
            this.catagoriesalt = res['data'].product_category.category_slug;
            this.catarr = {
              'category': this.catagoriesalt,
            };
          },
          error => {

            this.toastrService.error(error.error.message);
          }
        )
      }
      else {
        this.catarr = {
          'category': localStorage.getItem("cat_slug"),
        };
      }

    }
    this.Products = this.securityService.signedRequest<ProductNew[]>('POST', environment.baseUrl + 'product/list', this.catarr).pipe(map((data: any) => {
      return data.data;
    }));



    this.Products.subscribe((next: any) => {

      localStorage['products'] = JSON.stringify(next)

    });
    this.Products = this.Products.pipe(startWith(JSON.parse(localStorage['products'] || '[]')));
    return this.Products;
  }

  // get Shipping and Tax data
  
  getallShippingTaxs(data) {
    const url = environment.baseUrl + 'user/getShippingTax';
    return this.securityService.signedRequest('POST', url, data);
  }

  //// Get all Categories List

  getallCategories() {
    const url = environment.baseUrl + 'category';
    return this.securityService.signedRequest('GET', url);
  }

  //// Get all Filtered Product List  

  getallFilteredProduct(data) {
    const url = environment.baseUrl + 'filter-store-product';
    return this.securityService.signedRequest('POST', url, data);
  }

  get2D3DFilteredProduct(data) {
    const url = environment.baseUrl + 'filter-all-store-product';
    return this.securityService.signedRequest('POST', url, data);
  }

  //// Get all Brands List

  getallBrands(store_slug: any) {
    const url = environment.baseUrl + `brand/list?store_slug=${store_slug}`;
    return this.securityService.signedRequest('GET', url);
  }

  //// Get all 3D Brands List

  getall3DBrands(store_slug: any) {
    const url = environment.baseUrl + `3d-product-brand/list?store_slug=${store_slug}`;
    return this.securityService.signedRequest('GET', url);
  }

  //// Get all 2D Brands List

  getall2DBrands(store_slug: any) {
    const url = environment.baseUrl + `2d-product-brand/list?store_slug=${store_slug}`;
    return this.securityService.signedRequest('GET', url);
  }

  //// Get all 2D 3D Brands List

  getall2D3DBrands(store_slug: any) {
    const url = environment.baseUrl + `2d-3d-product-brand/list?store_slug=${store_slug}`;
    return this.securityService.signedRequest('GET', url);
  }

  //// Get all Contact Brands List

  getallContactBrands(store_slug: any) {
    const url = environment.baseUrl + `contact-product-brand/list?store_slug=${store_slug}`;
    return this.securityService.signedRequest('GET', url);
  }

  //// Get all catyegoryList

  getallEyeGlassCategoryWithSubcat() {
    const url = environment.baseUrl + 'eyeglass-category-list-for-store';
    return this.securityService.signedRequest('GET', url);
  }


  // Get Products
  public get getProducts(): Observable<ProductNew[]> {

    return this.products;
  }

  getProductsBycat(catdata: any): Observable<any> {
    const url = environment.baseUrl + 'product/list';
    return this.securityService.signedRequest('POST', url, catdata);
  }
  getContactFilterdProductList(storeSlug: any): Observable<any> {
    const url = environment.baseUrl + 'filter-contact-product';
    return this.securityService.signedRequest('POST', url, storeSlug);
  }
  get2DProductList(storeSlug: any): Observable<any> {
    const url = environment.baseUrl + 'stores/all-product-2d-list-by-vendor-for-user';
    return this.securityService.signedRequest('POST', url, storeSlug);
  }

  getStoreDetails(storeSlug: any): Observable<any> {
    const url = environment.baseUrl + 'stores/details';
    return this.securityService.signedRequest('POST', url, storeSlug);
  }

  // Get Products BY categoriess
  getProductscat(data: any): Observable<any> {
    const url = environment.baseUrl + 'product/list';
    return this.securityService.signedRequest('POST', url, data);
  }

  getSettingsDetails(): Observable<any> {
    const url = environment.baseUrl + 'settings';
    return this.securityService.signedRequest('GET', url);
  }

  // Get Products By Slug

  public getProductBySlug(slug: string): Observable<ProductNew> {
    return this.products.pipe(map(items => {
      return items.find((item: any) => {
        return item.product_slug === slug;
      });
    }));
  }

  getproductsBySlugs(data: any): Observable<any> {
    const url = environment.baseUrl + 'product/' + data;
    return this.securityService.signedRequest('GET', url);
  }

  uploadImage(fileToUpload: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('image', fileToUpload, fileToUpload.name);
    const url = environment.baseUrl + 'user/upload';
    return this.securityService.signedRequest('POST', url, formData);
  }

  /*
    ---------------------------------------------
    ---------------  Wish List  -----------------
    ---------------------------------------------
  */

  // Get Wishlist Items
  public get wishlistItems(): Observable<ProductNew[]> {
    const itemsStream = new Observable(observer => {
      observer.next(state.wishlist);
      observer.complete();
    });
    return <Observable<ProductNew[]>>itemsStream;
  }

  // Add to Wishlist
  public addToWishlist(product): any {
    const wishlistItem = state.wishlist.find(item => item._id === product._id);
    if (!wishlistItem) {
      state.wishlist.push({
        ...product
      })
    }
    this.toastrService.success('Product has been added in wishlist.');
    localStorage.setItem("wishlistItems", JSON.stringify(state.wishlist));
    return true
  }

  // Remove Wishlist items
  public removeWishlistItem(product: ProductNew): any {
    const index = state.wishlist.indexOf(product);
    state.wishlist.splice(index, 1);
    localStorage.setItem("wishlistItems", JSON.stringify(state.wishlist));
    return true
  }

  public wishlistProductCheck(product: ProductNew): any {
    const wishlistItem = state.wishlist.find(item => item._id === product._id);
    if (wishlistItem) {
      return true
    }
    else {
      return false
    }
  }

  /*
    ---------------------------------------------
    -------------  Compare Product  -------------
    ---------------------------------------------
  */

  // Get Compare Items
  public get compareItems(): Observable<ProductNew[]> {
    const itemsStream = new Observable(observer => {
      observer.next(state.compare);
      observer.complete();
    });
    return <Observable<ProductNew[]>>itemsStream;
  }

  // Add to Compare
  public addToCompare(product): any {
    const compareItem = state.compare.find(item => item.id === product._id)
    if (!compareItem) {
      state.compare.push({
        ...product
      })
    }
    this.toastrService.success('Product has been added in compare.');
    localStorage.setItem("compareItems", JSON.stringify(state.compare));
    return true
  }

  // Remove Compare items
  public removeCompareItem(product: ProductNew): any {
    const index = state.compare.indexOf(product);
    state.compare.splice(index, 1);
    localStorage.setItem("compareItems", JSON.stringify(state.compare));
    return true
  }

  /*
    ---------------------------------------------
    -----------------  Cart  --------------------
    ---------------------------------------------
  */

  // Get Cart Items
  public get cartItems(): Observable<ProductNew[]> {
    const itemsStream = new Observable(observer => {
      observer.next(JSON.parse(localStorage.getItem('cartItems')));
      observer.complete();
    });
    return <Observable<ProductNew[]>>itemsStream;
  }

  // Add to Cart
  public addToCart(product, prod_qty, isupdate): any {
    let SinglevendorStatus = true;
    const cartItems = localStorage.getItem('cartItems');
    if (localStorage.getItem('vendor_id') && cartItems && JSON.parse(cartItems).length > 0) {
      if (product?.product_owner) {
        if (localStorage.getItem('vendor_id') != product?.product_owner?._id) {
          SinglevendorStatus = false
          return false;
        }
        else {
          this.addToCartforSingleVendor(product, prod_qty, isupdate);
          return true;
        }
      }
      else {
        this.addToCartforSingleVendor(product, prod_qty, isupdate);
        return true;
      }

    }
    else {
      localStorage.setItem('vendor_id', product.product_owner._id);
      this.addToCartforSingleVendor(product, prod_qty, isupdate);
    }
  }

  public addToCartforSingleVendor(product, prod_qty, isupdate) {
    const cartItem = state.cart.find(item => item._id === product._id);
    const qty = prod_qty
    const items = cartItem ? cartItem : product;
    const stock = this.calculateStockCounts(items, qty);
    if (!stock) return false
    if (cartItem) {
      if (isupdate) {
        cartItem.stock = (product.stock + cartItem.quantity) - qty;
        cartItem.quantity = qty;
      }
      else {
        cartItem.quantity += qty;
        if (product.stock >= qty) {
          if (product.stock > 0) {
            product.stock -= qty;
          }
        }
      }
    } else {
      product.quantity = qty;
      if (product.stock > 0) {
        product.stock -= qty;
      }
    }
    if (localStorage.getItem('u_token')) {
      if (this.userService.isTokenExpired(localStorage.getItem('u_token'))) {
        if (!cartItem) {
          state.cart.push({
            ...product,
            quantity: qty,
            product_owner: product.product_owner._id,
          })
        }
      }
      else {
        let product_price = 0;
        if (product.product_sale_price == null) {
          product_price = product.product_retail_price
        }
        else {
          product_price = product.product_sale_price
        }
        let cdata
        if (product.hasOwnProperty('left_eye_qty') && product.hasOwnProperty('right_eye_qty')) {
          cdata =
          {
            products: [{
              "pro_id": product._id,
              "pro_name": product.product_name,
              "pro_image": product.product_image[0] ? product.product_image[0].pro_image : 'assets/images/product/placeholder.jpg',
              "pro_slug": product.product_slug,
              "qty": product.quantity ? product.quantity : cartItem.quantity,
              "left_eye_qty": product.left_eye_qty ? product.left_eye_qty : 0,
              "right_eye_qty": product.right_eye_qty ? product.right_eye_qty : 0,
              "price": product_price,
              "addons": product.addons,
              "addonsprice": product.addonsprice
            }]
          }
        }
        else {
          cdata =
          {
            products: [{
              "pro_id": product._id,
              "pro_name": product.product_name,
              "pro_image": product.product_image[0] ? product.product_image[0].pro_image : 'assets/images/product/placeholder.jpg',
              "pro_slug": product.product_slug,
              "qty": cartItem? cartItem.quantity : product.quantity,
              "left_eye_qty": 0,
              "right_eye_qty": 0,
              "price": product_price,
              "addons": product.addons,
              "addonsprice": product.addonsprice
            }]
          }
        }

        console.log('full Product Cart Data for Submit', cdata);

        this.addToCartDbBulk(cdata).subscribe(
          res => {
            let bodydata = res['data'];
            localStorage.setItem('cart_', res['data']._id)
            if (bodydata.hasOwnProperty('products')) {
              let cartproducts = [];
              let product_img
              for (const element of res['data'].products) {
                this.getproductsBySlugs(element.pro_slug).subscribe(product => {
                  product_img = product['data'].product_image != undefined ? product['data'].product_image[0].pro_image : 'assets/images/product/placeholder.jpg';
                  let data =
                  {
                    "_id": element.pro_id,
                    "product_image": [
                      {
                        "pro_image": product_img,
                        "status": "active"
                      },
                    ],
                    "cart_id": res['data']._id,
                    "product_name": element.pro_name,
                    "product_slug": element.pro_slug,
                    "quantity": element.qty,
                    "left_eye_qty": element.left_eye_qty,
                    "right_eye_qty": element.right_eye_qty,
                    "stock": (product['data'].stock - element.qty),
                    "product_sale_price": element.price,
                    "addons": element.addons,
                    "addonsprice": element.addonsprice
                  }
                  cartproducts.push(data);
                  localStorage.setItem("cartItems", JSON.stringify(cartproducts));

                })

                const cartItem = state.cart.find(item => item._id === product._id);
                if (!cartItem) {
                  state.cart.push({
                    ...product,
                    quantity: qty,
                    stock: product.stock,
                    cart_id: res['data']._id,
                    product_owner: product.product_owner._id
                  })
                }

              }
            }
          },
          error => {

            this.toastrService.error(error.error.message);
          }
        )
      }

    }
    else {
      if (!cartItem) {
        state.cart.push({
          ...product,
          quantity: qty,
          product_owner: product.product_owner._id,
        })
      }
    }

    this.OpenCart = true; // If we use cart variation modal
    localStorage.setItem("cartItems", JSON.stringify(state.cart));

    return true;
  }

  // Update Cart Quantity
  public updateCartQuantity(product: ProductNew, quantity: number): ProductNew | boolean {
    let cartProducts = JSON.parse(localStorage.getItem('cartItems'));
    console.log('cartProducts--------------------', cartProducts);
    return cartProducts.find((items, index) => {
      if (items._id === product._id) {
        console.log('Updated Product details-----------', items)
        const qty = product.quantity
        const stock = this.calculateStockCounts(cartProducts[index], quantity)
        if (localStorage.getItem('u_token')) {
          if (this.userService.isTokenExpired(localStorage.getItem('u_token'))) {
            return true;
          }
          else {
            let product_price = 0;
            if (product.product_sale_price == null) {
              product_price = product.product_retail_price
            }
            else {
              product_price = product.product_sale_price
            }

            let cdata =
            {
              products: [{
                "pro_id": product._id,
                "pro_name": product.product_name,
                "pro_image": product.product_image[0] ? product.product_image[0].pro_image : 'assets/images/product/placeholder.jpg',
                "pro_slug": product.product_slug,
                "left_eye_qty": product.left_eye_qty,
                "right_eye_qty": product.right_eye_qty,
                "qty": qty + quantity,
                "price": product_price,
                "addons": product.addons,
                "addonsprice": product.addonsprice
              }]
            }

            this.addToCartDbBulk(cdata).subscribe(
              res => {
                let bodydata = res['data'];
                console.log('bodydata Cart Return', bodydata);
                if (bodydata.hasOwnProperty('products')) {
                  let cartproducts = [];
                  let product_img
                  for (const element of res['data'].products) {
                    this.getproductsBySlugs(element.pro_slug).subscribe(product => {
                      product_img = product['data']?.product_image[0] ? product['data'].product_image[0].pro_image : 'assets/images/product/placeholder.jpg';
                      let data =
                      {
                        "_id": element.pro_id,
                        "product_image": [
                          {
                            "pro_image": product_img,
                            "status": "active"
                          },
                        ],
                        "cart_id": res['data']._id,
                        "product_name": element.pro_name,
                        "product_slug": element.pro_slug,
                        "left_eye_qty": element.left_eye_qty,
                        "right_eye_qty": element.right_eye_qty,
                        "quantity": element.qty,
                        "stock": (product['data'].stock - element.qty),
                        "product_sale_price": element.price,
                        "addons": element.addons,
                        "addonsprice": element.addonsprice
                      }

                      console.log('cartproducts Push', data);
                      cartproducts.push(data);
                      console.log('Return LocalStorage Product Service', cartproducts);
                      // localStorage.removeItem('cartItems');
                      localStorage.setItem("cartItems", JSON.stringify(cartproducts));


                    },
                      error => {

                        this.toastrService.error(error.error.message);
                      }
                    )

                  }
                }
              },
              error => {

                this.toastrService.error(error.error.message);
              }
            )
          }
        }
        return true;
      }
    })
  }

  // Calculate Stock Counts
  public calculateStockCounts(product, quantity) {

    console.log('product===============', product);
    console.log('quantity===============', quantity);

    const stock = product.stock
    if (stock < 0) {
      this.toastrService.error('You can not add more items than available.');
      return false
    }
    return true
  }

  // Remove Cart items
  public removeCartItem(product: ProductNew): any {
    let getCartList = JSON.parse(localStorage.getItem('cartItems'));
    const productIdToFind = product._id; // Assuming `product` has a `product_id` field

    const index = getCartList.findIndex(item => item._id === productIdToFind);

    console.log('Befor Structure Delete Cart', product, getCartList, index);
    if (localStorage.getItem('u_token')) {
      if (this.userService.isTokenExpired(localStorage.getItem('u_token'))) {
        getCartList.splice(index, 1);

        localStorage.setItem("cartItems", JSON.stringify(getCartList));
        state.cart = getCartList;
      }
      else {
        getCartList.splice(index, 1);
        console.log('After Remove Cart getCartList :', getCartList);
        localStorage.setItem("cartItems", JSON.stringify(getCartList));

        let dcDAta =
        {
          "cart_id": product.cart_id,
          "pro_id": product._id,
        }
        this.deleteToCartDb(dcDAta).subscribe(
          res => {
            let bodydata = res['data'];
            console.log('bodydata Cart Return', bodydata);
            if (bodydata.hasOwnProperty('products') && res['data'].products.length > 0) {
              let cartproducts = [];
              let product_img
              for (const element of res['data'].products) {
                this.getproductsBySlugs(element.pro_slug).subscribe(product => {
                  product_img = product['data']?.product_image[0] ? product['data'].product_image[0].pro_image : 'assets/images/product/placeholder.jpg';
                  let data =
                  {
                    "_id": element.pro_id,
                    "product_image": [
                      {
                        "pro_image": product_img,
                        "status": "active"
                      },
                    ],
                    "cart_id": res['data']._id,
                    "product_name": element.pro_name,
                    "product_slug": element.pro_slug,
                    "quantity": element.qty,
                    "stock": (product['data'].stock - element.qty),
                    "product_sale_price": element.price,
                    "addons": element.addons,
                    "addonsprice": element.addonsprice
                  }

                  console.log('cartproducts Push', data);
                  cartproducts.push(data);
                  console.log('Return LocalStorage Product Service', cartproducts);
                  // localStorage.removeItem('cartItems');
                  state.cart = cartproducts;
                  console.log('state.cart Delete', state.cart);
                })

              }
            }
            else {
              let getCartList_ = []
              localStorage.setItem("cartItems", JSON.stringify(getCartList_));
              state.cart = getCartList_;
              localStorage.removeItem('vendor_id')
              console.log('state.cart Delete', state.cart);
            }
          },
          error => {
            this.toastrService.error(error.error.message);
          }
        )
      }
    }
    else {
      getCartList.splice(index, 1);
      localStorage.setItem("cartItems", JSON.stringify(getCartList));
      state.cart = getCartList;
    }
    return true
  }

  // Total amount 
  public cartTotalAmount(): Observable<number> {
    return this.cartItems.pipe(
      map((products: ProductNew[]) => {
        if (!products || products.length === 0) {
          return 0;
        }

        return products.reduce((prev, curr: ProductNew) => {
          let product_price = 0;

          if (curr.addonsprice) {
            product_price = curr.product_sale_price != null
              ? curr.product_sale_price + curr.addonsprice
              : curr.product_retail_price + curr.addonsprice;
          } else {
            product_price = curr.product_sale_price != null
              ? curr.product_sale_price
              : curr.product_retail_price;
          }

          let price = product_price;
          return prev + (price * curr.quantity);
        }, 0);
      })
    );
  }


  public cartAddonsTotalAmount(): Observable<number> {
    return this.cartItems.pipe(map((product: ProductNew[]) => {
      return product.reduce((prev, curr: ProductNew) => {
        return Number(curr.addonsprice);
      }, 0);
    }));
  }



  /*
    ---------------------------------------------
    ------------  Filter Product  ---------------
    ---------------------------------------------
  */

  // Get Product Filter
  public filterProducts(filter: any): Observable<ProductNew[]> {
    return this.products.pipe(map(product =>
      product.filter((item: ProductNew) => {
        if (!filter.length) return true
        const Tags = filter.some((prev) => { // Match Tags
          if (item) {
            return prev
          }
        })
        return Tags
      })
    ));
  }

  // Sorting Filter
  public sortProducts(products: ProductNew[], payload: string): any {

    if (payload === 'ascending') {
      return products.sort((a, b) => {
        if (a._id < b._id) {
          return -1;
        } else if (a._id > b._id) {
          return 1;
        }
        return 0;
      })
    } else if (payload === 'a-z') {
      return products.sort((a, b) => {
        if (a.product_name < b.product_name) {
          return -1;
        } else if (a.product_name > b.product_name) {
          return 1;
        }
        return 0;
      })
    } else if (payload === 'z-a') {
      return products.sort((a, b) => {
        if (a.product_name > b.product_name) {
          return -1;
        } else if (a.product_name < b.product_name) {
          return 1;
        }
        return 0;
      })
    } else if (payload === 'low') {
      return products.sort((a, b) => {
        if (a.product_sale_price < b.product_sale_price) {
          return -1;
        } else if (a.product_sale_price > b.product_sale_price) {
          return 1;
        }
        return 0;
      })
    } else if (payload === 'high') {
      return products.sort((a, b) => {
        if (a.product_sale_price > b.product_sale_price) {
          return -1;
        } else if (a.product_sale_price < b.product_sale_price) {
          return 1;
        }
        return 0;
      })
    }
  }

  /*
    ---------------------------------------------
    ------------- Product Pagination  -----------
    ---------------------------------------------
  */
  public getPager(totalItems: number, currentPage: number = 1, pageSize: number = 16) {
    // calculate total pages
    let totalPages = Math.ceil(totalItems / pageSize);

    // Paginate Range
    let paginateRange = 3;

    // ensure current page isn't out of range
    if (currentPage < 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    let startPage: number, endPage: number;
    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else if (currentPage < paginateRange - 1) {
      startPage = 1;
      endPage = startPage + paginateRange - 1;
    } else {
      startPage = currentPage - 1;
      endPage = currentPage + 1;
    }

    // calculate start and end item indexes
    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

    // return object with all pager properties required by the view
    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages
    };
  }

  ////////////////////////////////////////
  // API Call For ADD TO CArt
  ////////////////////////////////////////

  addToCartDb(data: any): Observable<any> {
    const url = environment.baseUrl + 'cart/add';
    return this.securityService.signedRequest('POST', url, data);
  }

  addToCartDbBulk(data: any): Observable<any> {
    const url = environment.baseUrl + 'cart/bulkadd';
    return this.securityService.signedRequest('POST', url, data);
  }

  deleteToCartDb(data: any): Observable<any> {
    const url = environment.baseUrl + 'cart/delete';
    return this.securityService.signedRequest('POST', url, data);
  }

  allCartProducts(): Observable<any> {
    const url = environment.baseUrl + 'cart/list';
    return this.securityService.signedRequest('GET', url);

  }

  productSearch(data: any) {
    const url = environment.baseUrl + 'productsearch';
    return this.securityService.signedRequest('POST', url, data);
  }

  // for dashboard brands

  getHomeBrands() {
    const url = environment.baseUrl + 'home-page-brand/list';
    return this.securityService.signedRequest('GET', url);
  }

  // getHomeFilteredProduct(data) {
  //   const url = environment.baseUrl + 'home-filter-store-product';
  //   return this.securityService.signedRequest('POST', url, data);
  // }

  gettagList() {
    const url = environment.baseUrl + 'tag-list';
    return this.securityService.signedRequest('GET', url);
  }

  gettestMediaSection(store_slug: any) {
    const url = environment.baseUrl + `media-text-contain-list?store_slug=${store_slug}`;
    return this.securityService.signedRequest('GET', url);
  }

  checkReturnEligibility(orderId: string) {
    const url = environment.baseUrl + 'returns/eligible/' + orderId;
    return this.securityService.signedRequest('GET', url);
    // return this.http.get(`/api/returns/eligible/${orderId}`);
  }

  submitReturn(data: any) {
    const url = environment.baseUrl + 'return/submit';
    return this.securityService.signedRequest('POST', url, data);
  }

  // === Multi-Store Portal ===

  getProductFulfillers(productId: string): Observable<any> {
    const url = `${environment.baseUrl}products/${productId}/fulfillers`;
    return this.securityService.signedRequest('GET', url);
  }

  getVendorStoreLandingMTGs(store_slug: string): Observable<any> {
    const url = `${environment.baseUrl}mtg/vendor/store-landing-list`;
    return this.securityService.signedRequest('POST', url, { store_slug });
  }

}




