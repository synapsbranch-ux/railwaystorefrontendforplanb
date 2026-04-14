import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { ReviewsService } from '../../shared/services/reviews.service';

@Component({
    selector: 'app-vendor-selector',
    templateUrl: './vendor-selector.component.html',
    styleUrls: ['./vendor-selector.component.scss']
})
export class VendorSelectorComponent implements OnInit {
    @Input() productId: string;
    @Output() vendorSelected = new EventEmitter<{
        vendorId: string;
        vendorPrice: number;
        storeName: string;
    }>();

    fulfillers: any[] = [];
    isLoading = false;
    selectedVendorId: string | null = null;
    showReviews = false;
    reviewsVendorId: string | null = null;
    reviews: any[] = [];

    constructor(
        private productService: ProductService,
        private reviewsService: ReviewsService
    ) {}

    ngOnInit() {
        this.loadFulfillers();
    }

    loadFulfillers() {
        this.isLoading = true;
        this.productService.getProductFulfillers(this.productId).subscribe(
            res => {
                this.fulfillers = res.data?.fulfillers || [];
                this.isLoading = false;
            },
            err => { this.isLoading = false; }
        );
    }

    openReviews(vendorId: string) {
        this.reviewsVendorId = vendorId;
        this.showReviews = true;
        this.reviewsService.getVendorReviews(vendorId, this.productId).subscribe(
            res => { this.reviews = res.data?.reviews || []; }
        );
    }

    closeReviews() {
        this.showReviews = false;
        this.reviewsVendorId = null;
        this.reviews = [];
    }

    selectVendor(fulfiller: any) {
        this.selectedVendorId = fulfiller.vendor_id._id;
        this.vendorSelected.emit({
            vendorId: fulfiller.vendor_id._id,
            vendorPrice: fulfiller.vendor_sales_price,
            storeName: fulfiller.store_name || fulfiller.vendor_id.name
        });
    }

    onReviewAdded(review: any) {
        if (!review) {
            return;
        }
        this.reviews.unshift(review);
    }
}
