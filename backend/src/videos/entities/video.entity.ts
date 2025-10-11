import { Comment } from "src/comments/entities/comment.entity";
import { Like } from "src/likes/entities/like.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Video {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    title: string

    @Column()
    url: string

    @Column({ default: 0 })
    likeCount: number;

    @Column({ default: false })
    edited: boolean

    @Column({ nullable: true })
    tags: string

    @CreateDateColumn({ name: "created_at" })
    createAt: Date;

    @ManyToOne(() => User, (user) => user.videos, {onDelete: 'CASCADE'} )
    user: User

    @OneToMany(() => Like, (like) => like.video )
    likes: Like[]

    @OneToMany(() => Comment, (comment) => comment.video, { eager: true, cascade: true, onDelete: "CASCADE" })
    comments: Comment[]

}
