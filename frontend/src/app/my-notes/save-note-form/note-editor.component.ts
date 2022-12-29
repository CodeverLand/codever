import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MarkdownService } from '../../core/markdown/markdown.service';
import { KeycloakService } from 'keycloak-angular';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { combineLatest, Observable, Subject } from 'rxjs';
import { languages } from '../../shared/constants/language-options';
import { tagsValidator } from '../../shared/directive/tags-validation.directive';
import { PersonalBookmarksService } from '../../core/personal-bookmarks.service';
import { UserDataStore } from '../../core/user/userdata.store';
import { Logger } from '../../core/logger.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ErrorService } from '../../core/error/error.service';
import { UserDataService } from '../../core/user-data.service';
import { UserInfoStore } from '../../core/user/user-info.store';
import { SuggestedTagsStore } from '../../core/user/suggested-tags.store';
import { MyBookmarksStore } from '../../core/user/my-bookmarks.store';
import { AdminService } from '../../core/admin/admin.service';
import { WebpageInfoService } from '../../core/webpage-info/webpage-info.service';
import { UserDataHistoryStore } from '../../core/user/userdata.history.store';
import { UserDataReadLaterStore } from '../../core/user/userdata.readlater.store';
import { UserData } from '../../core/model/user-data';
import { Location } from '@angular/common';
import { textSizeValidator } from '../../core/validators/text-size.validator';
import { StackoverflowHelper } from '../../core/helper/stackoverflow.helper';
import { UserDataPinnedStore } from '../../core/user/userdata.pinned.store';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteActivatedEvent, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Note } from '../../core/model/note';
import { PersonalNotesService } from '../../core/personal-notes.service';
import { Snippet } from '../../core/model/snippet';

@Component({
  selector: 'app-note-editor',
  templateUrl: './note-editor.component.html'
})
export class NoteEditorComponent implements OnInit, OnDestroy, OnChanges {

  noteForm: FormGroup;
  userId = null;
  private userData: UserData;

  // chips
  selectable = true;
  removable = true;
  addOnBlur = true;

  autocompleteTagsOptionActivated = false;

  // Enter, comma, space
  separatorKeysCodes = [ENTER, COMMA, SPACE];

  languages = languages;

  autocompleteTags = [];

  tagsControl = new FormControl();

  filteredTags: Observable<any[]>;

  title; // value of "title" query parameter if present

  @Input()
  isEditMode = false;

  @ViewChild('tagInput', {static: false})
  tagInput: ElementRef;

  @Input()
  note: Note;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private keycloakService: KeycloakService,
    private userDataService: UserDataService,
    private markdownService: MarkdownService,
    private personalNotesService: PersonalNotesService,
    private myBookmarksStore: MyBookmarksStore,
    private personalBookmarksService: PersonalBookmarksService,
    private webpageInfoService: WebpageInfoService,
    private adminService: AdminService,
    private suggestedTagsStore: SuggestedTagsStore,
    private userInfoStore: UserInfoStore,
    private userDataStore: UserDataStore,
    private userdataHistoryStore: UserDataHistoryStore,
    private userDataReadLaterStore: UserDataReadLaterStore,
    private userDataPinnedStore: UserDataPinnedStore,
    private stackoverflowHelper: StackoverflowHelper,
    private _location: Location,
    private logger: Logger,
    private router: Router,
    private route: ActivatedRoute,
    private errorService: ErrorService
  ) {

    combineLatest([this.userInfoStore.getUserInfo$(), this.userDataStore.getUserData$()]).pipe(
      takeUntil(this.destroy$),
      switchMap(([userInfo, userData]) => {
          this.userId = userInfo.sub;
          this.userData = userData;
          return this.personalNotesService.getSuggestedNoteTags(this.userId)
        }
      )
    ).subscribe(tags => {
      this.autocompleteTags = tags;
      this.filteredTags = this.tagsControl.valueChanges.pipe(
        startWith(null),
        map((tag: string | null) => {
          return tag ? this.filter(tag) : this.autocompleteTags.slice();
        })
      );
    });
  }

  ngOnInit(): void {
    if (!this.isEditMode) {
      this.buildForm();
    }
  }

  buildForm(): void {
    this.noteForm = this.formBuilder.group({
      title: [this.title ? this.title : '', Validators.required],
      reference: '',
      tags: this.formBuilder.array([], [tagsValidator, Validators.required]),
      content: ['', textSizeValidator(5000, 500)],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.noteForm) {
      this.buildForm();
    }
    if (this.isEditMode && this.note) {
      this.noteForm.patchValue({
        title: this.note.title,
        content: this.note.content,
        reference: this.note.reference,
      });
      for (let i = 0; i < this.note.tags.length; i++) {
        const formTags = this.noteForm.get('tags') as FormArray;
        formTags.push(this.formBuilder.control(this.note.tags[i]));
      }

      this.tagsControl.setValue(null);
      this.tags.markAsDirty();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addTag(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our tag (avoid double adding in angular material 9 see - https://stackoverflow.com/questions/52608700/angular-material-mat-chips-autocomplete-bug-matchipinputtokenend-executed-befo)
    if ((value || '').trim() && !this.autocompleteTagsOptionActivated) {
      const tags = this.noteForm.get('tags') as FormArray;
      tags.push(this.formBuilder.control(value.trim().toLowerCase()));
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.tagsControl.setValue(null);
    this.tags.markAsDirty();
  }

  optionActivated($event: MatAutocompleteActivatedEvent) {
    if ($event.option) {
      this.autocompleteTagsOptionActivated = true;
    }
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    const tags = this.noteForm.get('tags') as FormArray;
    tags.push(this.formBuilder.control(event.option.viewValue));
    this.tagInput.nativeElement.value = '';
    this.tagsControl.setValue(null);
    this.autocompleteTagsOptionActivated = false;
  }

  removeTagByIndex(index: number): void {
    const tags = this.noteForm.get('tags') as FormArray;

    if (index >= 0) {
      tags.removeAt(index);
    }
    this.tags.markAsDirty();
  }

  filter(name: string) {
    return this.autocompleteTags.filter(tag => tag.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  saveNote(note: Note) {
    if (this.isEditMode) {
      this.updateNote(note);
    } else {
      this.createNote(note);
    }
  }

  createNote(note: Note): void {
    const now = new Date();
    note.createdAt = now;
    note.updatedAt = now;
    note.userId = this.userId;
    this.personalNotesService.createNote(this.userId, note).subscribe(
      createdNote => {
        this.navigateToSnippetDetails(createdNote, {})
      }
    );
  }

  navigateToSnippetDetails(note: Note, queryParams: Params): void {
    const link = [`./my-notes/${note._id}/details`];
    this.router.navigate(link, {
      state: {snippet: note},
      queryParams: queryParams
    });
  }

  updateNote(note: Note): void {
    const now = new Date();
    note.updatedAt = now;
    note.userId = this.note.userId;
    note._id = this.note._id;
    this.personalNotesService.updateNote(note).subscribe(
      () => {
        this.navigateToSnippetDetails(note, {})
      }
    );
  }

  navigateToNoteDetails(note: Note): void {
    const link = [`./my-notes/${note._id}/details`];
    this.router.navigate(link,
      {
        state: {note: note}
      });
  }

  get tags() {
    return <FormArray>this.noteForm.get('tags');
  }

  get content() {
    return this.noteForm.get('content');
  }

  cancelUpdate() {
    this._location.back();
    console.log('goBAck()...');
  }

  get formArrayTags() {
    return <FormArray>this.noteForm.get('tags');
  }
}


