import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPayPalModule } from 'ngx-paypal';
import { SharedModule } from '../shared/shared.module';
import { ShopRoutingModule } from './shop-routing.module';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
// Product Details Components
import { ProductNoSidebarComponent } from './product/sidebar/product-no-sidebar/product-no-sidebar.component';

// Product Details Widgest Components
import { ServicesComponent } from './product/widgets/services/services.component';
import { CountdownComponent } from './product/widgets/countdown/countdown.component';
import { SocialComponent } from './product/widgets/social/social.component';
import { StockInventoryComponent } from './product/widgets/stock-inventory/stock-inventory.component';
import { RelatedProductComponent } from './product/widgets/related-product/related-product.component';

// Collection Components
import { CollectionComponent } from './collection/collection.component';
import { MatExpansionModule } from '@angular/material/expansion';
// Collection Widgets
import { GridComponent } from './collection/widgets/grid/grid.component';
import { PaginationComponent } from './collection/widgets/pagination/pagination.component';
import { BrandsComponent } from './collection/widgets/brands/brands.component';
import { ColorsComponent } from './collection/widgets/colors/colors.component';
import { SizeComponent } from './collection/widgets/size/size.component';
import { PriceComponent } from './collection/widgets/price/price.component';
import { FormsModule }   from '@angular/forms';
import { CartComponent } from './cart/cart.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { CompareComponent } from './compare/compare.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { RandomOrderPipe } from '../random-order.pipe';
import { SafePipe } from '../safe.pipe';
import { TryonComponent } from './tryon/tryon.component';
import { VideoModeComponent } from './video-mode/video-mode.component';
import { ImageModeComponent } from './image-mode/image-mode.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { AllTwoDProductsComponent } from './all-2d-products/all-2d-products.component';
import { SingleStoreComponent } from '../store/single-store/single-store.component';
import { SingleStoreBannerComponent } from '../store/single-store-banner/single-store-banner.component';
import { LogoComponent } from '../home/widgets/logo/logo.component';
import { SliderComponent } from '../home/widgets/slider/slider.component';
import { AllContactProductsComponent } from './all-contact-products/all-contact-products.component';
import { ProductContactComponent } from './product/sidebar/product-contact/product-contact.component';
import { Store3DproductsComponent } from './store-3d-products/store-3d-products.component';
import { AllTwoDThreeDProductsComponent } from './all-2d-3d-products/all-2d-3d-products.component';
// Multi-Store Portal Components
import { VendorSelectorComponent } from './vendor-selector/vendor-selector.component';
@NgModule({
  declarations: [
    ProductNoSidebarComponent,
    ProductContactComponent,
    ServicesComponent,
    CountdownComponent,
    SocialComponent,
    StockInventoryComponent,
    RelatedProductComponent,
    CollectionComponent,
    GridComponent,
    PaginationComponent,
    BrandsComponent,
    ColorsComponent,
    SizeComponent,
    PriceComponent,
    CartComponent,
    WishlistComponent,
    CompareComponent,
    CheckoutComponent,
    RandomOrderPipe,
    SafePipe,
    TryonComponent,
    VideoModeComponent,
    ImageModeComponent,
    Store3DproductsComponent,
    AllTwoDProductsComponent,
    SingleStoreComponent,
    SliderComponent,
    LogoComponent,
    SingleStoreBannerComponent,
    AllContactProductsComponent,
    AllTwoDThreeDProductsComponent,
    VendorSelectorComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],

  imports: [
    CommonModule,
    NgxPayPalModule,
    NgxSliderModule,
    FormsModule,
    SharedModule,
    ShopRoutingModule,
    NgSelectModule,
    NgxPaginationModule,
    MatExpansionModule
  ],
})
export class ShopModule { }
