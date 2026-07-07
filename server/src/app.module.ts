import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import configuration from "./config/configuration";
import { DatabaseModule } from "./database/database.module";
import { AuditInterceptor } from "./common/interceptors/audit.interceptor";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { PermissionsGuard } from "./common/guards/permissions.guard";
import { AuditModule } from "./modules/audit/audit.module";
import { IdentityModule } from "./modules/identity/identity.module";
import { RbacModule } from "./modules/rbac/rbac.module";
import { CatalogueModule } from "./modules/catalogue/catalogue.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { PricingModule } from "./modules/pricing/pricing.module";
import { CartModule } from "./modules/cart/cart.module";
import { ShippingModule } from "./modules/shipping/shipping.module";
import { TaxModule } from "./modules/tax/tax.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { CheckoutModule } from "./modules/checkout/checkout.module";
import { LoyaltyModule } from "./modules/loyalty/loyalty.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { ComplianceModule } from "./modules/compliance/compliance.module";
import { CmsModule } from "./modules/cms/cms.module";
import { SearchModule } from "./modules/search/search.module";
import { StoreLocatorModule } from "./modules/store-locator/store-locator.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { MediaModule } from "./modules/media/media.module";
import { ReportingModule } from "./modules/reporting/reporting.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { IntegrationsModule } from "./modules/integrations/integrations.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    DatabaseModule,
    // Foundation & governance
    AuditModule,
    IdentityModule,
    RbacModule,
    ComplianceModule,
    SettingsModule,
    // Catalogue & merchandising
    CatalogueModule,
    InventoryModule,
    PricingModule,
    ReviewsModule,
    SearchModule,
    // Commerce
    CartModule,
    ShippingModule,
    TaxModule,
    PaymentsModule,
    CheckoutModule,
    LoyaltyModule,
    // Content & operations
    CmsModule,
    StoreLocatorModule,
    NotificationsModule,
    MediaModule,
    ReportingModule,
    IntegrationsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
