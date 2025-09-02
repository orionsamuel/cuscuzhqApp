import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonIcon,
  ToastController,
  IonText,
  IonRadioGroup,
  IonRadio
} from '@ionic/angular/standalone';
import { InscritosService } from '../services/inscritos.service';
import { IInscritos } from '../models/IInscritos.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
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
    IonButton,
    IonToast,
    IonIcon,
    IonText,
    IonRadioGroup,
    IonRadio
  ]
})

export class Tab2Page implements OnInit {
  private toastController = inject(ToastController);
  private formBuilder = inject(FormBuilder);
  private inscritosService = inject(InscritosService);

  titulo = 'Cadastrar Participante';
  formCadastro: FormGroup;
  isSubmitted = false;
  showToast = false;
  toastMessage = '';
  toastColor = 'success';
  inscrito: any = {};
  diaSelecionado: string = '';

  constructor() {
    this.formCadastro = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      telefone: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      diaSelecionado: ['', Validators.required]
    });
  }

  get errorControl(): { [key: string]: AbstractControl } {
    return this.formCadastro.controls;
  }

  ngOnInit() {
  }

  onDiaChange(event: any) {
    this.diaSelecionado = event.detail.value;
  }

  cadastro() {
    this.isSubmitted = true;

    if (!this.formCadastro.valid) {
      console.log('Formulário inválido');
      this.presentToast('Por favor, preencha o formulário corretamente', 'danger');
      return;
    }

    this.inscrito.nome =  this.formCadastro.value.nome;
    this.inscrito.telefone = this.formCadastro.value.telefone;
    this.inscrito.email = this.formCadastro.value.email;
    this.inscrito.edicao = this.inscritosService.edicao.id || 1;
    this.inscrito.presente1 = this.formCadastro.value.diaSelecionado === 'dia1';
    this.inscrito.presente2 = this.formCadastro.value.diaSelecionado === 'dia2';
    this.inscrito.sorteado = false;

    console.log('Dados do inscrito:', this.inscrito);

    this.inscritosService.cadastrarInscrito(this.inscrito).subscribe({
      next: (dados) => {
        console.log('Cadastro realizado:', dados);
        this.presentToast('Cadastrado com sucesso!', 'success');
        this.formCadastro.reset();
        this.isSubmitted = false;
      },
      error: (erro) => {
        console.error('Erro no cadastro:', erro);
        this.presentToast('Erro ao cadastrar. Tente novamente.', 'danger');
      }
    });
  }

  async presentToast(texto: string, cor: string) {
    this.toastMessage = texto;
    this.toastColor = cor;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 2000);
  }
}
