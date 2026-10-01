import { Injectable } from '@angular/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { UserSession } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class SecureSessionStorageService {
  private readonly sessionKey = 'flashcart_session';

  async save(session: UserSession): Promise<void> {
    await SecureStorage.set(
      this.sessionKey,
      session as unknown as Record<string, unknown>,
    );
  }

  async read(): Promise<UserSession | null> {
    const value = await SecureStorage.get(this.sessionKey);

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    return value as unknown as UserSession;
  }

  async clear(): Promise<void> {
    await SecureStorage.remove(this.sessionKey);
  }
}
