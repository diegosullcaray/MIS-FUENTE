import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { ErrorContent } from '../interfaces/error-content.interface';
import { ErrorContentService } from '../services/error-content.service';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent implements OnInit {
  content: ErrorContent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private errorContentService: ErrorContentService
  ) { }

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    this.content = this.errorContentService.resolve(code);
  }

  goHome(): void {
    this.router.navigateByUrl(environment.homePage);
  }
}
