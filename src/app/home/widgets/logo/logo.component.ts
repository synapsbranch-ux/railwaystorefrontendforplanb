import { Component, OnInit, Input } from '@angular/core';
import { LogoSlider } from '../../../shared/data/slider';
import { ActivatedRoute, Router } from '@angular/router';
import { CriptoService } from 'src/app/shared/services/cripto.service';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {

  @Input() brands: any[] = [];
  store_slug: any

  constructor(private route: ActivatedRoute, private router: Router, private criptoService: CriptoService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.store_slug = params['slug'];
    });
    if (!localStorage.getItem('storeslug')) {
      localStorage.setItem('storeslug', this.store_slug);
    }
    if (!this.store_slug) {
      this.store_slug = localStorage.getItem('storeslug')
    }
  }

  public LogoSliderConfig: any = LogoSlider;

  viewResults(keyname: any) {
    let cat_id = '';
    let tag_id = '';
    // Encrypt the brand key
    const encryptedBrand = this.criptoService.encryptParam(keyname);

    // Navigate with the encrypted brand in the query parameters
    this.router.navigate([`/all-products/${this.store_slug}/all`], {
      queryParams: {
        brand: encryptedBrand,  // Encrypted brand key
        cat: this.criptoService.encryptParam(cat_id),  // Encrypt the current category ID
        tag: this.criptoService.encryptParam(tag_id)   // Encrypt the current tag ID
      }
    });
  }


}
