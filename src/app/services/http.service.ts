import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Todo } from '../models/todo';
import { Page } from '../models/page';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  todoApi = '/api/todos';

  constructor(private httpClient: HttpClient) {}

  createTodo(todo: Todo): Observable<Todo> {
    return this.httpClient.post<Todo>(this.todoApi, todo);
  }

  getTodosWithPagination(
    pageNum: number,
    size: number
  ): Observable<GetTodoResponse> {
    const url = `${this.todoApi}?page=${pageNum}&size=${size}`;
    return this.httpClient.get<GetTodoResponse>(url);
  }

  deleteTodo(id: number): Observable<Todo> {
    const deleteUrl = `${this.todoApi}/${id}`;
    return this.httpClient.delete<Todo>(deleteUrl);
  }

  updateTodo(todo: Todo): Observable<Todo> {
    const updateUrl = `${this.todoApi}/${todo.id}`;
    return this.httpClient.put<Todo>(updateUrl, todo);
  }

  patchTodoStatus(id: number, completedStatus: boolean): Observable<Todo> {
    const patchUrl = `${this.todoApi}/${id}`;
    return this.httpClient.patch<Todo>(patchUrl, {
      completed: completedStatus,
    });
  }
}

interface GetTodoResponse {
  _embedded: {
    todos: Todo[];
  };
  page: Page;
}
