import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class ConnectivityService {
  async isConnected(): Promise<boolean> {
    try {
      const status = await Network.getStatus();
      return status.connected;
    } catch {
      return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }
  }
}
