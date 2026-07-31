import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontSizeDirective } from 'app/shared/directives/font-size.directive';
import { ScrollToDirective } from 'app/shared/directives/scroll-to.directive';
import { AppDropdownDirective } from 'app/shared/directives/dropdown.directive';
import { DropdownAnchorDirective } from 'app/shared/directives/dropdown-anchor.directive';
import { DropdownLinkDirective } from 'app/shared/directives/dropdown-link.directive';
import { AdminSideNavToggleDirective } from './admin-side-nav-toggle.directive';
import { AdminSidenavHelperDirective, AdminSidenavTogglerDirective } from './admin-sidenav-helper.directive';
//import { AdminHighlightDirective } from './admin-highlight.directive';



const directives = [
  FontSizeDirective,
  ScrollToDirective,
  AppDropdownDirective,
  DropdownAnchorDirective,
  DropdownLinkDirective,
  AdminSideNavToggleDirective,
  AdminSidenavHelperDirective,
  AdminSidenavTogglerDirective,
  //AdminHighlightDirective
]

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: directives,
  exports: directives
})
export class AdminDirectivesModule {}
