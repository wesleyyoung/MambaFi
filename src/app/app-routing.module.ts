import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AirkeysComponent } from './airkeys/airkeys.component';
import { SettingsComponent } from './settings/settings.component';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home',  component: HomeComponent},
  { path: 'airkeys', component: AirkeysComponent },
  { path: 'settings', component: SettingsComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  
}
