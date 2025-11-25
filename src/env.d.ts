/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    auth: () => {
      isAuthenticated: boolean;
      userId?: string;
    };
  }
}
