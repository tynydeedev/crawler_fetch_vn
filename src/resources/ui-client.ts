import { IClient } from '../interfaces';

class UiClients {
  public graphClients: IClient;
  public logClients: IClient;

  constructor() {
    this.graphClients = [];
    this.logClients = [];
  }
}

export default new UiClients();
