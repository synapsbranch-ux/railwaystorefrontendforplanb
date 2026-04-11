import { UserService } from 'src/app/shared/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from './../../shared/services/order.service';
import { ProductNew } from 'src/app/shared/classes/product';
import { ProductSlider } from 'src/app/shared/data/slider';
import { ProductService } from 'src/app/shared/services/product.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.scss']
})
export class OrderSuccessComponent implements OnInit {
  public today: number = Date.now();
  public products: ProductNew[] = [];
  public ProductSliderConfig: any = ProductSlider;
  cartproducts=[];
  product_img:any;
  oderProducts=[];
  orderAddress:any
  total_order_amount: any
  discount: any
  order_status: any 
  payment_status: any
  transaction_id: any
  billing_email: any
  billing_phone: any
  billing_country: any
  billing_first_name: any
  billing_last_name: any
  billing_address1: any
  billing_address2: any
  billing_city: any
  billing_state: any
  billing_zip: any
  createdAt: any
  payment_method: any
  order_id:any;
  expected_delivery:any
  shipping_charge_value = 0;
  tax_percentage_value = 0;

  constructor(public product_service: ProductService, private orderservice: OrderService, private route: ActivatedRoute, private userservice: UserService, private router: Router) {

  }

  ngOnInit(): void {
if(this.userservice.getUserOrderid())
{
  let oData={
    order_id: this.userservice.getUserOrderid()
  }
  this.orderservice.userSingleOrderDetails(oData).subscribe
  (
    res =>
    {
      this.order_id=res['data'][0]._id;
      this.oderProducts=res['data'][0].order_details;
      this.orderAddress=res['data'][0].shipping_address_id;
      this.total_order_amount =res['data'][0].total_order_amount;
      this.discount = res['data'][0].discount ? res['data'][0].discount : 0;
      this.order_status = res['data'][0].order_status;
      this.payment_status =res['data'][0].payment_status;
      this.transaction_id =res['data'][0].transaction_id;
      this.billing_email =res['data'][0].billing_email;
      this.billing_phone =res['data'][0].billing_phone;
      this.billing_country =res['data'][0].billing_country;
      this.billing_first_name =res['data'][0].billing_first_name;
      this.billing_last_name =res['data'][0].billing_last_name;
      this.billing_address1 =res['data'][0].billing_address1;
      this.billing_address2 =res['data'][0].billing_address2;
      this.billing_city =res['data'][0].billing_city;
      this.billing_state =res['data'][0].billing_state;
      this.billing_zip =res['data'][0].billing_zip;
      this.createdAt =res['data'][0].createdAt;
      this.payment_method =res['data'][0].payment_method;
      this.expected_delivery=res['data'][0].order_delivery_date; 
      this.shipping_charge_value = res['data'][0].shipping_charge;
      this.tax_percentage_value = res['data'][0].tax_amount;
    }
  )
}
else
{
this.router.navigateByUrl('/order-list');
}

console.log('this.userservice.getUserOrderid()',this.userservice.getUserOrderid())

  }

  public get getTotal(): Observable<number> {
    return this.product_service.cartTotalAmount();
  }

}
