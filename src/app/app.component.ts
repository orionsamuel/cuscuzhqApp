import { Component } from '@angular/core';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { Platform } from '@ionic/angular';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private router: Router
  ) {
    addIcons(allIcons);
    this.initializeBackButton();
  }

  initializeBackButton() {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      if (this.router.url !== '/tabs/tab1') {
        this.router.navigate(['/tabs/tab1']);
        return;
      }

      App.minimizeApp();
    });
  }

}


