import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { StoreService } from 'src/app/shared/services/store.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HomesliderService } from 'src/app/shared/services/homeslider.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-box-one',
  templateUrl: './single-store.component.html',
  styleUrls: ['./single-store.component.scss']
})
export class SingleStoreComponent implements OnInit {

  public ImageSrc: string
  public stores;
  storename: string
  storeslug: string
  storeimgUrl: any
  store_slug: any
  vendor_id: any
  store_id: any;
  StoreLists = [];
  DepartmentsList = [];
  departmentmsg: any
  roomavailablity = [];


  constructor(private storeService: StoreService, private route: ActivatedRoute, private homesliderservice: HomesliderService) {

    // in this API call first we get all store thn match particular store which we have visit then we are call for visit count API then we filter department and room availablity condtion


    this.storeService.getStoresMore.subscribe(response => {
      this.StoreLists = response['data'];
      const child = this.StoreLists.map((store_l) => {
        if (store_l.store_slug == this.store_slug) {
          this.storename = store_l.store_name;
          this.storeslug = store_l.store_slug;
          this.vendor_id = store_l.store_owner._id;
          this.store_id = store_l._id;
          this.storeImageBanner(this.vendor_id);
          return store_l.store_department;
        }
      });
      let sdata = {
        "store_id": this.store_id,
        "vendor_id": this.vendor_id
      }

      // store view count 

      this.storeService.storeviewcount(sdata).subscribe(
        res => {
        }
      )

      const filterItem = child.filter(item => item != undefined);
      if (filterItem.length > 0) {
        this.DepartmentsList = filterItem[0];

        if (!this.DepartmentsList.length) {
          this.departmentmsg = "No Department Register Here";
        }

        for (let [index, element] of this.DepartmentsList.entries()) {
          let rdata = {
            "department_id": element._id,
            "vendor_id": this.vendor_id
          }
          this.storeService.roomAvailableCheck(rdata).subscribe(
            res => {
              if (res['data'].room_name) {
                this.roomavailablity[index] = 'false';
              }
              else {
                this.roomavailablity[index] = 'true';
              }
            }
          )
        }
      }

    });

  }

  ngOnInit() {

    this.route.params.subscribe(params => {
      if (params['slug']) {
        this.store_slug = params['slug'];
      } else {
        if (localStorage.getItem('storeslug')) {
          this.store_slug = localStorage.getItem('storeslug')
        }
      }
    });



  }
  // for visit of particular store room

  stordepartment(department_slug, room_status) {
    if (room_status == 'false') {
      // window.open("https://store.ralbatech.com/store/"+this.storeslug+"/"+department_slug ,"_self");
      window.open(`${environment.storeUrl}/store/${this.storeslug}/${department_slug}`, "_self");
    }

  }


  //vendor wise banner date from API

  storeImageBanner(v_id) {
    let SData =
    {
      vendor_id: v_id
    }
    this.homesliderservice.getallVendorSliderData(SData).subscribe(
      res => {
        this.storeimgUrl = res.data[0].banner_background_image;
      }
    )
  }


}
