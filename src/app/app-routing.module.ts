import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatPageComponent } from './chat-page/chat-page.component';
import { ChannelsPageComponent } from './channels-page/channels-page.component';


const routes: Routes = [
  {path: 'channel-page', component: ChannelsPageComponent},
  {path: '', component: ChatPageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  
}
