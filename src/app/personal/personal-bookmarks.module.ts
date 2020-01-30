import { NgModule } from '@angular/core';
import { PersonalBookmarksRoutingModule } from './personal-bookmarks-routing.module';
import { PersonalBookmarksComponent } from './personal-bookmarks.component';
import { SharedModule } from '../shared/shared.module';
import { MarkdownService } from './markdown.service';
import { AuthGuard } from './auth-guard.service';
import { RouterModule } from '@angular/router';
import { UpdatePersonalBookmarkComponent } from './update/update-personal-bookmark.component';
import { CreatePersonalBookmarkComponent } from './create/create-personal-bookmark.component';
import {
  MatAutocompleteModule,
  MatChipsModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatTabsModule
} from '@angular/material';
import { OverlayModule } from '@angular/cdk/overlay';
import { PublicBookmarkPresentDialogComponent } from './create/public-bookmark-present-dialog/public-bookmark-present-dialog.component';


@NgModule({
  declarations : [
    CreatePersonalBookmarkComponent,
    UpdatePersonalBookmarkComponent,
    PersonalBookmarksComponent,
    PublicBookmarkPresentDialogComponent
  ],
  imports: [
    SharedModule,
    RouterModule,
    OverlayModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatDialogModule,
    PersonalBookmarksRoutingModule
  ],
  providers: [
    MarkdownService,
    AuthGuard
  ],
  entryComponents: [
    PublicBookmarkPresentDialogComponent
  ]
})
export class PersonalBookmarksModule {}
