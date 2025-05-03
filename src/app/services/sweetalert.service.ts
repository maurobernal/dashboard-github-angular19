import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export default class SweetAlertService {

  static async showConfirmationNotification(message?:string | null, textButton?:string | null): Promise<boolean> {
    const result = await Swal.fire({
      title: message ?? 'Are you sure you want to delete?',
      text: 'You will not be able to undo this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: textButton ?? 'Yes, Delete!',
      customClass: {
        popup: 'custom-bg-swal2-popup',
      },
    });
    return result.isConfirmed;
  }

  static showErrorPopUp(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Oops1...',
      text: message,
      customClass: {
        popup: 'custom-bg-swal2-popup',
      },
    });
  }

  static showErrorPopUpWithText(message: string, body: string): void {
    Swal.fire({
      icon: 'error',
      theme: 'dark',
      title: `${message}`,
      text: body,
    });
  }

  static showSucessDelete(message: string): void {
    Swal.fire({
      title: 'Deleted!',
      text: message,
      icon: 'success',
      customClass: {
        popup: 'custom-bg-swal2-popup',
      },
    });
  }

  static showSucessPopUp(message: string): void {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        popup: 'custom-bg-swal2-popup',
      },
    });
  }

  static showSucessPopUpWithText(message: string, body: string): void {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: message,
      text: body,
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        popup: 'custom-bg-swal2-popup',
      },
    });
  }

  static showWarningPopUp(message: string): void {
    Swal.fire({
      title: 'Error saving',
      text: message,
      icon: 'warning',
      timer: 1500,
      customClass: {
        popup: 'custom-bg-swal2-popup',
      },
    });
  }

  static async showWarningPopUpWithText(message: string, body: string): Promise<boolean> {
    const result = await Swal.fire({
      title: message,
      text: body,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Finish!',
      customClass: {
        popup: 'custom-bg-swal2-popup',
      },
    });
    return result.isConfirmed;
  }

  static showQuestionPopUp(message: string, body: string): void {
    Swal.fire({
      title: message,
      text: body,
      icon: 'question',
      customClass: {
        popup: 'custom-bg-swal2-popup',
      },
    });
  }

  static renderChild(): void {
    Swal.fire({
      position: 'top-end',
      icon: 'error',
      title: 'Oops, it seems you have unsaved changes.',
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        popup: 'custom-bg-swal2-popup',
      },
    });
  }

}