import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstant } from './constans';

@Module({
  imports: [
    UsersModule, 
    JwtModule.register({
      global: true,
      secret: jwtConstant.secret,
      signOptions: {expiresIn: '120m'}
    })
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
