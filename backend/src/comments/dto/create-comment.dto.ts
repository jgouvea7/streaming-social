import { IsNotEmpty } from "class-validator";

export class CreateCommentDto {
    
    likeCount: number

    @IsNotEmpty()
    comment: string;
}
