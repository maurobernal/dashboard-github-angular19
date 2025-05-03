import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { GithubPulls } from '@interfaces/githubpulls';

@Component({
  selector: 'app-repos',
  templateUrl: './repos.component.html',
  imports:[DatePipe]

})
export class ReposComponent {
  @Input() pull : GithubPulls | undefined;
}
