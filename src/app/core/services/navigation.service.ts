import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export interface NavigationState {
  url: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private navigationStack: NavigationState[] = [];
  private currentState = new BehaviorSubject<NavigationState | null>(null);

  constructor(private router: Router) {}

  pushState(url: string, title: string): void {
    const state: NavigationState = { url, title };
    this.navigationStack.push(state);
    this.currentState.next(state);
  }

  popState(): NavigationState | null {
    const currentState = this.navigationStack.pop();
    const previousState = this.navigationStack[this.navigationStack.length - 1] || null;
    this.currentState.next(previousState);
    return currentState || null;
  }

  getCurrentState(): NavigationState | null {
    return this.currentState.value;
  }

  volver(): void {
    this.popState();
    const previousState = this.navigationStack[this.navigationStack.length - 1];
    if (previousState) {
      this.router.navigate([previousState.url]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  irAlMenuPrincipal(): void {
    this.clearStack();
    this.router.navigate(['/dashboard']);
  }

  clearStack(): void {
    this.navigationStack = [];
    this.currentState.next(null);
  }
} 