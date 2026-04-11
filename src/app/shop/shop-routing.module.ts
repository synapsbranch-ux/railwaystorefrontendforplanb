import { SettingsComponent } from './../shared/components/settings/settings.component';
import { AuthGuard } from './../shared/services/auth-guard.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductNoSidebarComponent } from './product/sidebar/product-no-sidebar/product-no-sidebar.component';
import { CartComponent } from './cart/cart.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { CompareComponent } from './compare/compare.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { TryonComponent } from './tryon/tryon.component';
import { VideoModeComponent } from './video-mode/video-mode.component';
import { Store3DproductsComponent } from './store-3d-products/store-3d-products.component';
import { AllTwoDProductsComponent } from './all-2d-products/all-2d-products.component';
import { AllContactProductsComponent } from './all-contact-products/all-contact-products.component';
import { ProductContactComponent } from './product/sidebar/product-contact/product-contact.component';
import { AllTwoDThreeDProductsComponent } from './all-2d-3d-products/all-2d-3d-products.component';

const routes: Routes = [

  {
    path: 'product/:slug',
    component: ProductNoSidebarComponent,
  },
  {
    path: 'contact-product/:slug',
    component: ProductContactComponent,
  },
  {
    path: 'tryon',
    component: TryonComponent,
  },
  {
    path: 'live-video',
    component: VideoModeComponent,
  },
  {
    path: '2d-products/:storeSlug',
    component: AllTwoDProductsComponent
  },
  {
    path: 'all-products/:storeSlug/:catSlug',
    component: AllTwoDThreeDProductsComponent
  },
  {
    path: 'contact-products/:storeSlug',
    component: AllContactProductsComponent
  },
  {
    path: 'store-2d-products/:storeSlug/:catSlug',
    component: Store3DproductsComponent
  },
  {
    path: 'cart',
    component: CartComponent, canActivate: [AuthGuard]
  },
  {
    path: 'wishlist',
    component: WishlistComponent, canActivate: [AuthGuard]
  },
  {
    path: 'compare',
    component: CompareComponent
  },
  {
    path: 'checkout',
    component: CheckoutComponent, canActivate: [AuthGuard]
  },
  {
    path: 'settings-header',
    component: SettingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShopRoutingModule { }
