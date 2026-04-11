import { OrderDetailsComponent } from './account/order-details/order-details.component';
import { OrderListComponent } from './account/order-list/order-list.component';
import { EditAddressComponent } from './account/edit-address/edit-address.component';
import { EditProfileComponent } from './account/edit-profile/edit-profile.component';
import { ChangePasswordComponent } from './account/change-Password/change-Password.component';
import { AddressComponent } from './account/address/address.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
import { BlogLeftSidebarComponent } from './blog/blog-left-sidebar/blog-left-sidebar.component';
import { BlogRightSidebarComponent } from './blog/blog-right-sidebar/blog-right-sidebar.component';
import { BlogNoSidebarComponent } from './blog/blog-no-sidebar/blog-no-sidebar.component';
import { BlogDetailsComponent } from './blog/blog-details/blog-details.component';
import { GridTwoComponent } from './portfolio/grid-two/grid-two.component';
import { GridThreeComponent } from './portfolio/grid-three/grid-three.component';
import { GridFourComponent } from './portfolio/grid-four/grid-four.component';
import { MasonryGridTwoComponent } from './portfolio/masonry-grid-two/masonry-grid-two.component';
import { MasonryGridThreeComponent } from './portfolio/masonry-grid-three/masonry-grid-three.component';
import { MasonryGridFourComponent } from './portfolio/masonry-grid-four/masonry-grid-four.component';
import { MasonryFullWidthComponent } from './portfolio/masonry-full-width/masonry-full-width.component';
import { AuthGuard } from '../shared/services/auth-guard.service';
import { Room3Dstore } from './room-3dstore/room-3dstore.component';
import { RegisterVendorComponent } from './account/register-vendor/register-vendor.component';
import { ReturnsComponent } from './returns/returns.component';
import { BecomeAnAffiliateComponent } from './become-an-affiliate/become-an-affiliate.component';
import { CreateAffinityGroupComponent } from './create-affinity-group/create-affinity-group.component';
import { CreateBusinessAccountComponent } from './create-business-account/create-business-account.component';


const routes: Routes = [
  { 
    path: 'dashboard', 
    component: DashboardComponent,canActivate: [AuthGuard], 
  },
  { 
    path: 'login', 
    component: LoginComponent
  },
  { 
    path: 'register', 
    component: RegisterComponent
  },
  { 
    path: 'register-vendor', 
    component: RegisterVendorComponent
  },
  { 
    path: 'forgot-password', 
    component: ForgotPasswordComponent, 
  },
  { 
    path: 'address', 
    component: AddressComponent,canActivate: [AuthGuard], 
  },
  { 
    path: 'edit-address', 
    component: EditAddressComponent,canActivate: [AuthGuard], 
  },
  { 
    path: 'change-password', 
    component: ChangePasswordComponent,canActivate: [AuthGuard], 
  },
  { 
    path: 'edit-profile', 
    component: EditProfileComponent,canActivate: [AuthGuard], 
  },
  // { 
  //   path: 'contact', 
  //   component: ContactComponent 
  // },
  { 
    path: 'search', 
    component: SearchComponent 
  },
  { 
    path: 'typography', 
    component: TypographyComponent 
  },
  { 
    path: 'review', 
    component: ReviewComponent 
  },
  { 
    path: 'order/success', 
    component: OrderSuccessComponent,canActivate: [AuthGuard],
  },
  { 
    path: 'compare/one', 
    component: CompareOneComponent 
  },
  { 
    path: 'compare/two', 
    component: CompareTwoComponent 
  },

  { 
    path: 'lookbook', 
    component: LookbookComponent 
  },
  { 
    path: '404', 
    component: ErrorComponent 
  },
  { 
    path: 'comingsoon', 
    component: ComingSoonComponent 
  },
  { 
    path: 'faq', 
    component: FaqComponent 
  },
  { 
    path: 'blog/left/sidebar', 
    component: BlogLeftSidebarComponent 
  },
  { 
    path: 'blog/right/sidebar', 
    component: BlogRightSidebarComponent 
  },
  { 
    path: 'blog/no/sidebar', 
    component: BlogNoSidebarComponent 
  },
  { 
    path: 'blog/details', 
    component: BlogDetailsComponent 
  },
  { 
    path: 'portfolio/grid/two', 
    component: GridTwoComponent 
  },
  { 
    path: 'portfolio/grid/three', 
    component: GridThreeComponent 
  },
  { 
    path: 'portfolio/grid/four', 
    component: GridFourComponent 
  },
  { 
    path: 'portfolio/masonry/grid/two', 
    component: MasonryGridTwoComponent 
  },
  { 
    path: 'portfolio/masonry/grid/three', 
    component: MasonryGridThreeComponent 
  },
  { 
    path: 'portfolio/masonry/grid/four', 
    component: MasonryGridFourComponent 
  },
  { 
    path: 'portfolio/masonry/full-width', 
    component: MasonryFullWidthComponent 
  },
  { 
    path: '3dstore', 
    component: Room3Dstore 
  },
  { 
    path: 'order-list', 
    component: OrderListComponent, canActivate: [AuthGuard],  
  },
  { 
    path: 'view-order', 
    component: OrderDetailsComponent, canActivate: [AuthGuard],  
  },
  {
    path: 'returns',
    component: ReturnsComponent,
    pathMatch: 'full'
  },
  {
    path: 'become-an-affiliate',
    component: BecomeAnAffiliateComponent,
    pathMatch: 'full'
  },
  {
    path: 'create-affinity-group',
    component: CreateAffinityGroupComponent,
    pathMatch: 'full'
  },
  {
    path: 'create-business-account',
    component: CreateBusinessAccountComponent,
    pathMatch: 'full'
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
