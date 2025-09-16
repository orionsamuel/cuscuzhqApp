import { Component, Inject } from '@angular/core';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { Platform, ModalController } from '@ionic/angular';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { Capacitor } from '@capacitor/core';
// import { SafeArea } from '@capacitor-community/safe-area';
// import '@capacitor-community/safe-area';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private modalCtrl = Inject(ModalController);
  constructor(
    private platform: Platform,
    private router: Router
  ) {
    addIcons(allIcons);
    this.initializeBackButton();
    this.platform.ready().then(() => {
      this.initEdgeToEdge();
    });
    // this.initializeSafeArea();
  }

  initializeBackButton() {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      const topModal = await this.modalCtrl.getTop();
      if (topModal) {
        await topModal.dismiss();
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
      // habilita (aplica insets e configura o WebView)
      await EdgeToEdge.enable?.();

      // lê os insets atuais (top, bottom, left, right)
      const insets = await EdgeToEdge.getInsets?.();

      // define variáveis CSS para serem usadas no styling
      document.documentElement.style.setProperty('--safe-area-inset-top', `${insets?.top ?? 0}px`);
      document.documentElement.style.setProperty('--safe-area-inset-bottom', `${insets?.bottom ?? 0}px`);
      document.documentElement.style.setProperty('--safe-area-inset-left', `${insets?.left ?? 0}px`);
      document.documentElement.style.setProperty('--safe-area-inset-right', `${insets?.right ?? 0}px`);

      // opcional: definir cor da status/navigation bar (combina com StatusBar plugin)
      // await EdgeToEdge.setBackgroundColor?.({ statusBarColor: '#000000', navigationBarColor: '#000000' });

      console.log('EdgeToEdge insets applied:', insets);
    } catch (err) {
      console.warn('EdgeToEdge init failed', err);
    }
  }

  // async initializeSafeArea() {
  //   SafeArea.enable({
  //     config: {
  //       customColorsForSystemBars: true,
  //       statusBarColor: '#00000000', // transparent
  //       statusBarContent: 'light',
  //       navigationBarColor: '#00000000', // transparent
  //       navigationBarContent: 'light',
  //     },
  //   });
  // }

}


