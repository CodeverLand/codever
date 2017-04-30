import {NgModule} from '@angular/core';
import {UserBookmarksComponent} from './personal-bookmarks-home.component';
import {AsyncUserBookmarksListComponent} from './async-list/async-personal-bookmark-list.component';
import {HttpModule} from '@angular/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PersonalBookmarksStore} from './store/PersonalBookmarksStore';
import {PersonalBookmarksService} from './personal-bookmarks.service';
import {CommonModule} from '@angular/common';
import {PersonalBookmarksRoutingModule} from './personal-bookmarks-routing.module';
import {NewPersonalBookmarkFormComponent} from './new-personal-bookmark/new-personal-bookmark-form.component';
import {PersonalBookmarkDetailComponent} from './detail/personal-bookmark-detail.component';
import {PersonalBookmarksComponent} from './personal-bookmarks.component';
import {PersonalBookmarkSearchComponent} from './search/personal-bookmark-search.component';
import {SharedModule} from '../shared/shared.module';
import {MarkdownService} from './markdown.service';

export const routerConfig = [{
  path: '',
  component: UserBookmarksComponent
}];

@NgModule({
  declarations : [
    UserBookmarksComponent,
    NewPersonalBookmarkFormComponent,
    AsyncUserBookmarksListComponent,
    PersonalBookmarkDetailComponent,
    PersonalBookmarksComponent,
    PersonalBookmarkSearchComponent
  ],
  imports: [
    SharedModule,
    CommonModule, // in the root module comes via the BrowserModule
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    PersonalBookmarksRoutingModule
  ],
  providers: [
    PersonalBookmarksStore,
    PersonalBookmarksService,
    MarkdownService
  ]
})
export class PersonalBookmarksModule {}
