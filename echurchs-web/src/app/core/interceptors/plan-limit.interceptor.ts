import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UpgradePromptService } from '../services/upgrade-prompt.service';

export const planLimitInterceptor: HttpInterceptorFn = (req, next) => {
  const upgradePrompt = inject(UpgradePromptService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403 && error.error?.errorCode === 'PLAN_LIMIT_EXCEEDED') {
        upgradePrompt.show(error.error.message || 'Limite do teu plano atingido. Faz upgrade para continuar.');
      }
      return throwError(() => error);
    })
  );
};
