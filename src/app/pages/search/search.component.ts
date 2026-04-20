import { ProductService } from 'src/app/shared/services/product.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  searchva: any;
  form: FormGroup;
  public productList: any = [];
  oproductfount: boolean = false;
  store_slug: any

  public ImageSrc: string
  @Input() onHowerChangeImage: boolean = false; // Default False
  @Input() thumbnail: boolean = false; // Default False 
  @Input() currency: any = this.productservice.Currency; // Default Currency 

  constructor(private route: ActivatedRoute, public productservice: ProductService, private router: Router) {
    this.store_slug = localStorage.getItem('storeslug')

    this.route.queryParams.subscribe(params => {
      this.searchva = params['u'];
      console.log('Serch Page val', this.searchva)
      let sData = {
        "searchkey": params['u'],
        "store_slug": this.store_slug ? this.store_slug : environment.defaultStore
      }

      this.productservice.productSearch(sData).subscribe(
        res => {
          this.productList = res['data'];
          console.log(this.productservice.wishlistProductCheck(this.productList[0]))
          console.log('product list Length', res['data'].length);
          if (res['data'].length == 0) {
            this.oproductfount = true;
          }
          else {
            this.oproductfount = false;
          }
          console.log(this.oproductfount);
          console.log('Search Results', res['data']);
        }
      )

    });

  }

  ngOnInit(): void {
    this.form = new FormGroup({
      'searchkey': new FormControl(null, [Validators.minLength(3)])
    })
  }
  get searchkey() { return this.form.get('searchkey'); }

  // Get Product Color
  Color(product_varient_options) {
    const uniqColor = [];
    for (let i = 0; i < (product_varient_options).length; i++) {
      if (!uniqColor.includes(product_varient_options[i]) && product_varient_options[i]) {
        uniqColor.push(product_varient_options[i]);
      }
    }

    return uniqColor
  }

  // Change Variants
  ChangeVariants(color, product) {
    product.product_varient_options.map((item) => {
      if (item.color_options === color) {
        product.product_image.map((img) => {
          this.ImageSrc = img.pro_image;
        })
      }
    })
  }

  // Change Variants Image
  ChangeVariantsImage(src) {
    this.ImageSrc = src;
  }

  storeHomePage()
  {
    if(this.store_slug)
    {
      this.router.navigateByUrl(`/${this.store_slug}`)
    }
    else
    {
      this.router.navigateByUrl(`/`)
    }

  }

  onSubmit() {
    let formData = this.form.value;
    this.router.navigateByUrl('/search?u=' + formData.searchkey);
    if (formData.searchkey != "") {
      let EdData = {
        "searchkey": formData.searchkey,
        "store_slug": this.store_slug ? this.store_slug : environment.defaultStore
      }
      this.productservice.productSearch(EdData).subscribe(
        res => {
          this.productList = res['data'];
          console.log('Search Results', res['data']);
        }
      )

    }
    else {
      this.productList = "";
    }

  }

}
