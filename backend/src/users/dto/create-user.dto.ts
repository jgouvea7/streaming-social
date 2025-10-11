import { IsDate, IsEmail, IsNotEmpty } from "@nestjs/class-validator"
import { Type } from "class-transformer";
import { IsEmpty, Length, Matches } from "class-validator";

export class CreateUserDto {

    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    lastName: string;

    @IsNotEmpty()
    @Length(5, 50)
    username: string;

    @IsEmail()
    @Length(5, 50)
    email: string;

    @IsEmpty()
    bio?: string

    @IsNotEmpty()
    @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,30}$/,
    {
      message:
        'Senha deve ter ao menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo',
    }
    )
    password: string;

    @IsDate()
    @Type(() => Date)
    birthDate: Date;
}
