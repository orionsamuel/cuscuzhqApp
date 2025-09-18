import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonText,
  IonList,
  ToastController,
  Platform,
  IonThumbnail,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  AlertController,
  IonSpinner,
  IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';

import { CospobreService } from '../services/cospobre.service';
import { InscritosService } from './../services/inscritos.service';
import { ImageCacheService } from '../services/image-cache.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonText,
    IonList,
    IonThumbnail,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonSpinner,
    IonRefresher,
    IonRefresherContent
  ]
})
export class Tab3Page implements OnInit {
  private alertController = inject(AlertController);
  private formBuilder = inject(FormBuilder);
  private http = inject(HttpClient);
  private cospobreService = inject(CospobreService);
  private inscritosService = inject(InscritosService);
  private imageCacheService = inject(ImageCacheService);
  private toastController = inject(ToastController);
  private router = inject(Router);
  private platform = inject(Platform);
  private cdr = inject(ChangeDetectorRef);

  titulo = 'Cospobres';
  isCosplay = true;
  edicao!: number;
  notas: any = {};
  listaParticipantes!: any[];
  cachedImages: { [key: string]: string } = {};
  isLoading = false;
  players: { [id: number]: { audio: HTMLAudioElement, isPlaying: boolean, posicao: number } | undefined } = {};

  constructor() {
    this.platform.ready().then(() => {
      this.init();
    });
  }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.cdr.detectChanges();
  }

  async init() {
    this.isLoading = true;
    try {
      await this.buscarEdicao();

      await this.buscarParticipante();

      await this.cacheImagesForParticipants();
    } catch (error) {
      console.error('Erro ao inicializar dados:', error);
    } finally{
      this.isLoading = false
    }
  }

  async cacheImagesForParticipants() {
    try {
      for (const participante of this.listaParticipantes) {
        const cachedImageUrl = await this.imageCacheService.cacheImage(participante.imagem, participante.email);
        this.cachedImages[participante.email] = cachedImageUrl;
      }
    } catch (error) {
      console.error('Erro ao cacheiar imagens:', error);
    }
  }

  getImageUrl(participante: any): string {
    const cacheUrl = this.cachedImages[participante.email];
    if (cacheUrl && !cacheUrl.includes('null')) {
      return cacheUrl;
    }
    return participante.imagem;
  }

  async buscarParticipante(event: any = null) {
    try {
      const participantes = await this.cospobreService.buscarParticipante(this.edicao, this.isCosplay).toPromise();
      console.log(participantes);
      this.listaParticipantes = participantes;
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
    } finally {
      if (event?.target) {
        event.target.complete();
      }
    }
  }

  async buscarEdicao() {
    try {
      const dados = await this.inscritosService.buscarEdicao().toPromise();
      console.log(dados);
      this.edicao = dados.numero;
    } catch (error) {
      console.error('Erro ao buscar edição:', error);
    }
  }

  async excluirParticipante(slidingItem: IonItemSliding, participante: any) {
    if (!participante) return;

    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Deseja excluir o participante ${participante.nome}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            slidingItem.close();
          }
        }, {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.confirmarExclusao(participante);
          }
        }
      ]
    });

    await alert.present();
  }


  toggleAudio(participanteId: number,musicaUrl: string) {
    let player = this.players[participanteId];

    if (!player) {
      const audio = new Audio(musicaUrl);
      player = {
        audio,
        isPlaying: false,
        posicao: 0
      };
      this.players[participanteId] = player;

      audio.onended = () => {
        player!.isPlaying = false;
        player!.posicao = 0;
      };
    }

    if (player.isPlaying) {
      player.posicao = player.audio.currentTime;
      player.audio.pause();
      player.isPlaying = false;
    } else {
      player.audio.currentTime = player.posicao;
      player.audio.play();
      player.isPlaying = true;
    }
  }

  pararAudio(participanteId: number) {
    const player = this.players[participanteId];
    if (player) {
      player.audio.pause();
      player.audio.currentTime = 0;
      player.posicao = 0;
      player.isPlaying = false;
    }
  }

  abrirParticipante(participante: any) {
    this.router.navigate(['/tabs/participante', this.edicao, participante.id]);
  }

  async confirmarExclusao(participante: any) {
    if (!participante) return;

    this.cospobreService.deletarParticipante(participante, this.edicao).subscribe({
      next: (dados) => {
        console.log('Inscrito excluído:', dados);
        this.presentToast('Inscrito excluído com sucesso!', 'success');
        this.init().then(() => {
          this.cdr.detectChanges();
        });
      },
      error: (erro) => {
        console.error('Erro ao excluir inscrito:', erro);
        this.presentToast('Erro ao excluir inscrito', 'danger');
      }
    });
  }

  async presentToast(texto: string, cor: string) {
    const toast = await this.toastController.create({
      message: texto,
      color: cor,
      duration: 2000
    });
    await toast.present();
  }

}
