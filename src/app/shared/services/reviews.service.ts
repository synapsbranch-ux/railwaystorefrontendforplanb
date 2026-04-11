import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SecurityService } from 'src/security.service';

@Injectable({ providedIn: 'root' })
export class ReviewsService {

    constructor(private securityService: SecurityService) {}

    getVendorReviews(vendorId: string, productId?: string): Observable<any> {
        let url = `${environment.baseUrl}reviews/vendor/${vendorId}`;
        if (productId) url += `?product_id=${productId}`;
        return this.securityService.signedRequest('GET', url);
    }

    createReview(review: {
        vendor_id: string;
        product_id?: string;
        reviewer_email?: string;
        comment_text: string;
    }): Observable<any> {
        const url = `${environment.baseUrl}reviews/create`;
        return this.securityService.signedRequest('POST', url, review);
    }
}
