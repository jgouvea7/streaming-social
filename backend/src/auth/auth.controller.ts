import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SingInDto } from './dto/sing-in.dto';

@Controller('/api/v1/auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    singIn(@Body() singInDto: SingInDto) {
        return this.authService.singIn(singInDto.email, singInDto.password)
    }
}
