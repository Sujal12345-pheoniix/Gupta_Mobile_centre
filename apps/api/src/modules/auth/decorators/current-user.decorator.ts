import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../auth.service';
import { AuthenticatedRequest } from '../guards/jwt-auth.guard';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (data) {
      return user[data];
    }

    return user;
  },
);
