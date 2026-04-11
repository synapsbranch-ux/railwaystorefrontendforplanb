import { Component, OnInit, Input } from '@angular/core';
import { ProductNew } from '../../../../shared/classes/product';
import { ProductService } from '../../../../shared/services/product.service';

@Component({
  selector: 'app-related-product',
  templateUrl: './related-product.component.html',
  styleUrls: ['./related-product.component.scss']
})
export class RelatedProductComponent implements OnInit {
  
  @Input() type: string
  productCategory:any
  public products: ProductNew[] = [];

  constructor(public productService: ProductService) { 



  }

  ngOnInit(): void {
    console.log('Related cat First',localStorage.getItem("product_catg"));
    this.productService.getproductsBySlugs(localStorage.getItem("product_slug")).subscribe(
      res =>
      {
       this.productCategory = res['data'].product_category.category_slug;
       let catdata=
       {
         'category': this.productCategory
       }
       console.log('Related cat   ',catdata);
       this.productService.getProductscat(catdata).subscribe(response => 
         {
           // this.productCategory=response['data'].product_category;
   
           console.log('Related Products ==== >>>',response)
           this.products=response['data'];
         
         }
       );
      }
    )
  }

}
