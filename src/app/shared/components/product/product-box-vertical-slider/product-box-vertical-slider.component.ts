import { Component, OnInit, Input } from '@angular/core';
import { NewProductSlider } from '../../../data/slider';
import { ProductNew } from '../../../classes/product';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-product-box-vertical-slider',
  templateUrl: './product-box-vertical-slider.component.html',
  styleUrls: ['./product-box-vertical-slider.component.scss']
})
export class ProductBoxVerticalSliderComponent implements OnInit {

  @Input() title: string = 'New Product'; // Default
  @Input() type: string = 'apparels'; // Default Fashion

  public products : ProductNew[] = [];

  public NewProductSliderConfig: any = NewProductSlider;

  constructor(public productService: ProductService) { 
    this.productService.getProducts.subscribe(response => 
      {

       
      }
    );
  }

  ngOnInit(): void {
  }

}
