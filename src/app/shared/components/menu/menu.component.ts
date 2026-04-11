import { Component, OnInit } from '@angular/core';
import { NavService, Menu } from '../../services/nav.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HomesliderService } from '../../services/homeslider.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  public menuItems: Menu[];
  store_slug: any;
  vrLink: any;
  storeGlb: boolean = false;
  constructor(private router: Router, public navServices: NavService, private route: ActivatedRoute, private homesliderservice: HomesliderService, private toaster: ToastrService) {
    /* this.navServices.items.subscribe(menuItems => this.menuItems = menuItems );
     this.router.events.subscribe((event) => {
       this.navServices.mainMenuToggle = false;
     }); */
  }

  ngOnInit(): void {
    if (localStorage.getItem('store3diamge')) {
      this.storeGlb = true;
    }
    let menuarr = [];

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
      if (!localStorage.getItem('storeslug')) {
        localStorage.setItem('storeslug', this.store_slug);
      }

      let storeObj = {
        store_slug: this.store_slug
      };

      // get all home slider data from API
      this.homesliderservice.getallVendorSliderData(storeObj).subscribe(
        res => {
          const lastIndex = res.data.length - 1;  // Get the last index

          if (res.data[lastIndex].banner_top_brands.length > 0) {
            localStorage.setItem('top_brands', JSON.stringify(res.data[lastIndex].banner_top_brands))
          }
          if (res.data[lastIndex].banner_homepage_brands.length > 0) {
            localStorage.setItem('home_brands', JSON.stringify(res.data[lastIndex].banner_homepage_brands))
          }

          if (res.data[lastIndex].banner_sub_categories.length > 0) {
            menuarr = res.data[lastIndex].banner_sub_categories;
            this.menuItems = menuarr.map(items => {
              let menuChild;

              // Check if the slug is 'contact' to modify the path
              let menuPath = items.category_slug === 'contact'
                ? `/contact-products/${this.store_slug}`
                : `/all-products/${this.store_slug}/${items.category_slug}`;

              return {
                title: items.category_name,
                path: menuPath,
                type: 'link',
                active: false,
                children: menuChild
              };
            });
          }
        },
        error => {
          this.toaster.error(error.error.message);
          this.router.navigateByUrl('/');
        }
      );
    } else {
      if (localStorage.getItem('storeslug')) {
        this.store_slug = localStorage.getItem('storeslug');

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
              menuarr = res.data[lastIndex].banner_sub_categories;
              this.menuItems = menuarr.map(items => {
                let menuChild;

                // Check if the slug is 'contact' to modify the path
                let menuPath = items.category_slug === 'contact'
                  ? `/contact-products/${this.store_slug}`
                  : `/all-products/${this.store_slug}/${items.category_slug}`;

                return {
                  title: items.category_name,
                  path: menuPath,
                  type: 'link',
                  active: false,
                  children: menuChild
                };
              });
            }
          },
          error => {
            this.toaster.error(error.error.message);
            this.router.navigateByUrl('/');
          }
        );
      }
    }

    this.vrLink = `${environment.storeUrl}/${this.store_slug}/1`
  }

  mainMenuToggle(): void {

    this.navServices.mainMenuToggle = !this.navServices.mainMenuToggle;
  }

  // Click Toggle menu (Mobile)
  toggletNavActive(item) {
    item.active = !item.active;
  }

}
