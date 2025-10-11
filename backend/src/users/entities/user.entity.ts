import { Comment } from "src/comments/entities/comment.entity";
import { Like } from "src/likes/entities/like.entity";
import { Video } from "src/videos/entities/video.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

enum UserRole {
    USER = "user",
    ADMIN = "admin",
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 50, name: "first_name" })
    firstName: string;

    @Column({  length: 50, name: "last_name" })
    lastName: string

    @Column({ nullable: true })
    bio: string

    @Column({ unique: true ,length: 50 })
    username: string

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: "date", name: "birth_date" })
    birthDate: Date

    @CreateDateColumn({ name: "created_at" })
    createAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updateAt: Date

    @Column({ type: 'simple-enum', enum: ['user', 'admin'], default: 'user' })
    role: string;

    @OneToMany(() => Like, (like) => like.user  )
    likes: Like[]

    @OneToMany(() => Video, (video) => video.user, { eager: true, cascade: true, onDelete: 'CASCADE'})
    videos: Video[]

    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[]

}
