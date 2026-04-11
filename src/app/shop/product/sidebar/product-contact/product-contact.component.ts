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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UserService } from 'src/app/shared/services/user.service';


const state = {
  products: JSON.parse(localStorage['products'] || '[]'),
  wishlist: JSON.parse(localStorage['wishlistItems'] || '[]'),
  compare: JSON.parse(localStorage['compareItems'] || '[]'),
  cart: JSON.parse(localStorage['cartItems'] || '[]')
}

@Component({
  selector: 'app-product-contact',
  templateUrl: './product-contact.component.html',
  styleUrls: ['./product-contact.component.scss']
})
export class ProductContactComponent implements OnInit, OnChanges {
  public products: ProductNew2[] = [];
  public product: ProductNew = {};
  public counter: number = 0;
  public counter2: number = 0;
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
  // AddonService: boolean = true;
  productImages = [];
  productWishliststatus: boolean = false;
  tryonenable: boolean = false;
  currentCartProductDeatils: any;
  cartAddons: any;
  iframeBaseLink = 'https://gltfviewer.ralbatech.com/?url='
  iframeLink: any
  isProductinCart: boolean = false;
  othervalue: any;
  fileUrl: any;
  totalstock: number = 0;
  mandatoryFlag = false;

  @ViewChild("view3D") view3D: view3DModalComponent;

  public ProductDetailsMainSliderConfig: any = ProductDetailsMainSlider;
  public ProductDetailsThumbConfig: any = ProductDetailsThumbSlider;

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: Event): void {
    event.preventDefault(); // Prevent default behavior (e.g., context menu)
    event.stopPropagation(); // Stop event propagation to parent elements
  }


  constructor(private sanitizer: DomSanitizer, private route: ActivatedRoute, private router: Router,
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
        this.productWishliststatus = this.productService.wishlistProductCheck(this.product)
        this.productAttributeArr = response.data.attributes;
        this.productAddons = response.data.add_ons;
        console.log('productAttributeArr =================', this.productAttributeArr);

        // Initialize selectedOptions and value objects with the existing values
        this.productAddons.forEach(addon => {
          if (addon.addon_slug) {

            if (addon.add_ons_input == 'range' || addon.add_ons_input == 'range-input')
              this.selectedOptions[addon.addon_slug] = addon.add_ons_value[0].values || 0;
          }
        });

        if (response.data.product_3d_image.length > 0) {
          let product3durl = response.data.product_3d_image[0].pro_3d_image;
          let colorCode = response.data.product_bg_color.slice(1);
          let fulliframeURL = this.iframeBaseLink + product3durl + '&color=' + colorCode;
          this.iframeLink = this.sanitizer.bypassSecurityTrustResourceUrl(fulliframeURL);
        }
        this.productImages.push(...response.data.product_3d_image)
        this.productImages.push(...response.data.product_image)
        if (response.data.product_tryon_3d_image.length > 0 || response.data.product_tryon_2d_image.length > 0) {
          this.tryonenable = true
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
            this.counter = this.currentCartProductDeatils.left_eye_qty;
            this.counter2 = this.currentCartProductDeatils.right_eye_qty;
            this.totalstock = (this.counter + this.counter2)
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

  }


  prefillAddons(savedAddons: any) {
    savedAddons.forEach((savedAddon: any) => {
      if (savedAddon.hasOwnProperty('extra_document')) {
        savedAddon.extra_document.forEach((savedAddon: any) => {
          const addon = this.productAddons.find(a => a.addon_slug === savedAddon.keyname);
          if (addon) {
            this.fileUrl = savedAddon.fileUrl;
          }
        });

      }
      else {
        const addon = this.productAddons.find(a => a.addon_slug === savedAddon.key);
        if (addon) {
          this.value[addon.addon_slug] = savedAddon.price;
          this.selectedOptions[addon.addon_slug] = savedAddon.value;
          addon.add_ons_value[0].values = savedAddon.value;
          if (addon.input_type == 'range') {
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
    this.totalstock = (this.counter + this.counter2)
  }

  tryonpage() {
    this.router.navigateByUrl('/tryon')
  }

  // Decrement
  decrement() {
    if (this.counter > 1) this.counter--;
    this.totalstock = (this.counter + this.counter2)
  }

  // Increament
  increment2() {
    this.counter2++;
    this.totalstock = (this.counter + this.counter2)
  }

  // Decrement
  decrement2() {
    if (this.counter2 > 1) this.counter2--;
    this.totalstock = (this.counter + this.counter2)
  }




  validateMandatoryAddons(): boolean {
    if (!this.productAddons || this.productAddons.length === 0) {
      return true;
    }

    const mandatoryAddons = this.productAddons.filter(a => a.is_mandatory);
    if (mandatoryAddons.length > 0 && !this.AddonService) {
      this.toastrService.error('This product requires mandatory addons.');
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
    if (this.counter2 > product.stock) {
      return;
    }
    console.log('this.productAddonsPrice ==============', this.productAddonsPrice, this.addonSelectedResult);
    if (!this.counter && !this.counter2) {
      this.toastrService.error('Add atleast Left Eye Quantity or Right Eye Quantity');
      return false;
    }
    if (this.isProductinCart) {
      product.left_eye_qty = this.counter;
      product.right_eye_qty = this.counter2;
      product.quantity = this.totalstock;
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
      let extraStock = this.totalstock - this.currentCartProductDeatils.quantity

      const status = await this.productService.addToCart(product, extraStock, this.isProductinCart);
      if (status || status == undefined) {
        product.stock = (product.stock - this.counter);
        this.toastrService.success('Product updated in Cart.');
      }
      else {
        this.toastrService.warning('Different vendor product not allow');
      }
    }
    else {
      product.left_eye_qty = this.counter;
      product.right_eye_qty = this.counter2;
      product.quantity = this.totalstock;
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

      const status = await this.productService.addToCart(product, this.totalstock, this.isProductinCart);
      if (status || status == undefined) {
        product.stock = (product.stock - this.counter);
        this.toastrService.success('Product updated in Cart.');
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
    let capitalizedString = capitalizedWords.join(' ');

    return capitalizedString;
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
          keyname: formcontrolname,
          fileUrl: res['data'].fileUrl,
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

  updatePrice(dropdownSlug: string) {
    const dropdown = this.productAddons.find(item => item.addon_slug === dropdownSlug);
    if (dropdown) {
      const selectedOption = this.selectedOptions[dropdownSlug];
      const priceObj = dropdown.add_ons_value.find(option => option.value_slug === selectedOption);
      if (priceObj) {
        let seletctObject = {
          key: dropdownSlug,
          input_type: dropdown.add_ons_input,
          value: selectedOption,
          price: priceObj.price ? priceObj.price : 0,
          other: ''
        };

        this.pushObjectIfKeyNotExists(this.addonSelectedResult, 'key', selectedOption, seletctObject);

        this.value[dropdownSlug] = priceObj.price;
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
}
