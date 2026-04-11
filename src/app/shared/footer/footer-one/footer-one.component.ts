import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { StoreService } from '../../services/store.service';
import { ToastrService } from 'ngx-toastr';
import { HomesliderService } from '../../services/homeslider.service';

@Component({
  selector: 'app-footer-one',
  templateUrl: './footer-one.component.html',
  styleUrls: ['./footer-one.component.scss']
})
export class FooterOneComponent implements OnInit {

  @Input() class: string = 'footer-light' // Default class 
  @Input() themeLogo: string = 'assets/images/icon/logo_small_res.png' // Default Logo
  @Input() newsletter: boolean = true; // Default True
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: Event): void {
    event.preventDefault(); // Prevent default behavior (e.g., context menu)
    event.stopPropagation(); // Stop event propagation to parent elements
  }
  vendorhome: boolean = false;
  isvendorlogoimage: boolean = false;
  public today: number = Date.now();
  store_slug: any
  menuarr=[]
  constructor(private router: Router, private route: ActivatedRoute,private homesliderservice: HomesliderService, private storeService: StoreService, private toaster: ToastrService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['slug']) {
        this.store_slug = params['slug'];
      } else {
        if (localStorage.getItem('storeslug')) {
          this.store_slug = localStorage.getItem('storeslug')
        }
      }
    });

    // if (this.store_slug) {
    //   localStorage.setItem('storeslug', this.store_slug);
    // }
    // else {
    //   this.store_slug = localStorage.getItem('storeslug')
    // }
    if (this.store_slug) {

      let storeObj = {
        store_slug: this.store_slug
      };

      // get all home slider data from API
      this.storeService.vendorstoredetails(storeObj).subscribe(
        res => {
          if (res.data[0]?.is_logo) {
            if (res.data[0]?.logo) {
              this.themeLogo = res.data[0].logo
              this.isvendorlogoimage = true;
            }
            else {
              this.themeLogo = res.data[0]?.logo_name
              this.isvendorlogoimage = false;
            }
            this.vendorhome = true;
          }
          else {
            this.themeLogo = 'assets/images/icon/logo_small_res.png';
          }

        },
        error => {
          this.toaster.error(error.error.message);
          this.router.navigateByUrl('/');
        }
      );
    }

    let storeObj = {
      store_slug: this.store_slug
    };

    // get all home slider data from API
    this.homesliderservice.getallVendorSliderData(storeObj).subscribe(
      res => {
        const lastIndex = res.data.length - 1;  // Get the last index
        if (res.data[lastIndex].banner_top_brands.length > 0) {
          localStorage.setItem('top_brands', JSON.stringify(res.data[lastIndex].banner_homepage_brands))
        }
        if (res.data[lastIndex].banner_homepage_brands.length > 0) {
          localStorage.setItem('home_brands', JSON.stringify(res.data[lastIndex].banner_homepage_brands))
        }
        if (res.data[lastIndex].banner_sub_categories.length > 0) {
          this.menuarr = res.data[lastIndex].banner_sub_categories;
          console.log('menuarr------------------------------------',this.menuarr);
        }
      },
      error => {
        this.toaster.error(error.error.message);
        this.router.navigateByUrl('/');
      }
    );
  }

  redirectcat(url: any) {
    this.router.navigate([url])
  }

}
