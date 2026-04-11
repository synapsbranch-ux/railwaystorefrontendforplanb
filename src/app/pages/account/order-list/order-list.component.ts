import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { json } from 'express';
import { ProductService } from 'src/app/shared/services/product.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {

  public openDashboard: boolean = false;
  userName: string = "";
  userEmail: string = "";
  userPhone: string = "";
  userData: JSON;
  orderList = [];
  orderliststatus: boolean = true;
  ongoingOrders = [];
  deliveredOrders = [];
  filterongoingOrders = []

  returnEligibilityMap: { [orderId: string]: boolean } = {};
  showReturnModal = false;
  selectedOrderId: string | null = null;
  returnReason = '';
  returnAddress = '';
  isSubmitted = false;

  constructor(private router: Router, private userservice: UserService, public productService: ProductService, private toaster: ToastrService) {

  }


  ngOnInit(): void {
    if (localStorage.getItem('user_')) {
      this.userservice.getUserDetails().subscribe(
        res => {
          if (res['error'] != 1) {
            this.userName = res['data'][0].name;
            this.userEmail = res['data'][0].email;
            this.userPhone = res['data'][0].phone;
          }
        }
      )


      this.getAllOrderList();


    }


  }

  getAllOrderList() {
          this.userservice.getAllOrderList().subscribe(
        res => {
          this.orderList = res['data'];
          // Filter orders based on their status
          this.ongoingOrders = this.orderList.filter(order => order.order_status !== 'delivered' && order.order_status !== 'return requested' && order.order_status !== 'return approved' && order.order_status !== 'return in transit' && order.order_status !== 'return received' && order.order_status !== 'refunded');
          this.deliveredOrders = this.orderList.filter(order => order.order_status === 'delivered' || order.order_status === 'return requested' || order.order_status === 'return approved' || order.order_status === 'return in transit' || order.order_status === 'return received' || order.order_status === 'refunded');

          // Check return eligibility ONLY for delivered orders
          this.deliveredOrders.filter(order => order.order_status === 'delivered').forEach(order => {
            this.checkReturnEligibility(order._id);
          });

          this.filterOrders();
          if (this.orderList.length < 1) {
            this.orderliststatus = false;
          }
        }

      )
  }



  filterOrders() {
    this.filterongoingOrders = this.ongoingOrders.filter(order => {
      // Always include approved orders
      if (order.payment_status === 'APPROVED' || order.payment_status === 'COMPLETED') {
        return true;
      }

      // For non-approved orders, only include if within 2 days of creation
      return (order.payment_status !== 'APPROVED' && order.payment_status !== 'COMPLETED') && this.isWithinTwoDays(order.createdAt);

    })
  }

  isWithinTwoDays(orderDate: string): boolean {
    const currentDate = moment();  // Local time
    const createdAt = moment.utc(orderDate);  // Parse order date as UTC
    const differenceInDays = currentDate.diff(createdAt, 'days');

    return differenceInDays <= 1;  // Only show orders within 1 days
  }

  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }
  viewOrder(orderId: any) {
    this.userservice.setUserOrderid(orderId);
    this.router.navigateByUrl('/view-order')
  }

  logout() {
    this.userservice.logout();
  }


  checkReturnEligibility(orderId: string) {
    this.productService.checkReturnEligibility(orderId).subscribe({
      next: (res) => {
        const response = res as { eligible: boolean };
        this.returnEligibilityMap[orderId] = response.eligible;
      },
      error: () => {
        this.returnEligibilityMap[orderId] = false;
      }
    });
  }

  isReturnEligible(orderId: string): boolean {
    return this.returnEligibilityMap[orderId] === true;
  }

  openReturnModal(orderId: string) {
    this.selectedOrderId = orderId;
    this.returnReason = '';
    this.returnAddress = 'RDM Enterprise Group LLC, 32 NEWBURY ST, PROVIDENCE, RI 02904-1119, United States';
    this.showReturnModal = true;
  }

  closeReturnModal() {
    this.selectedOrderId = null;
    this.showReturnModal = false;
    this.isSubmitted = false;
  }

  onSubmitReturn() {
    this.isSubmitted = true;

    if (!this.returnReason) {
      return; // stop submission
    }

    const data = {
      order_id: this.selectedOrderId,
      reason: this.returnReason,
      address: this.returnAddress
    };
    this.productService.submitReturn(data).subscribe({
      next: (res) => {
        this.isSubmitted = false;
        this.selectedOrderId = null;
        this.showReturnModal = false;
        this.toaster.success('Return have been initiated');
        this.getAllOrderList();
      },
      error: () => {
        
      }
    });
  }




}
