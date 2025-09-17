import { Injectable, inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastController } from '@ionic/angular/standalone';
import { NotasService } from '../services/notas.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CospobreService {

  private http = inject(HttpClient);
  private toastController = inject(ToastController);
  private notasService = inject(NotasService);

  private listaNotas: any[] = [];
  private edicao: any;
  private apiURL!: string;
  private apiURLEdicao = 'https://cuscuzhq.alwaysdata.net/inscricao/v1/edicaoatual/';
  private options: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor() {
    this.buscarEdicaoAtual().subscribe(dados => {
      console.log(dados);
      this.edicao = dados.numero;
      this.buscarNotas(this.edicao);
    });
  }

  buscarParticipante(edicao: number, isCosplay: boolean): Observable<any> {
    console.log(edicao);

    if (isCosplay) {
      this.apiURL = 'https://cuscuzhq.alwaysdata.net/inscricao/v1/cospobre/';
    } else {
      this.apiURL = 'https://cuscuzhq.alwaysdata.net/inscricao/v1/cosplay/';
    }

    const url = `${this.apiURL}${edicao}/`;

    return this.http.get<any>(url).pipe(
      map(retorno => retorno),
      catchError(erro => this.exibirErro(erro))
    );
  }

  buscarParticipanteById(edicao: number, id: number): Observable<any> {
    this.apiURL = 'https://cuscuzhq.alwaysdata.net/inscricao/v1/cospobre/';

    const url = `${this.apiURL}${edicao}/${id}/`;

    return this.http.get<any>(url).pipe(
      map(retorno => retorno),
      catchError(erro => this.exibirErro(erro))
    );
  }

  deletarParticipante(participante: any, edicao: number): Observable<any> {
    console.log("Lista de notas: ", this.listaNotas);
    const notaEncontrada = this.listaNotas.find((nota) => nota.cospobreId === participante.id);

    const url = `${this.apiURL}${edicao}/${participante.id}/`;

    return this.http.delete(url).pipe(
      tap(() => {
        if (notaEncontrada) {
          this.notasService.deletarNota(notaEncontrada, edicao);
        } else {
          console.warn('Nenhuma nota encontrada para o participante:', participante.id);
        }
      }),
      catchError((erro) => this.exibirErro(erro))
    );
  }

  private async exibirErro(erro: any): Promise<null> {
    console.error('Erro ao consultar a API:', erro);

    const toast = await this.toastController.create({
      message: 'Erro ao consultar a API',
      duration: 2000,
      color: 'danger',
      position: 'middle'
    });

    await toast.present();
    return null;
  }

  async buscarNotas(edicao: number): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Buscando notas para edição:', edicao);

      this.notasService.buscarNotas(edicao, true).subscribe({
        next: (dados) => {
          console.log('Notas recebidas do servidor:', dados);
          this.listaNotas = dados || [];
          resolve();
        },
        error: (erro) => {
          console.error('Erro ao buscar notas:', erro);
          this.listaNotas = [];
          reject(erro);
        }
      });
    });
  }


  buscarEdicaoAtual(): Observable<any> {
    return this.http.get<any>(this.apiURLEdicao).pipe(
      map(retorno => retorno),
      catchError(erro => this.exibirErro(erro))
    );
  }
}
