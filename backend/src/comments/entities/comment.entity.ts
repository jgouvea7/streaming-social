import { Like } from "src/likes/entities/like.entity";
import { User } from "src/users/entities/user.entity";
import { Video } from "src/videos/entities/video.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    comment: string;

    @Column({ default: 0 })
    likeCount: number;

    @Column({ default: false })
    edited: boolean

    @CreateDateColumn({ name: "created_at" })
    createAt: Date;

    @ManyToOne(() => User, (user) => user.comments)
    user: User

    @ManyToOne(() => Video, (video) => video.comments, { onDelete: "CASCADE" })
    video: Video;

    @OneToMany(() => Like, (likes) => likes.comment )
    likes: Like[];

    
}
