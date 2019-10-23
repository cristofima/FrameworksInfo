import { Component, OnInit } from '@angular/core';
import {GithubService} from './shared/github.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  private repositories: any[] = [
    {name: 'Java Server Faces', repo:'javaserverfaces/mojarra', language: 'Java'},
    {name: 'Angular', repo:'angular/angular', language: 'JavaScript'},
    {name: 'Ionic', repo:'ionic-team/ionic', language: 'Java'},
    {name: 'Xamarin Forms', repo:'xamarin/Xamarin.Forms', language: 'C#'},
    {name: 'Node.js', repo:'nodejs/node', language: 'JavaScript'},
    {name: '.NET Core', repo:'dotnet/core', language: 'C#'},
    {name: 'React', repo:'facebook/reacts', language: 'JavaScript'},
    {name: 'Ruby on Rails', repo:'rails/rails', language: 'Ruby'},
    {name: 'Django', repo:'django/django', language: 'Python'},
    {name: 'Next.js', repo:'zeit/next.js', language: 'JavaScript'},
    {name: 'Spring Boot', repo:'spring-projects/spring-boot', language: 'Java'},
    {name: 'Spring Framework', repo:'spring-projects/spring-framework', language: 'Java'},
    {name: 'Mojolicious', repo:'mojolicious/mojo', language: 'Perl'},
    {name: 'Flutter', repo:'flutter/flutter', language: 'JavaScript'},
    {name: 'Aurelia', repo:'aurelia/framework', language: 'JavaScript'},
    {name: 'Yii', repo:'yiisoft/yii2', language: 'PHP'},
    {name: 'Symfony', repo:'symfony/symfony', language: 'PHP'},
  ];

  frameworks: any[] = [];

  constructor(private githubService: GithubService){

  }

  ngOnInit() {
    this.frameworks = [];
    for(const rep of this.repositories){
      this.githubService.getLastestRelease(rep.repo).subscribe((data: any) => {
        data.framework_name = rep.name;
        data.language = rep.language;
        this.frameworks.push(data);
      }, error => {

      });
    }
  }
}