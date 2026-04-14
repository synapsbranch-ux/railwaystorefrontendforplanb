import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ReviewsService } from '../../shared/services/reviews.service';

@Component({
    selector: 'app-add-review',
    templateUrl: './add-review.component.html'
})
export class AddReviewComponent {
    @Input() vendorId: string;
    @Input() productId: string;
    @Output() reviewAdded = new EventEmitter<any>();

    form = { reviewer_email: '', comment_text: '' };
    isSubmitting = false;

    constructor(
        private reviewsService: ReviewsService,
        private toastr: ToastrService
    ) {}

    submit() {
        const comment = (this.form.comment_text || '').trim();
        if (!comment || !this.vendorId) {
            return;
        }

        this.isSubmitting = true;
        this.reviewsService.createReview({
            vendor_id: this.vendorId,
            product_id: this.productId,
            reviewer_email: this.form.reviewer_email,
            comment_text: comment
        }).subscribe(
            (res) => {
                this.reviewAdded.emit(res.data);
                this.form = { reviewer_email: '', comment_text: '' };
                this.isSubmitting = false;
                this.toastr.success('Review submitted');
            },
            (err) => {
                this.isSubmitting = false;
                this.toastr.error(err?.error?.message || 'Unable to submit review');
            }
        );
    }
}
