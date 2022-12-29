import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserInfoStore } from '../../core/user/user-info.store';
import { PersonalNotesService } from '../../core/personal-notes.service';
import { Note } from '../../core/model/note';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-new-personal-bookmark-form',
  templateUrl: './update-personal-note.component.html'
})
export class UpdatePersonalNoteComponent implements OnInit {

  note$: Observable<Note>;
  noteId: string;
  userId: string;

  constructor(private route: ActivatedRoute,
              private personalNotesService: PersonalNotesService,
              private userInfoStore: UserInfoStore) {

  }

  ngOnInit(): void {
    this.userInfoStore.getUserInfo$().pipe(tap(userInfo => {
      this.userId = userInfo.sub;
      if (window.history.state.note) {
        this.note$ = of(window.history.state.note)
      } else {
        this.note$ = this.personalNotesService.getPersonalNoteById(this.userId, this.noteId)
      }
    }));
  }
}


