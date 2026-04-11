import { OrderDetailsComponent } from './account/order-details/order-details.component';
import { OrderListComponent } from './account/order-list/order-list.component';
import { EditAddressComponent } from './account/edit-address/edit-address.component';
import { EditProfileComponent } from './account/edit-profile/edit-profile.component';
import { ChangePasswordComponent } from './account/change-Password/change-Password.component';
import { AddressComponent } from './account/address/address.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { SharedModule } from '../shared/shared.module';
import { PagesRoutingModule } from './pages-routing.module';
import { NgOtpInputModule } from  'ng-otp-input';

// Pages Components
import { DashboardComponent } from './account/dashboard/dashboard.component';
import { LoginComponent } from './account/login/login.component';
import { RegisterComponent } from './account/register/register.component';
import { ForgotPasswordComponent } from './account/forgot-password/forgot-password.component';
import { ProfileComponent } from './account/profile/profile.component';

import { ContactComponent } from './account/contact/contact.component';
import { SearchComponent } from './search/search.component';
import { TypographyComponent } from './typography/typography.component';
import { ReviewComponent } from './review/review.component';
import { OrderSuccessComponent } from './order-success/order-success.component';
import { CompareOneComponent } from './compare/compare-one/compare-one.component';
import { CompareTwoComponent } from './compare/compare-two/compare-two.component';
import { LookbookComponent } from './lookbook/lookbook.component';
import { ErrorComponent } from './error/error.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { FaqComponent } from './faq/faq.component';
// Blog Components
import { BlogLeftSidebarComponent } from './blog/blog-left-sidebar/blog-left-sidebar.component';
import { BlogRightSidebarComponent } from './blog/blog-right-sidebar/blog-right-sidebar.component';
import { BlogNoSidebarComponent } from './blog/blog-no-sidebar/blog-no-sidebar.component';
import { BlogDetailsComponent } from './blog/blog-details/blog-details.component';
// Portfolio Components
import { GridTwoComponent } from './portfolio/grid-two/grid-two.component';
import { GridThreeComponent } from './portfolio/grid-three/grid-three.component';
import { GridFourComponent } from './portfolio/grid-four/grid-four.component';
import { MasonryGridTwoComponent } from './portfolio/masonry-grid-two/masonry-grid-two.component';
import { MasonryGridThreeComponent } from './portfolio/masonry-grid-three/masonry-grid-three.component';
import { MasonryGridFourComponent } from './portfolio/masonry-grid-four/masonry-grid-four.component';
import { MasonryFullWidthComponent } from './portfolio/masonry-full-width/masonry-full-width.component';
import { Room3Dstore } from './room-3dstore/room-3dstore.component';
import { RegisterVendorComponent } from './account/register-vendor/register-vendor.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReturnsComponent } from './returns/returns.component';
import { BecomeAnAffiliateComponent } from './become-an-affiliate/become-an-affiliate.component';
import { CreateAffinityGroupComponent } from './create-affinity-group/create-affinity-group.component';
import { CreateBusinessAccountComponent } from './create-business-account/create-business-account.component';

@NgModule({
  declarations: [
    DashboardComponent,
    LoginComponent,
    RegisterComponent,
    RegisterVendorComponent,
    ForgotPasswordComponent,
    ContactComponent,
    SearchComponent,
    TypographyComponent,
    ReviewComponent,
    OrderSuccessComponent,
    CompareOneComponent,
    CompareTwoComponent,
    LookbookComponent,
    ErrorComponent,
    ComingSoonComponent,
    FaqComponent,
    BlogLeftSidebarComponent,
    BlogRightSidebarComponent,
    BlogNoSidebarComponent,
    BlogDetailsComponent,
    GridTwoComponent,
    GridThreeComponent,
    GridFourComponent,
    MasonryGridTwoComponent,
    MasonryGridThreeComponent,
    MasonryGridFourComponent,
    MasonryFullWidthComponent,
    Room3Dstore,
    AddressComponent,
    ChangePasswordComponent,
    EditProfileComponent,
    EditAddressComponent,
    OrderDetailsComponent,
    OrderListComponent,
    ReturnsComponent,
    BecomeAnAffiliateComponent,
    CreateAffinityGroupComponent,
    CreateBusinessAccountComponent
  ],
  imports: [
    CommonModule,
    GalleryModule,
    NgbModule,
    SharedModule,
    PagesRoutingModule,
    NgOtpInputModule,
    MatDialogModule,
    MatExpansionModule
  ],
  exports: [OrderSuccessComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PagesModule { }
