// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class UserAuthenticationService {

//   constructor() { }
//   private currentUser: { userId: string } | null = null;

//   async setUser(userId: string) {
//     this.currentUser = { userId };
//   }

//   getUser(): { userId: string } | null {
//     return this.currentUser;
//   }

//   isLoggedIn(): boolean {
//     return this.currentUser !== null;
//   }
// }

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserAuthenticationService {
  private currentUser: { userId: string } | null = null;
  private userSetPromise: Promise<void>;
  private resolveUserSet: () => void;

  constructor() {
    this.userSetPromise = new Promise<void>((resolve) => {
      this.resolveUserSet = resolve;
    });
  }

  async setUser(userId: string) {
    this.currentUser = { userId };
    this.resolveUserSet();
  }

  getUser(): { userId: string } | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getUserSetPromise(): Promise<void> {
    return this.userSetPromise;
  }
}