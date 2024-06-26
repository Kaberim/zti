import { Component } from '@angular/core';
import { Observable } from "rxjs";
import { Task } from "./task/task";
import { MatDialog } from "@angular/material/dialog";
import { AngularFirestore, AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { TaskDialogComponent, TaskDialogResult } from "./task-dialog/task-dialog.component";
import { CdkDragDrop, DragDropModule, transferArrayItem } from "@angular/cdk/drag-drop";
import { RouterOutlet } from "@angular/router";
import { MatIcon } from "@angular/material/icon";
import { MatToolbar } from "@angular/material/toolbar";
import { TaskComponent } from "./task/task.component";
import { AsyncPipe, NgForOf, NgIf } from "@angular/common";
import { MatCard } from "@angular/material/card";
import { MatButton } from "@angular/material/button";
import { SocialLoginModule } from "angularx-social-login";
import { CharacterCardComponent } from "../character-card/character-card.component";
import { FirebaseService } from "../services/firebase.service";
import { Character } from "../data/character";

@Component({
  selector: 'app-kb',
  standalone: true,
  imports: [
    RouterOutlet,
    MatIcon,
    MatToolbar,
    TaskComponent,
    NgForOf,
    MatCard,
    NgIf,
    DragDropModule,
    MatButton,
    AngularFirestoreModule,
    AsyncPipe,
    SocialLoginModule,
    CharacterCardComponent
  ],
  templateUrl: './kb.component.html',
  styleUrl: './kb.component.css'
})
export class KbComponent {
  todo = this.store.collection('todo').valueChanges({idField: 'id'}) as Observable<Task[]>;
  inProgress = this.store.collection('inProgress').valueChanges({idField: 'id'}) as Observable<Task[]>;
  done = this.store.collection('done').valueChanges({idField: 'id'}) as Observable<Task[]>;

  characters = this.fbStore.getCollection('characters').valueChanges({idField: 'id'}) as Observable<Character[]>

  title = 'kanban-fire';

  constructor(private dialog: MatDialog, private store: AngularFirestore, private fbStore:FirebaseService) {
    this.characters.subscribe(value => console.log(value))
    // this.artifactSets.forEach((item) => {
    //   this.store.firestore.runTransaction(() => {
    //     const promise = Promise.all([
    //       this.store.collection('relicSets').add(item),
    //     ]);
    //     return promise;
    //   });
    // })
  }

  editTask(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskDialogResult | undefined) => {
      if (!result) {
        return;
      }
      if (result.delete) {
        this.store.collection(list).doc(task.id).delete();
      } else {
        this.store.collection(list).doc(task.id).update(task);
      }
    });
  }

  drop(event: CdkDragDrop<Task[] | null>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    const item = event.previousContainer.data?.[event.previousIndex];
    this.store.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.store.collection(event.previousContainer.id).doc(item?.id).delete(),
        this.store.collection(event.container.id).add(item),
      ]);
      return promise;
    });
    event.previousContainer.data && event.container.data && transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) {
          return;
        }
        this.store.collection('todo').add(result.task)
      });
  }
}
