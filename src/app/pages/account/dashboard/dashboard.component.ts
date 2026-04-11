import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { json } from 'express';
import { error } from 'console';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public openDashboard: boolean = false;
  userName: string = "";
  userEmail: string = "";
  userPhone: string = "";
  userData: JSON;



  constructor(private router: Router, private userservice: UserService) {

  }

  ngOnInit(): void {
    this.userservice.getUserDetails().subscribe(
      res => {
        if (res['error'] != 1) {
          this.userName = res['data'][0].name;
          this.userEmail = res['data'][0].email;
          this.userPhone = res['data'][0].phone;
        }

      }
    )
  }

  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }

  logout() {
    this.userservice.logout();
  }

}
