/**
 * A generic model that our Master-Detail pages list, create, and delete.
 *
 * Change "Item" to the noun your app will use. For example, a "Contact," or a
 * "Customer," or a "Animal," or something like that.
 *
 * The Items service manages creating instances of Item, so go ahead and rename
 * that something that fits your app as well.
 */
export class Item {

  ID: Number;
  Note: any;
  Nome: String = "";
  Cognome: String = "";
  RagioneSociale: any;
  Telefono: any;
  Targa: String = "";
  Marca: String = "";
  Modello: String = "";
  Lavorazione: Lavorazione;

  constructor() {
  }

}
export class Lavorazione {
  ID: number;
  IdPratica: Number;
  DataPrenotazione: Date;
  DataAccettazione: Date;
  DataConsegna: any;
  DataConsegnaPrevista: any;
  DataUltimazione: any;
  DataInizioLavorazione: any;
  DataInserimento: Date;
  note: String;
  Stato: Number;
  Scaduta: Boolean;
  TempoRimastoPercentuale: Number;
}