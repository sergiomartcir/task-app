import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from "./shared/components/header/header.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { Router, NavigationEnd, Event } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, HeaderComponent, IonContent, FooterComponent],
})
export class AppComponent {

  private router = inject(Router);

  constructor() {}

  // controla que no salgan el header y el footer generales en el splash
  public showLayout = toSignal(
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd),
      
      map((event: NavigationEnd) => {
        const isSplashRoute = event.urlAfterRedirects === '/' || event.urlAfterRedirects.includes('/splash');
        
        return !isSplashRoute;
      })
    ),

    { initialValue: false } // valor por defecto mientras arranca
  );
}
