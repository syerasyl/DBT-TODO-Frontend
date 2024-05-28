import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { Todo } from './models/todo';
import { HttpService } from './services/http.service';
import { MESSAGE } from './client.data';
import { GeneratedPage } from './models/page';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  readonly MESSAGE = MESSAGE;
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  todoForm!: FormGroup;
  todos: Todo[] = [];
  isEditMode: boolean = false;
  pageNum = 0;
  size = 5;
  generatedPages: GeneratedPage[] = [];

  constructor(
    private _snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.todoForm = this.formBuilder.group({
      id: [''],
      name: ['', Validators.required],
      description: [''],
      completed: [''],
    });
    this.getTodosWithPagination();
  }

  openSnackBar(msg: string) {
    this._snackBar.open(msg, 'X', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2000,
    });
  }

  getTodosWithPagination(page = 0) {
    this.httpService
      .getTodosWithPagination(page, this.size)
      .subscribe((data) => {
        if (data) {
          this.todos = data._embedded.todos;
          this.generateAllPages(data.page.totalPages);
          this.pageNum = data.page.number;
        }
      });
  }

  generateAllPages(totalPages: number) {
    this.generatedPages = [];
    for (let i = 0; i < totalPages; i++) {
      this.generatedPages.push({
        displayValue: i + 1,
        value: i,
      });
    }
  }

  deleteTodo(id: number) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.httpService.deleteTodo(id).subscribe((data) => {
        this.getTodosWithPagination(this.pageNum);
        this.openSnackBar(MESSAGE.DELETE);
      });
    }
  }

  updateTodo(todo: Todo) {
    this.httpService.updateTodo(todo).subscribe((data) => {
      this.getTodosWithPagination(this.pageNum);
      this.todoForm.reset();
      this.openSnackBar(MESSAGE.UPDATE);
      this.isEditMode = false;
    });
  }

  handleEdit(todo: Todo) {
    this.isEditMode = true;
    delete todo.dateCreated;
    delete todo.lastUpdated;
    this.todoForm.setValue(todo);
  }

  patchTodoStatus(id: number, completedStatus: boolean) {
    this.httpService.patchTodoStatus(id, completedStatus).subscribe((data) => {
      this.getTodosWithPagination(this.pageNum);
      this.openSnackBar(MESSAGE.UPDATE);
    });
  }

  onSubmit() {
    if (this.todoForm.invalid) {
      return;
    }
    const formValue: Todo = this.todoForm.value;
    if (this.isEditMode) {
      this.updateTodo(formValue);
    } else {
      const todoRequest: Todo = {
        name: formValue.name,
        description: formValue.description,
        completed: false,
      };
      this.httpService.createTodo(todoRequest).subscribe((data) => {
        this.generateAllPages(this.pageNum);
        this.openSnackBar(MESSAGE.CREATED);
        this.getTodosWithPagination(this.pageNum);
      });
    }
  }
}
