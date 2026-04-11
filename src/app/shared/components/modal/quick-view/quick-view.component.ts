import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, Input,
  Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Product } from "../../../classes/product";
import { ProductService } from '../../../../shared/services/product.service';

@Component({
  selector: 'app-quick-view',
  templateUrl: './quick-view.component.html',
  styleUrls: ['./quick-view.component.scss']
})
export class QuickViewComponent implements OnInit, OnDestroy  {

  @Input() product: Product;
  @Input() currency: any;  
  @ViewChild("quickView", { static: false }) QuickView: TemplateRef<any>;

  public closeResult: string;
  public ImageSrc: string;
  public counter: number = 1;
  public modalOpen: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private router: Router, private modalService: NgbModal,
    public productService: ProductService) { }

  ngOnInit(): void {
  }

  openModal() {
    this.modalOpen = true;
    if (isPlatformBrowser(this.platformId)) { // For SSR 
      this.modalService.open(this.QuickView, { 
        size: 'lg',
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        windowClass: 'Quickview' 
      }).result.then((result) => {
        `Result ${result}`
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }


  // Increament
  increment() {
    this.counter++ ;
  }

  // Decrement
  decrement() {
    if (this.counter > 1) this.counter-- ;
  }

  // Add to cart
  async addToCart(product: any) {
    product.quantity = this.counter || 1;
    const status = await this.productService.addToCart(product,1,false);
    if(status)
      this.router.navigate(['/shop/cart']);
  }

  ngOnDestroy() {
    if(this.modalOpen){
      this.modalService.dismissAll();
    }
  }

}
