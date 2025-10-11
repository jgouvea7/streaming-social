import { IsNotEmpty } from "class-validator"

export class CreateVideoDto {
    
    likeCount?: number

    @IsNotEmpty()
    title: string


}
