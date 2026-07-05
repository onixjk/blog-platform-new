import { UsersQueryRepository } from "./modules/user/repositories/users.query.repository";
import { UsersRepository } from "./modules/user/repositories/usersRepository";
import { UsersService } from "./modules/user/application/usersService";
import { PostsRepository } from "./modules/post/repositories/posts.repository";
import { PostsQueryRepository } from "./modules/post/repositories/posts.query.repository";
import { PostsService } from "./modules/post/application/posts.service";
import { DeviceRepository } from "./modules/device/repositoryes/device.repository";
import { BcryptService } from "./modules/auth/adapters/bcrypt.service";
import { NodemailerService } from "./modules/auth/adapters/nodemailer.service";
import { JwtService } from "./modules/auth/adapters/jwt.service";
import { DeviceQueryRepository } from "./modules/device/repositoryes/device.query.repository";
import { DeviceService } from "./modules/device/application/device.service";
import { CommentQueryRepository } from "./modules/comment/repositories/comment.query.repository";
import { CommentRepository } from "./modules/comment/repositories/comment.repository";
import { CommentService } from "./modules/comment/application/comment.service";
import { BlogsQueryRepository } from "./modules/blog/repositories/blogs.query.repository";
import { BlogsRepository } from "./modules/blog/repositories/blogs.repository";
import { BlogsService } from "./modules/blog/application/blogs.service";
import { AuthRepository } from "./modules/auth/repositories/auth.repository";
import { AuthService } from "./modules/auth/application/authService";
import { EmailExamples } from "./modules/auth/adapters/email-examples";

export const emailExamples = new EmailExamples();
export const nodemailerService = new NodemailerService();
export const jwtService = new JwtService();
export const bcryptService = new BcryptService();

export const usersQueryRepository = new UsersQueryRepository();
export const usersRepository = new UsersRepository();
export const usersService = new UsersService(usersRepository, bcryptService);

export const postsQueryRepository = new PostsQueryRepository();
export const postsRepository = new PostsRepository();
export const postsService = new PostsService(postsRepository);

export const deviceQueryRepository = new DeviceQueryRepository();
export const deviceRepository = new DeviceRepository();
export const deviceService = new DeviceService(deviceRepository);

export const commentQueryRepository = new CommentQueryRepository();
export const commentRepository = new CommentRepository();
export const commentService = new CommentService(commentRepository, usersService);

export const blogsQueryRepository = new BlogsQueryRepository();
export const blogsRepository = new BlogsRepository();
export const blogsService = new BlogsService(blogsRepository, postsService);

export const authRepository = new AuthRepository();
export const authService = new AuthService(
    // jwtService,
    // bcryptService,
    // usersService,
    // usersRepository,
    // authRepository
);