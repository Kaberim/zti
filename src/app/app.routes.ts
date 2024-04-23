import { Routes } from '@angular/router';
import { LoginComponent } from "./login/login.component";
import { MainPageComponent } from "./main-page/main-page.component";

export const routes: Routes =
  [
    {path: 'login', component: LoginComponent},
    {path: 'mainpage', component: MainPageComponent
    //   // , canActivate: [AuthGuardService]
    },
    {path: '**', component: LoginComponent}
  ];
