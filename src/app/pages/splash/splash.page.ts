import { Component, OnInit, inject } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { checkboxOutline } from 'ionicons/icons';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon]
})
export class SplashPage implements OnInit {

  private router = inject(Router);

  constructor() {
    addIcons({ 
      checkboxOutline
    });
  }

  ngOnInit(): void {
    this.navigateToList();
  }

  private navigateToList(): void {
    setTimeout(() => {
      this.router.navigate(['/task-list']); // redirige al listado
    }, 2000);  //dura 2s 
  }

}
