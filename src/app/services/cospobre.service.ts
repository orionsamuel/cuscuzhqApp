import { Injectable, inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class CospobreService {

  private http = inject(HttpClient);
  private toastController = inject(ToastController);

  private apiURL!: string;
  private apiURLEdicao = 'https://cuscuzhq.alwaysdata.net/inscricao/v1/edicaoatual/';
  private options: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

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

  buscarEdicaoAtual(): Observable<any> {
    return this.http.get<any>(this.apiURLEdicao).pipe(
      map(retorno => retorno),
      catchError(erro => this.exibirErro(erro))
    );
  }
}
