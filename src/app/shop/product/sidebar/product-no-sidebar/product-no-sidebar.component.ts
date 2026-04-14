import { Component, ElementRef, HostListener, OnChanges, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDetailsMainSlider, ProductDetailsThumbSlider } from '../../../../shared/data/slider';
import { ProductNew, ProductNew2 } from '../../../../shared/classes/product';
import { ProductService } from '../../../../shared/services/product.service';
import { SizeModalComponent } from "../../../../shared/components/modal/size-modal/size-modal.component";
import { ToastrService } from 'ngx-toastr';
import '@google/model-viewer';
import { view3DModalComponent } from 'src/app/shared/components/modal/product-view3D/product-view3D.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer, Meta, SafeResourceUrl, Title } from '@angular/platform-browser';
import { UserService } from 'src/app/shared/services/user.service';


const state = {
  products: JSON.parse(localStorage['products'] || '[]'),
  wishlist: JSON.parse(localStorage['wishlistItems'] || '[]'),
  compare: JSON.parse(localStorage['compareItems'] || '[]'),
  cart: JSON.parse(localStorage['cartItems'] || '[]')
}

@Component({
  selector: 'app-product-no-sidebar',
  templateUrl: './product-no-sidebar.component.html',
  styleUrls: ['./product-no-sidebar.component.scss']
})
export class ProductNoSidebarComponent implements OnInit, OnChanges {
  public products: ProductNew2[] = [];
  public product: ProductNew = {};
  public counter: number = 1;
  public activeSlide: any = 0;
  addtocartstatus: boolean = false;
  public productSubmitForm: FormGroup;
  others_color_code: any
  image3d: any;
  product_external_link: any = "#"
  cartbuttonhideStatus: any = 'inactive';
  quentityStatus: any = 'inactive';
  productAttributeArr = [];
  productAddons = [];
  selectedOptions: any = {}; // Addons selected options as an object with dropdown ID as key
  value: any = {}; // Addons prices as an object with dropdown ID as key
  uploadAddonsImage = [];
  addonSelectedResult = [];
  private fileToUpload: File = null;
  range: boolean = false;
  productAddonsPrice: number = 0;
  desableInput: boolean = false;
  AddonService: boolean = false;
  productImages = [];
  productWishliststatus: boolean = false;
  tryonenable: boolean = false;
  currentCartProductDeatils: any;
  cartAddons: any;
  iframeBaseLink = 'https://gltfviewer.ralbatech.com/?url='
  iframeLink: any
  is3DProduct: boolean = false;
  is2DProduct: boolean = true;
  isProductinCart: boolean = false;
  othervalue: any;
  fileUrl: any;
  is3Dactive: boolean = false;
  is2Dactive: boolean = true;
  select: string = 'select'; //johnley

  mandatoryFlag = false;

  // Multi-Store Portal: vendor selector
  fulfillers: any[] = [];
  hasMultipleFulfillers = false;
  showVendorSelector = false;
  selectedFulfiller: any = null;

  @ViewChild("view3D") view3D: view3DModalComponent;

  public ProductDetailsMainSliderConfig: any = ProductDetailsMainSlider;
  public ProductDetailsThumbConfig: any = ProductDetailsThumbSlider;

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: Event): void {
    event.preventDefault(); // Prevent default behavior (e.g., context menu)
    event.stopPropagation(); // Stop event propagation to parent elements
  }


  constructor(private sanitizer: DomSanitizer, private route: ActivatedRoute, private router: Router,
    private title: Title,
    private meta: Meta,
    public productService: ProductService, private toastrService: ToastrService, private formBuilder: FormBuilder, private userService: UserService) {
  }

  ngOnInit(): void {
    let product_slug = this.route.snapshot.paramMap.get('slug');
    console.log('this.currentCartProductDeatils --------------------', this.currentCartProductDeatils);
    console.log('this.cartAddons --------------------', this.cartAddons);

    this.productService.getSettingsDetails().subscribe(
      res => {
        if (res.length) {
          this.cartbuttonhideStatus = res['data'][0].addto_cart_status;
          this.quentityStatus = res['data'][0].quentity_status;
        }
      }
    )
    this.productService.getproductsBySlugs(product_slug).subscribe(response => {

      this.product = response.data;
      if (Object.keys(this.product).length > 0) {
        // Normalize tags to array of strings
        let tags = [];
        if (Array.isArray(this.product.product_meta_tags)) {
          tags = this.product.product_meta_tags;
        } else if (typeof this.product.product_meta_tags === 'string') {
          tags = this.product.product_meta_tags.split(',').map(t => t.trim());
        }

        // Set page title
        if (this.product?.product_name) {
          this.title.setTitle(`Ralba Technologies | ${this.product.product_name}`);
        }

        // Add/update meta tags
        this.meta.updateTag({ name: 'keywords', content: tags.join(', ') });
        this.meta.updateTag({ name: 'description', content: this.product.product_description || '' });

        this.productWishliststatus = this.productService.wishlistProductCheck(this.product)
        this.productAttributeArr = response.data.attributes;
        this.productAddons = response.data.add_ons;
        console.log('productAttributeArr =================', this.productAttributeArr);
        console.log('product Add ons =================', this.productAddons);


        // Initialize selectedOptions and value objects with the existing values
        this.productAddons.forEach(addon => {
          if (addon.addon_slug) {

            if (addon.add_ons_input == 'range' || addon.add_ons_input == 'range-input')
              this.selectedOptions[addon.addon_slug] = addon.add_ons_value[0].values || 0;
          }
        });

        console.log('productAddons =================', this.productAddons);
        if (response.data.product_3d_image.length > 0) {

          let product3durl = response.data.product_3d_image[0].pro_3d_image;
          this.is3DProduct = product3durl ? true : false;
          let colorCode = response.data?.product_bg_color ? response.data?.product_bg_color?.slice(1) : '#fff';
          let fulliframeURL = this.iframeBaseLink + product3durl + '&color=' + colorCode;
          this.iframeLink = this.sanitizer.bypassSecurityTrustResourceUrl(fulliframeURL);
        }
        if (!response.data.product_image[0]) {
          this.is2Dactive = false;
          this.is3Dactive = true;
          this.is2DProduct = false;
        }
        this.productImages.push(...response.data.product_3d_image)
        this.productImages.push(...response.data.product_image)
        if (response.data.product_tryon_3d_image.length > 0 || response.data.product_tryon_2d_image.length > 0) {
          if (response.data.product_tryon_3d_image[0].pro_3d_image != "" || response.data.product_tryon_2d_image[0].pro_2d_image != "") {

            this.tryonenable = true
          }
        }
        this.ceateForm();
        if (response.data.product_external_link) {
          this.product_external_link = response.data.product_external_link;
        }
        else {
          this.product_external_link = "#"
        }
        if (response.data.product_tryon_3d_image.length > 0 && response.data.product_tryon_2d_image.length > 0) {
          this.image3d = {
            "Threed_Tryon": response.data.product_tryon_3d_image[0].pro_3d_image,
            "Twod_Tryon": response.data.product_tryon_2d_image[0].pro_2d_image
          };
        }
        else if (response.data.product_tryon_3d_image.length > 0 && response.data.product_tryon_2d_image.length == 0) {
          this.image3d = {
            "Threed_Tryon": response.data.product_tryon_3d_image[0].pro_3d_image,
            "Twod_Tryon": ''
          };
        }
        else if (response.data.product_tryon_3d_image.length == 0 && response.data.product_tryon_2d_image.length > 0) {
          this.image3d = {
            "Threed_Tryon": '',
            "Twod_Tryon": response.data.product_tryon_2d_image[0].pro_2d_image
          };
        }
        else {
          this.image3d = {
            "Threed_Tryon": '',
            "Twod_Tryon": ''
          };
        }

        let cart = JSON.parse(localStorage.getItem('cartItems'));
        if (cart && cart.length > 0) {
          this.currentCartProductDeatils = this.findProductInCart(product_slug, cart);
          if (this.currentCartProductDeatils) {
            this.isProductinCart = true;
            console.log('this.currentCartProductDeatils', this.currentCartProductDeatils);
            this.counter = this.currentCartProductDeatils.quantity;
            this.product.stock = this.product.stock - this.currentCartProductDeatils.quantity;
            this.product.quantity = this.currentCartProductDeatils.quantity;
            if (this.currentCartProductDeatils.addons && this.currentCartProductDeatils.addons.length > 0) {
              this.cartAddons = this.currentCartProductDeatils.addons;
              this.addonSelectedResult = this.cartAddons;
              this.productAddonsPrice = this.currentCartProductDeatils.addonsprice
              this.AddonService = true;
              this.prefillAddons(this.cartAddons);
            }
          }

        }

      }
      else {
        this.router.navigateByUrl('/')
      }
    });

    // Multi-Store Portal: load fulfillers for "Choose your vendor" button
    this.productService.getproductsBySlugs(product_slug).subscribe(response => {
      if (response.data && response.data._id) {
        this.productService.getProductFulfillers(response.data._id).subscribe(
          res => {
            this.fulfillers = res.data?.fulfillers || [];
            this.hasMultipleFulfillers = this.fulfillers.length > 1;

            const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
            const cartLine = (cartItems || []).find((item: any) =>
              item?._id === response.data._id || item?.product_slug === response.data.product_slug
            );
            const existingVendorId = cartLine?.fulfiller_vendor_id || cartLine?.effective_vendor_id;
            if (existingVendorId) {
              const matched = this.fulfillers.find((f: any) => f?.vendor_id?._id === existingVendorId);
              if (matched) {
                this.selectedFulfiller = {
                  vendorId: matched.vendor_id._id,
                  vendorPrice: matched.vendor_sales_price,
                  storeName: matched.store_name || matched.vendor_id?.name
                };
              }
            }
          }
        );
      }
    });

  }

  active3DSlider() {
    event.preventDefault();
    if (this.is3DProduct) {
      this.is3Dactive = true;
      this.is2Dactive = false;
    }
  }

  active2DSlider() {
    event.preventDefault();
    this.is3Dactive = false;
    this.is2Dactive = true;
  }

  // prefillAddons(savedAddons: any) {
  //   savedAddons.forEach((savedAddon: any) => {
  //     if (savedAddon.hasOwnProperty('extra_document')) {
  //       savedAddon.extra_document.forEach((savedAddon: any) => {
  //         const addon = this.productAddons.find(a => a.addon_slug === savedAddon.keyname);
  //         if (addon) {
  //           this.fileUrl = savedAddon.fileUrl;
  //         }
  //       });

  //     }
  //     else {
  //       const addon = this.productAddons.find(a => a.addon_slug === savedAddon.key);
  //       if (addon) {
  //         this.value[addon.addon_slug] = savedAddon.price;
  //         this.selectedOptions[addon.addon_slug] = savedAddon.value;
  //         addon.add_ons_value[0].values = savedAddon.value;
  //         if (addon.input_type == 'range') {
  //           this.range = true;
  //         }
  //         if (savedAddon.input_type == 'range-input') {
  //           this.othervalue = savedAddon.other;
  //           this.range = true;
  //         }
  //       }
  //     }

  //   });
  // }
  // Modifier la méthode prefillAddons pour utiliser add_ons_name
  prefillAddons(savedAddons: any) {
    savedAddons.forEach((savedAddon: any) => {
      if (savedAddon.hasOwnProperty('extra_document')) {
        savedAddon.extra_document.forEach((savedAddon: any) => {
          // Chercher par keyname (qui pourrait être addon_slug ou add_ons_name)
          const addon = this.productAddons.find(a =>
            a.addon_slug === savedAddon.keyname || a.add_ons_name === savedAddon.keyname
          );
          if (addon) {
            this.fileUrl = savedAddon.fileUrl;
          }
        });
      }
      else {
        // Chercher l'addon soit par key (qui pourrait être addon_slug ou add_ons_name)
        const addon = this.productAddons.find(a =>
          a.addon_slug === savedAddon.key || a.add_ons_name === savedAddon.key
        );

        if (addon) {
          this.value[addon.add_ons_name] = savedAddon.price;
          this.selectedOptions[addon.add_ons_name] = savedAddon.value;

          // Garder le code existant pour les types spécifiques
          if (addon.add_ons_input == 'range') {
            addon.add_ons_value[0].values = savedAddon.value;
            this.range = true;
          }
          if (savedAddon.input_type == 'range-input') {
            this.othervalue = savedAddon.other;
            this.range = true;
          }
        }
      }
    });
  }
  // Function to sanitize a single URL using DomSanitizer
  sanitizeURL(url: string): SafeResourceUrl {
    let urlYoutube = url.replace("watch?v=", "v/");
    return this.sanitizer.bypassSecurityTrustResourceUrl(urlYoutube);
  }


  findProductInCart(product_slug, cart) {
    return cart.find(product => product.product_slug === product_slug);
  }

  ceateForm() {
    const formControlsConfig = {};
    if (this.productAddons) {

      const mandatoryAddons = this.productAddons.filter(a => a.is_mandatory);
      if (mandatoryAddons.length > 0 && !this.AddonService) {
        this.mandatoryFlag = true;
      }

      for (const item of this.productAddons) {
        if (item.add_ons_input == 'range-input') {
          const controlName = item.add_ons_name.includes(' ')
            ? item.add_ons_name.toLowerCase()
              .replace(/ /g, '_')
              .replace(/[^\w-]+/g, '')
            : item.add_ons_name.toLowerCase();
          formControlsConfig[controlName + '-1_addons'] = new FormControl();

          const controlName2 = item.add_ons_name.includes(' ')
            ? item.add_ons_name.toLowerCase()
              .replace(/ /g, '_')
              .replace(/[^\w-]+/g, '')
            : item.add_ons_name.toLowerCase();
          formControlsConfig[controlName2 + '-2_addons'] = new FormControl();

          const controlName3 = item.add_ons_name.includes(' ')
            ? item.add_ons_name.toLowerCase()
              .replace(/ /g, '_')
              .replace(/[^\w-]+/g, '')
            : item.add_ons_name.toLowerCase();
          formControlsConfig[controlName3 + '-price_addons'] = new FormControl();

        }
        else {
          const controlName = item.add_ons_name.includes(' ')
            ? item.add_ons_name.toLowerCase()
              .replace(/ /g, '_')
              .replace(/[^\w-]+/g, '')
            : item.add_ons_name.toLowerCase();
          formControlsConfig[controlName + '_addons'] = new FormControl();
          const controlName2 = item.add_ons_name.includes(' ')
            ? item.add_ons_name.toLowerCase()
              .replace(/ /g, '_')
              .replace(/[^\w-]+/g, '')
            : item.add_ons_name.toLowerCase();
          formControlsConfig[controlName2 + '-price_addons'] = new FormControl();
        }

      }
    }
    console.log('formControlsConfig -========================>?', formControlsConfig)
    this.productSubmitForm = this.formBuilder.group(formControlsConfig);

  }


  externalLInk(link: any) {
    window.open(link, "_blank");
  }

  ngOnChanges() {

  }
  // Increament
  increment() {
    this.counter++;
  }

  tryonpage() {
    this.router.navigateByUrl('/tryon')
  }

  // Decrement
  decrement() {
    if (this.counter > 1) this.counter--;
  }

  validateMandatoryAddons(): boolean {
    if (!this.productAddons || this.productAddons.length === 0) {
      return true;
    }

    const mandatoryAddons = this.productAddons.filter(a => a.is_mandatory);
    if (mandatoryAddons.length > 0 && !this.AddonService) {
      this.toastrService.error('This product requires mandatory addons. Please enable the option to enter your choices.');
      return false;
    }

    for (const addon of mandatoryAddons) {
      let isValid = false;
      const name = addon.add_ons_name;
      const slug = addon.addon_slug;

      switch (addon.add_ons_input) {
        case 'file':
          const fileKey = this.getFormControlName(name);
          isValid = this.uploadAddonsImage.some(img => img.key === fileKey || img.keyname === fileKey);
          break;

        case 'select':
          const selectedValue = this.selectedOptions[name];
          isValid = (selectedValue && selectedValue !== 'select' && selectedValue !== '');
          break;

        case 'input':
        case 'textarea':
          const val = this.selectedOptions[slug];
          isValid = (val !== undefined && val !== null && val !== '');
          break;

        case 'range':
        case 'range-input':
          const rangeVal = this.selectedOptions[slug];
          isValid = (rangeVal !== undefined && rangeVal !== null);
          break;

        default:
          isValid = true;
          break;
      }

      if (!isValid) {
        this.toastrService.error(`Please fill the mandatory field: ${name}`);
        return false;
      }
    }
    return true;
  }

  // Add to cart
  async addToCart(product: any) {
    event.preventDefault();
    if (!this.validateMandatoryAddons()) {
      return;
    }
    if (this.counter > product.stock) {
      return;
    }
    console.log('this.productAddonsPrice ==============', this.productAddonsPrice, this.addonSelectedResult);
    if (this.isProductinCart) {
      this.applySelectedFulfillerToProduct(product);
      product.addonsprice = this.productAddonsPrice;
      let extraObj =
      {
        extra_document: this.uploadAddonsImage
      }
      if (this.uploadAddonsImage.length > 0) {
        this.addonSelectedResult.push(extraObj);
      }
      product.addons = this.addonSelectedResult
      console.log('Product Ready To cart------------------', product);
      let extraStock = this.counter - this.currentCartProductDeatils.quantity

      const status = await this.productService.addToCart(product, this.counter, this.isProductinCart);
      console.log('status----', status);
      if (status || status == undefined) {
        this.toastrService.success('Product updated in Cart.');
      }
      else {
        this.toastrService.warning('Different vendor product not allow');
      }

    }
    else {
      this.applySelectedFulfillerToProduct(product);
      product.addonsprice = this.productAddonsPrice;
      let extraObj =
      {
        extra_document: this.uploadAddonsImage
      }
      if (this.uploadAddonsImage.length > 0) {
        this.addonSelectedResult.push(extraObj);
      }
      product.addons = this.addonSelectedResult

      const status = await this.productService.addToCart(product, this.counter, this.isProductinCart);
      if (status || status == undefined) {
        this.isProductinCart = true;
        this.toastrService.success('Product has been added in Cart.');
      }
      else {
        this.toastrService.warning('Different vendor product not allow');
      }

    }
  }


  // key value to text convert with capitalize format
  capitalizeString(str) {
    let words = str.split('_');
    let capitalizedWords = words.map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });


    const pattern = /\d{2}p\d/;

    let capitalizedString = capitalizedWords.join(' ');
    capitalizedString = this.removeLabelPrefix(capitalizedString);
    capitalizedString = capitalizedString.replace(/\b(167|174)\b/g, match => {
      return match === '167' ? '1.67' : '1.74';
    });

    if (pattern.test(capitalizedString)) {
      capitalizedString = capitalizedString.replace('p', '.');
    }
    return capitalizedString;
  }



  //johnley

  removeLabelPrefix(str) {
    let prefix_list = ['Sv', 'Ftb', 'Ftt', 'Vp', 'Dp'];
    let prefix_index = str.indexOf(' ');
    let prefix = str.substring(0, prefix_index);
    if (prefix_list.includes(prefix)) {
      str = str.substring(prefix_index + 1, str.length);
    }
    return str;
  }

  uploadFiles(files: FileList, formcontrolname, addon) {
    this.fileToUpload = files.item(0);

    // Check if the file size exceeds 5MB
    const fileSizeInMB = this.fileToUpload.size / (1024 * 1024); // Convert bytes to MB
    if (fileSizeInMB > 5) {
      // Show error toaster message and return to prevent the upload
      this.toastrService.error('File size exceeds 5MB. Please select a smaller file.');
      return;
    }

    // Proceed with the upload if the file size is within the limit
    this.productService.uploadImage(this.fileToUpload).subscribe(
      (res) => {
        this.value[formcontrolname] = addon.add_ons_value[0].price ? addon.add_ons_value[0].price : 0;
        let imgobj = {
          key: formcontrolname,
          fileUrl: res['data'].fileUrl,
          price: parseFloat(addon.add_ons_value[0].price ? addon.add_ons_value[0].price : 0)
        };
        const exists = this.uploadAddonsImage.findIndex(el => el.keyname == formcontrolname);
        let oldObj = this.uploadAddonsImage.find(el => el.keyname == formcontrolname);
        if (exists == -1) {
          this.uploadAddonsImage.push(imgobj);
          this.productAddonsPrice += parseFloat(addon.add_ons_value[0].price ? addon.add_ons_value[0].price : 0);
        } else {
          oldObj.fileUrl = res['data'].fileUrl;
          this.uploadAddonsImage.splice(exists, 1, oldObj);
        }
      },
      error => {
        this.toastrService.error(error.error.message);
      }
    );
  }


  onMultiInputChange(val: any, slug, addon) {
    this.others_color_code = val;
    let seletctObject =
    {
      key: addon.addon_slug,
      input_type: addon.add_ons_input,
      value: '',
      price: addon.add_ons_value[0].price ? addon.add_ons_value[0].price : 0,
      other: val
    }
    const exists = this.addonSelectedResult.findIndex(el => el.key == addon.addon_slug);
    let oldObj = this.addonSelectedResult.find(el => el.key == addon.addon_slug);
    // // If the key-value pair doesn't exist, push the object into the array
    if (exists == -1) {
      this.addonSelectedResult.push(seletctObject);
      this.productAddonsPrice += parseFloat(addon.add_ons_value[0].price ? addon.add_ons_value[0].price : 0)
    }
    else {
      oldObj.other = val;
      this.addonSelectedResult.splice(exists, 1, oldObj)
    }

    console.log('this.addonSelectedResult', this.addonSelectedResult);
    console.log('this.productAddonsPrice ', this.productAddonsPrice);
  }


  getFormControlName(name: string): string {
    return name.toLowerCase()
      .replace(/ /g, '_')
      .replace(/[^\w-]+/g, '');
  }


  onInputChange(val: any, slug: string, addon: any) {
    // Update the values in the model
    this.productAddons = this.productAddons.map(elm => {
      if (elm.addon_slug === slug) {
        elm.add_ons_value[0].values = val;
      }
      return elm;
    });

    if (val == 0 && (addon.add_ons_input === 'range' || addon.add_ons_input === 'range-input')) {
      this.range = false;
    }

    this.value[slug] = addon.add_ons_value[0].price ? addon.add_ons_value[0].price : 0;
    this.selectedOptions[slug] = val;

    // Update addonSelectedResult
    const selecttxt = this.productAddons.find(item => item.addon_slug === slug);
    if (selecttxt) {
      let seletctObject = {
        key: addon.addon_slug,
        input_type: addon.add_ons_input,
        value: val,
        price: addon.add_ons_value[0].price ? addon.add_ons_value[0].price : 0,
        other: ''
      };
      const exists = this.addonSelectedResult.findIndex(el => el.key === addon.addon_slug);
      let oldObj = this.addonSelectedResult.find(el => el.key === addon.addon_slug);
      if (exists === -1) {
        this.addonSelectedResult.push(seletctObject);
        this.productAddonsPrice += parseFloat(addon.add_ons_value[0].price ? addon.add_ons_value[0].price : 0);
        if ((addon.add_ons_input === 'range' || addon.add_ons_input === 'range-input')) {
          this.range = true;
        }

      } else {
        if (this.cartAddons) {
          const isCartExists = this.cartAddons.findIndex(el => el.key === addon.addon_slug);
          if (isCartExists === -1) {
            this.productAddonsPrice += parseFloat(addon.add_ons_value[0].price ? addon.add_ons_value[0].price : 0);
          }
        }
        if (Number(val) > 0 && (addon.add_ons_input === 'range' || addon.add_ons_input === 'range-input')) {

          if (oldObj.other != '') {
            seletctObject.other = oldObj.other;
          }

          this.addonSelectedResult.splice(exists, 1, seletctObject);
        } else if (val.length > 0 && (addon.add_ons_input === 'input' || addon.add_ons_input === 'textarea')) {
          if (oldObj.other != '') {
            seletctObject.other = oldObj.other;
          }
          this.addonSelectedResult.splice(exists, 1, seletctObject);
        } else {
          this.addonSelectedResult.splice(exists, 1);
          this.productAddonsPrice -= parseFloat(oldObj.price);
        }
      }
    }
    console.log('addonSelectedResult------------', this.addonSelectedResult)
    console.log('productAddonsPrice------------', this.productAddonsPrice)
  }

  // updatePrice(dropdownSlug: string) {
  //   const dropdown = this.productAddons.find(item => item.addon_slug === dropdownSlug);
  //   if (dropdown) {
  //     const selectedOption = this.selectedOptions[dropdownSlug];
  //     const priceObj = dropdown.add_ons_value.find(option => option.value_slug === selectedOption);
  //     if (priceObj) {
  //       let seletctObject = {
  //         key: dropdownSlug,
  //         input_type: dropdown.add_ons_input,
  //         value: selectedOption,
  //         price: priceObj.price ? priceObj.price : 0,
  //         other: ''
  //       };

  //       this.pushObjectIfKeyNotExists(this.addonSelectedResult, 'key', selectedOption, seletctObject);

  //       this.value[dropdownSlug] = priceObj.price;
  //     }
  //   }
  // }


  // Méthode pour mettre à jour le prix lorsqu'une option est sélectionnée
  updatePrice(addonName: string) {
    const addon = this.productAddons.find(item => item.add_ons_name === addonName);

    if (addon) {
      const selectedValue = this.selectedOptions[addonName];
      // const selectedOption = addon.add_ons_value.find(option => option.values === selectedValue);
      const selectedOption = addon.add_ons_value.find(option => option.value_slug === selectedValue);

      if (selectedOption) {
        // Trouver si une option était déjà sélectionnée pour cet addon
        const existingIndex = this.addonSelectedResult.findIndex(item => item.key === addonName);

        // Si une option était déjà sélectionnée, soustraire son prix
        if (existingIndex !== -1) {
          this.productAddonsPrice -= parseFloat(this.addonSelectedResult[existingIndex].price || '0');
          this.addonSelectedResult.splice(existingIndex, 1);
        }

        // Ajouter la nouvelle option
        const optionObject = {
          key: addonName,
          input_type: addon.add_ons_input,
          value: selectedValue,
          price: selectedOption.price || '0',
          other: ''
        };

        this.addonSelectedResult.push(optionObject);
        this.productAddonsPrice += parseFloat(selectedOption.price || '0');
        // this.value[addonName] = selectedOption.price;
        this.value[addonName] = parseFloat(selectedOption.price || '0'); // Pour être sûr que ce soit un nombre


        // Réinitialiser les sélections des champs enfants
        this.resetChildSelections(addonName);
      }
    }
  }

  pushObjectIfKeyNotExists(array: any[], key: string, value: any, obj: any) {
    const index = array.findIndex(el => el.key === obj.key);

    if (index === -1) {
      // If the object is not found, add it to the array and update the price
      this.productAddonsPrice += parseFloat(obj.price ? obj.price : '0');
      array.push(obj);
    } else {
      // If the object is found, subtract the old price and then update or replace the object
      const oldPrice = array[index].price ? parseFloat(array[index].price) : 0;
      this.productAddonsPrice -= oldPrice;

      // Update the array with the new object
      array.splice(index, 1, obj);

      // Add the new price
      this.productAddonsPrice += parseFloat(obj.price ? obj.price : '0');
    }
  }


  stingURLCheck(str) {
    if (str.startsWith("http")) {
      let parts = str.split('.');
      let extension = parts[parts.length - 1];
      if (extension == 'jpg' || extension == 'png') {
        return 'img';
      }
      else {
        return 'pdf';
      }

    }
    else {
      return false;
    }
  }


  // Add to Wishlist
  addToWishlist(product: any) {
    product.addonsprice = this.productAddonsPrice;
    let extraObj =
    {
      extra_document: this.uploadAddonsImage
    }
    if (this.uploadAddonsImage.length > 0) {
      this.addonSelectedResult.push(extraObj);
    }
    product.addons = this.addonSelectedResult
    this.productService.addToWishlist(product);
    this.productWishliststatus = this.productService.wishlistProductCheck(product)
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    const container = event.currentTarget as HTMLElement;
    const image = container.querySelector('img') as HTMLElement;
    const scale = 2; // Zoom scale
    if (image) {
      const xPercent = (offsetX / container.offsetWidth) * 100;
      const yPercent = (offsetY / container.offsetHeight) * 100;

      image.style.transformOrigin = `${xPercent}% ${yPercent}%`;
      container.classList.add('zoomed');
    }

  }

  @HostListener('mouseleave')
  onMouseLeave() {
    const container = document.querySelector('.zoom-container') as HTMLElement;
    if (container) {
      container.classList.remove('zoomed');
    }

  }










  //johnley



  showHelp: boolean = false;
  selectedHelpName: string = '';
  getHelpByName(name: string): string {
    const helpItem = this.productAddons.find(item => item.add_ons_name === name);
    return helpItem && helpItem.add_ons_help?.trim()
      ? helpItem.add_ons_help
      : 'Aucune aide disponible';
  }

  hasHelp(name: string): boolean {
    const help = this.getHelpByName(name);
    return help !== 'Aucune aide disponible';
  }

  toggleHelp(name: string): void {
    if (this.selectedHelpName === name && this.showHelp) {
      // Si c'est le même élément et qu'il est ouvert, on le ferme
      this.showHelp = false;
      this.selectedHelpName = '';
    } else {
      // Sinon on ouvre l'aide pour cet élément
      this.showHelp = true;
      this.selectedHelpName = name;

      // Ajuster la position après l'affichage
      setTimeout(() => this.adjustTooltipPosition(), 10);
    }
  }

  // Ajuste la position du tooltip selon l'espace disponible
  adjustTooltipPosition(): void {
    const tooltip = document.querySelector('.help-tooltip') as HTMLElement;
    if (tooltip) {
      const rect = tooltip.getBoundingClientRect();
      const windowWidth = window.innerWidth;

      // Si le tooltip dépasse à droite, l'afficher à gauche
      if (rect.right > windowWidth - 20) {
        tooltip.classList.add('help-tooltip-right');
      } else {
        tooltip.classList.remove('help-tooltip-right');
      }
    }
  }

  // Fermer l'aide en cliquant ailleurs
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.help-icon') && !target.closest('.help-tooltip')) {
      this.showHelp = false;
      this.selectedHelpName = '';
    }
  }

  // Fermer avec la touche Échap
  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(): void {
    this.showHelp = false;
    this.selectedHelpName = '';
  }



  // Ajouter ou modifier ces méthodes

  // Méthode pour récupérer la valeur sélectionnée d'un champ
  getSelection(name: string): string {
    const selection = this.selectedOptions ? this.selectedOptions[name] : undefined;
    if (typeof selection !== 'string') {
      return '';
    }
    return selection.replace(/_/g, '-');
  }






  // Initialiser les options sélectionnées
  initializeSelectedOptions() {
    // Initialiser les valeurs pour tous les addons
    this.productAddons.forEach(addon => {
      // Initialiser chaque addon avec une valeur vide
      this.selectedOptions[addon.add_ons_name] = '';
      this.value[addon.add_ons_name] = 0;
    });
  }


  // Méthode pour réinitialiser les champs enfants lorsqu'un parent change
  resetChildSelections(parentName: string) {
    // Trouver tous les addons qui ont ce parent
    const childAddons = this.productAddons.filter(addon =>
      addon.add_ons_parent_name === parentName
    );

    // Réinitialiser chaque enfant
    childAddons.forEach(childAddon => {
      const childName = childAddon.add_ons_name;

      // Retirer l'option de addonSelectedResult si elle existe
      const existingIndex = this.addonSelectedResult.findIndex(item => item.key === childName);
      if (existingIndex !== -1) {
        this.productAddonsPrice -= parseFloat(this.addonSelectedResult[existingIndex].price || '0');
        this.addonSelectedResult.splice(existingIndex, 1);
      }

      // Réinitialiser la sélection
      this.selectedOptions[childName] = '';
      this.value[childName] = 0;

      // Récursivement réinitialiser les enfants de cet enfant
      this.resetChildSelections(childName);
    });
  }



  ChangingValue($event) {
    return this.select;
  }

  // Multi-Store Portal: vendor selection
  onVendorSelected(event: { vendorId: string; vendorPrice: number; storeName: string }) {
    this.selectedFulfiller = event;
    this.showVendorSelector = false;
  }

  private applySelectedFulfillerToProduct(product: any) {
    if (this.selectedFulfiller?.vendorId) {
      product.selected_fulfiller_vendor_id = this.selectedFulfiller.vendorId;
      product.selected_fulfiller_price = this.selectedFulfiller.vendorPrice;
      product.effective_vendor_id = this.selectedFulfiller.vendorId;
    } else {
      delete product.selected_fulfiller_vendor_id;
      delete product.selected_fulfiller_price;
      delete product.effective_vendor_id;
    }
  }

}
