import { Component, OnInit } from '@angular/core';
import { DependencyInfoService } from './shared/dependency-info.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private repositories: any[] = [
    { name: 'Java Server Faces', repo: 'javaserverfaces/mojarra', language: 'Java' },
    { name: 'Angular', repo: 'angular/angular', language: 'JavaScript', nameDependency: '@angular/core' },
    { name: 'Ionic', repo: 'ionic-team/ionic', language: 'JavaScript', nameDependency: '@ionic/core' },
    { name: 'Xamarin Forms', repo: 'xamarin/Xamarin.Forms', language: 'C#', nameDependency: 'Xamarin.Forms' },
    { name: 'Node.js', repo: 'nodejs/node', language: 'JavaScript', nameDependency: 'node' },
    { name: '.NET Core', repo: 'dotnet/core', language: 'C#', nameDependency: 'Microsoft.NETCore.Targets' },
    { name: 'React', repo: 'facebook/reacts', language: 'JavaScript', nameDependency: 'react' },
    { name: 'Ruby on Rails', repo: 'rails/rails', language: 'Ruby' },
    { name: 'Django', repo: 'django/django', language: 'Python', nameDependency: 'Django' },
    { name: 'Flask', repo: 'pallets/flask', language: 'Python', nameDependency: 'Flask' },
    { name: 'Pyramid', repo: 'Pylons/pyramid', language: 'Python', nameDependency: 'Pyramid' },
    { name: 'Web2py ', repo: 'web2py/web2py', language: 'Python', nameDependency: 'Web2py' },
    { name: 'Next.js', repo: 'zeit/next.js', language: 'JavaScript', nameDependency: 'next.js' },
    { name: 'Spring Boot', repo: 'spring-projects/spring-boot', language: 'Java' },
    { name: 'Spring Framework', repo: 'spring-projects/spring-framework', language: 'Java' },
    { name: 'Mojolicious', repo: 'mojolicious/mojo', language: 'Perl' },
    { name: 'Flutter', repo: 'flutter/flutter', language: 'JavaScript' },
    { name: 'Aurelia', repo: 'aurelia/framework', language: 'JavaScript', nameDependency: 'aurelia' },
    { name: 'Yii 2', repo: 'yiisoft/yii2', language: 'PHP', nameDependency: 'yiisoft/yii2' },
    { name: 'Symfony', repo: 'symfony/symfony', language: 'PHP', nameDependency: 'symfony/symfony' },
    { name: 'Laravel', repo: 'laravel/laravel', language: 'PHP', nameDependency: 'laravel/framework' },
  ];

  frameworks: any[] = [];

  constructor(private dependencyInfoService: DependencyInfoService) { }

  ngOnInit() {
    this.frameworks = [];
    for (const rep of this.repositories) {
      if (rep.nameDependency) {
        if (rep.language === 'JavaScript') {
          this.dependencyInfoService.getNPMInfo(rep.nameDependency).subscribe((data: any) => {
            const lastestVersion = data['dist-tags'].latest;

            let dataFramework = {
              framework_name: rep.name,
              tag_name: lastestVersion,
              language: rep.language,
              published_at: data['time'][lastestVersion]
            }

            this.frameworks.push(dataFramework);
          });
        } else if (rep.language === 'Python') {
          this.dependencyInfoService.getPypiInfo(rep.nameDependency).subscribe((resp: any) => {
            let dataFramework = {
              framework_name: rep.name,
              tag_name: resp.info.version,
              language: rep.language,
              published_at: resp.releases[resp.info.version][0].upload_time
            }

            this.frameworks.push(dataFramework);
          });
        } else if (rep.language === 'C#') {
          this.dependencyInfoService.getNugetInfo(rep.nameDependency).subscribe((resp: any) => {
            let dataFramework = {
              framework_name: rep.name,
              tag_name: resp.data[0].version,
              language: rep.language,
              published_at: null
            }

            const urlJson = resp.data[0].versions[resp.data[0].versions.length - 1]['@id'];

            this.dependencyInfoService.getNugetExtraInfo(urlJson).subscribe((result: any) => {
              dataFramework.published_at = result.published;
              this.frameworks.push(dataFramework);
            }, () => {
              this.frameworks.push(dataFramework);
            });
          });
        } else if (rep.language === 'PHP') {
          this.dependencyInfoService.getPackagistInfo(rep.nameDependency).subscribe((resp: any) => {
            let versionsInfo = resp.packages[rep.nameDependency];
            let versionKeys = Object.keys(versionsInfo);
            let lastVersionInfo = versionsInfo[versionKeys[versionKeys.length - 1]];

            let dataFramework = {
              framework_name: rep.name,
              tag_name: lastVersionInfo.version_normalized,
              language: rep.language,
              published_at: lastVersionInfo.time
            }

            this.frameworks.push(dataFramework);
          });
        }
      }
    }
  }
}