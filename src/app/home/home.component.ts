import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { RequestService } from '../services/request.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  users: any = [];
  me: any = {};
  editingSubnick = false;
  subnick = '';
  closeResult: string;
  requestEmail: string;
  picture: any;
  constructor(private usersService: UserService,
              private modalService: NgbModal,
              private router: Router,
              private requestService: RequestService) {
    this.usersService.getUsers().valueChanges().subscribe((result) => {
      this.users = result;
    });
    this.me = JSON.parse(localStorage.getItem('msn_user'));
    if (!this.me) {
      this.router.navigate(['/login']);
    }
    this.usersService.getUser(this.me.uid).valueChanges().subscribe((result: any) => {
      this.me = result;
      localStorage.setItem('msn_user', JSON.stringify(this.me));
      this.picture = (this.me.downloaded_picture) ? this.me.profile_picture
        : 'https://wir.skyrock.net/wir/v1/profilcrop/?c=mog&w=301&h=301&im=%2Fart%2FPRIP.85914100.3.0.png';
      this.me.friends = Object.keys(this.me.friends).map(function (key) { return result.friends[key]; });
      this.me.friends.forEach((f, i) => {
         this.usersService.getUser(f).valueChanges().subscribe((mf) => {
           this.me.friends[i] = mf;
         });
      });
    });
    const audio = new Audio('assets/sound/online.m4a');
    audio.play();
  }

  ngOnInit() {
  }
  setUserProperty(key, value) {
    return this.usersService.setUserProperty(key, value, this.me.uid);
  }
  startEditingSubnick() {
    this.editingSubnick = true;
  }
  setSubnick() {
    this.setUserProperty('subnick', this.me.subnick).then(() => {
      this.editingSubnick = false;
    });
    document.getElementById('subnickTxt').focus();
  }
  open(content) {
    this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
  sendRequest() {
    const request = {
      timestamp: Date.now(),
      receiver_email: this.requestEmail,
      sender: this.me,
      status: 'pending'
    };
    this.requestService.createRequest(request).then(() => {
      alert('Solicitud Enviada!');
    });
  }
}
