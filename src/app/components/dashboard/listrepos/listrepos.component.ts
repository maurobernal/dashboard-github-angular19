import { Component, OnInit } from '@angular/core';
import { GithubPulls } from '@interfaces/githubpulls';
import { GithubRepos, ListPullsEntity } from '@interfaces/githubrepos';
import { configGitHub } from 'enviroments.secrets';
import { Observable } from 'rxjs';
import { GithubService } from 'src/app/services/github.service';
import { ReposComponent } from './repos/repos.component';

@Component({
  selector: 'app-listrepos',
  templateUrl: './listrepos.component.html',
imports: [ReposComponent],
})
export class ListreposComponent implements OnInit {
  constructor(private readonly githubService : GithubService) {
    this.listPullsEntity = { Pulls: [] };
  }

  repoUser$ :Observable<GithubRepos[]> = this.githubService.getRepo(`users/${configGitHub.user}/repos`);

  repoOrg$ :Observable<GithubRepos[]> = this.githubService.getRepo(`orgs/${configGitHub.org}/repos`);

  listRepoUser: GithubRepos[] = [];

  listRepoOrg: GithubRepos[] = [];

  listRepoNameOrg: string[] = [];

  listRepoNameUser: string[] = [];

  listPullsEntity: ListPullsEntity;

  repoPullsOrg$ : Observable<GithubPulls[]> | undefined = undefined;

  ngOnInit(): void {
    this.repoOrg$.subscribe(s => s.forEach((m) => {
      this.githubService
        .getPull(`repos/${configGitHub.org}/${m.name}/pulls?state=open&sort=created&per_page=10&page=1`)
        .subscribe((pull) => {
          if (pull.length > 0) {
            this.listPullsEntity?.Pulls.push(pull);
          }
        });
    }));

    this.repoUser$.subscribe(s => s.forEach((m) => {
      this.githubService
        .getPull(`repos/${configGitHub.user}/${m.name}/pulls?state=open&sort=created&per_page=10&page=1`)
        .subscribe((pull) => {
          if (pull.length > 0) {
            this.listPullsEntity?.Pulls.push(pull);
          }
        });
    }));
  }
}
