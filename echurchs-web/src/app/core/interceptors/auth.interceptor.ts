import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const communityId = user?.memberships?.[0]?.communityId;
  if (communityId) {
    req = req.clone({
      setHeaders: { 'X-Community-Id': communityId }
    });
  }

  return next(req);
};
