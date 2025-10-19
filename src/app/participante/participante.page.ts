import { Component, OnInit, inject, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestureController, Gesture } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  ToastController,
  Platform,
  IonText,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';

import { NotasService } from '../services/notas.service';
import { CospobreService } from '../services/cospobre.service';
import { InscritosService } from '../services/inscritos.service';

@Component({
  selector: 'app-participante',
  templateUrl: './participante.page.html',
  styleUrls: ['./participante.page.scss'],
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
    IonInput,
    IonText,
    IonIcon,
    IonSpinner
  ]
})
export class ParticipantePage implements OnInit {
  private formBuilder = inject(FormBuilder);
  private notasService = inject(NotasService);
  private cospobreService = inject(CospobreService);
  private inscritosService = inject(InscritosService);
  private toastController = inject(ToastController);
  private router = inject(Router);
  private platform = inject(Platform);
  private gestureCtrl = inject(GestureController);
  private route = inject(ActivatedRoute);

  @ViewChild('imageContainer', { read: ElementRef }) imageContainer!: ElementRef;

  participante: any;
  edicao!: number;
  formCadastroNotas!: FormGroup;
  isSubmitted = false;
  isExpanded = false;
  listaNotas: any[] = [];
  isCarregandoParticipante = true;

  constructor() {
    this.platform.ready().then(() => {
      this.init();
    });
  }

  get errorControl() {
    return this.formCadastroNotas.controls;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.imageContainer?.nativeElement) {
        this.initializeGesture();
      }
    }, 50);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const edicao = params.get('edicao');
      const id = params.get('id');
      if (edicao !== null && id !== null) {
        this.carregarParticipante(parseInt(edicao), parseInt(id));
      }
    });

    this.formCadastroNotas = this.formBuilder.group({
      criatividade: ['', [
        Validators.required,
        Validators.pattern(/^10$|^[0-9](\.[0-9]{1,2})?$/),
        Validators.min(0),
        Validators.max(10)
      ]],
      fidelidade: ['', [
        Validators.required,
        Validators.pattern(/^10$|^[0-9](\.[0-9]{1,2})?$/),
        Validators.min(0),
        Validators.max(10)
      ]],
      desenvolvimento: ['', [
        Validators.required,
        Validators.pattern(/^10$|^[0-9](\.[0-9]{1,2})?$/),
        Validators.min(0),
        Validators.max(10)
      ]]
    });
  }

  async init() {
    try {
      await this.buscarEdicao();
      await this.buscarNotas();
    } catch (error) {
      console.error('Erro ao inicializar dados:', error);
    }
  }

  async carregarParticipante(edicao: number, id: number) {
    this.isCarregandoParticipante = true;
    this.participante = await this.cospobreService.buscarParticipanteById(edicao, id).toPromise();
    this.isCarregandoParticipante = false;
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

  async buscarNotas(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Buscando notas para edição:', this.edicao);

      this.notasService.buscarNotas(this.edicao, true).subscribe({
        next: (dados) => {
          console.log('Notas recebidas do servidor:', dados);
          this.listaNotas = dados || [];
          resolve();
        },
        error: (erro) => {
          console.error('Erro ao buscar notas:', erro);
          this.listaNotas = [];
          this.presentToast('Erro ao carregar notas', 'danger');
          reject(erro);
        }
      });
    });
  }

  cadastroNotas() {
    this.isSubmitted = true;

    if (!this.formCadastroNotas.valid) {
      this.presentToast('Por favor, preencha as notas corretamente', 'danger');
      return;
    }

    console.log(this.formCadastroNotas.value);

    try {
      const notaEncontrada = this.listaNotas.find((nota) => nota.id === this.participante.id);
      console.log(this.listaNotas);

      if (!notaEncontrada) {
        this.presentToast('Erro: Participante não encontrado nas notas', 'danger');
        return;
      }

      console.log(this.participante.nome);

      const nota1Existente = this.parseSafeFloat(notaEncontrada.nota_1);
      const nota2Existente = this.parseSafeFloat(notaEncontrada.nota_2);
      const nota3Existente = this.parseSafeFloat(notaEncontrada.nota_3);

      const novaNota1 = this.parseSafeFloat(this.formCadastroNotas.value.criatividade);
      const novaNota2 = this.parseSafeFloat(this.formCadastroNotas.value.fidelidade);
      const novaNota3 = this.parseSafeFloat(this.formCadastroNotas.value.desenvolvimento);

      const nota1Final = nota1Existente + novaNota1;
      const nota2Final = nota2Existente + novaNota2;
      const nota3Final = nota3Existente + novaNota3;
      const totalNota = (nota1Final + nota2Final + nota3Final) / 3;

      const dadosParaEnviar = {
        id: notaEncontrada.id,
        nome: notaEncontrada.nome,
        personagem: notaEncontrada.personagem,
        edicao: notaEncontrada.edicao,
        nota_1: nota1Final.toFixed(2),
        nota_2: nota2Final.toFixed(2),
        nota_3: nota3Final.toFixed(2),
        total_nota: totalNota.toFixed(2)
      };

      console.log('📤 Dados para envio:', dadosParaEnviar);

      this.notasService.atualizarNotas(dadosParaEnviar, this.edicao, true).subscribe({
        next: (dados) => {
          console.log('✅ Resposta do servidor:', dados);
          this.presentToast('Notas Cadastradas Com Sucesso', 'success');
          this.formCadastroNotas.reset();
          this.isSubmitted = false;
        },
        error: (erro) => {
          console.error('❌ Erro no cadastro de notas:', erro);
          this.presentToast('Erro ao cadastrar notas. Tente novamente.', 'danger');
        }
      });

      this.presentToast('Notas Cadastradas Com Sucesso', 'success');
      this.router.navigate(['/tabs/tab3']);
    } catch (error) {
      console.error('Erro ao cadastrar as notas:', error);
      this.presentToast('Erro ao cadastrar as notas', 'danger');
    }
  }

  toggleImage() {
    this.isExpanded = !this.isExpanded;
  }

  private initializeGesture() {
    if (!this.imageContainer?.nativeElement) return;

    const gesture: Gesture = this.gestureCtrl.create({
      el: this.imageContainer.nativeElement,
      gestureName: 'swipe-image',
      threshold: 15,
      direction: 'y',
      gesturePriority: 100,
      onEnd: ev => {
        if (ev.deltaY > 50 && !this.isExpanded) {
          this.isExpanded = true;
        } else if (ev.deltaY < -50 && this.isExpanded) {
          this.isExpanded = false;
        }
      }
    });
    gesture.enable(true);
  }

  async presentToast(texto: string, cor: string) {
    const toast = await this.toastController.create({
      message: texto,
      color: cor,
      duration: 2000
    });
    await toast.present();
  }

  private parseSafeFloat(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

}
