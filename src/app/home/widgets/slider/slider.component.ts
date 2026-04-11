import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from 'src/app/shared/services/store.service';
import { Component, OnInit, Input } from '@angular/core';
import { HomeSlider } from '../../../shared/data/slider';
import { environment } from 'src/environments/environment';
import { ProductService } from 'src/app/shared/services/product.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit {

  @Input() sliders: any[];
  @Input() class: string;
  @Input() textClass: string;
  @Input() category: string;
  @Input() buttonText: string;
  @Input() buttonClass: string;


  public ImageSrc: string

  public stores;

  storename: string
  storeslug: string
  storeimgUrl: any
  store_slug: any
  vendor_id: any
  store_id: any;
  storeVisiblity: boolean = false;
  StoreLists = [];

  DepartmentsList = [];

  departmentmsg: any

  roomavailablity = [];
  envstore: any
  isVisable2Dstore: boolean = false;
  constructor(public productService: ProductService, private storeService: StoreService, private router: Router, private route: ActivatedRoute, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.envstore = environment.storeUrl;
    this.route.params.subscribe(params => {
      if (params['slug']) {
        this.store_slug = params['slug'];
      } else {
        if (localStorage.getItem('storeslug')) {
          this.store_slug = localStorage.getItem('storeslug')
        }
      }
    });

    // let catdata =
    // {
    //   'store_slug': this.store_slug,
    //   "page": 1,
    //   "limit": 10
    // }
    // this.productService.get2DProductList(catdata).subscribe(
    //   res => {
    //     if (res['data'].length > 0) {
    //       this.isVisable2Dstore = true;
    //     }
    //     else {
    //       this.isVisable2Dstore = false;
    //     }
    //   },
    //   error => {
    //     // .... HANDLE ERROR HERE 
    //     this.toastr.error(error.error.message)
    //   });
    let storedata =
    {
      'store_slug': this.store_slug,
    }
    this.productService.getStoreDetails(storedata).subscribe(
      res => {
        if (res['data'].length > 0) {
          this.storeVisiblity = res['data'][0].store_jpg_file ? true : false;
        }
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }

  public HomeSliderConfig: any = HomeSlider;

  vandorbannerClick(catDetails: any) {
    this.router.navigateByUrl(`/store-2d-products/${this.store_slug}/${catDetails.category_slug}`)
  }

  redirectStore() {
    let url = `https://store.ralbatech.com/${this.store_slug}/1`
    window.open(url, '_blank');
  }
  redirec2dtStore() {
    this.router.navigateByUrl(`2d-products/${this.store_slug}`)

  }

}
