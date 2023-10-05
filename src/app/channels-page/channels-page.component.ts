import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-channels-page',
  templateUrl: './channels-page.component.html',
  styleUrls: ['./channels-page.component.css']
})


export class ChannelsPageComponent {

  constructor(private router: Router) { }
  redirectToChatPage() {
    this.router.navigate(['/chat-page']);
  }
  

}

