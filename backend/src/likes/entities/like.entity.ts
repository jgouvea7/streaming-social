import { Comment } from "src/comments/entities/comment.entity";
import { User } from "src/users/entities/user.entity";
import { Video } from "src/videos/entities/video.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Like {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Video, (video) => video.likes, { onDelete: 'CASCADE' })
    video?: Video;

    @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' } )
    comment?: Comment;
}
