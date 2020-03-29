import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  private url = 'https://api.github.com/repos/';

  constructor(private http: HttpClient) { }

  public getLastestRelease(repository: string) {
    return this.http.get(`${this.url}${repository}/releases/latest`);
  }
}
