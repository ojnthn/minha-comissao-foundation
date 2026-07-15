import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: number;
}

@Injectable()
export class JwtTokenService {
  constructor(private readonly configService: ConfigService) {}

  generate(payload: JwtPayload): string {
    const secret = this.configService.get<string>('jwt.secret')!;
    const expiresIn = this.configService.get<string>('jwt.expiresIn')!;
    return jwt.sign(payload, secret, {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verify(token: string): JwtPayload {
    const secret = this.configService.get<string>('jwt.secret')!;
    return jwt.verify(token, secret) as unknown as JwtPayload;
  }
}
