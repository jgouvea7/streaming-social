import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor (
        private jwtService: JwtService,
        private userService: UsersService
    ){}

    async singIn(email: string, password: string): Promise<{ access_token: string }> {
        const user = await this.userService.findOneByEmail(email)
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            throw new UnauthorizedException("Login ou senha incorreto. Tente novamente!")
        }

        const payload = { sub: user.id, email: user.email };
        return {
            access_token: await this.jwtService.signAsync(payload)
        }
        
    }
}
