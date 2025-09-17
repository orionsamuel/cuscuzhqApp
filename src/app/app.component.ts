import { Component, Inject } from '@angular/core';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { Platform } from '@ionic/angular';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { Capacitor } from '@capacitor/core';

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
    this.platform.ready().then(() => {
      this.initEdgeToEdge();
    });
  }

  initializeBackButton() {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      if (this.router.url.startsWith('/tabs/participante')) {
        this.router.navigate(['/tabs/tab3']);
        return;
      }

      if (this.router.url !== '/tabs/tab1') {
        await this.router.navigate(['/tabs/tab1']);
        return;
      }

      App.minimizeApp();
    });
  }

  async initEdgeToEdge() {
    if (Capacitor.getPlatform() !== 'android') {
      return;
    }

    try {
      await EdgeToEdge.enable?.();

      const insets = await EdgeToEdge.getInsets?.();

      document.documentElement.style.setProperty('--safe-area-inset-top', `${insets?.top ?? 0}px`);
      document.documentElement.style.setProperty('--safe-area-inset-bottom', `${insets?.bottom ?? 0}px`);
      document.documentElement.style.setProperty('--safe-area-inset-left', `${insets?.left ?? 0}px`);
      document.documentElement.style.setProperty('--safe-area-inset-right', `${insets?.right ?? 0}px`);

      console.log('EdgeToEdge insets applied:', insets);
    } catch (err) {
      console.warn('EdgeToEdge init failed', err);
    }
  }
}


