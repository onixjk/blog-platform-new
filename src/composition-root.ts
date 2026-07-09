import 'reflect-metadata'
import { Container } from "inversify";
import { PostService } from "./modules/post/application/postService";
import { DeviceRepository } from "./modules/device/repositoryes/device.repository";
import { BcryptService } from "./modules/auth/adapters/bcrypt.service";
import { NodemailerService } from "./modules/auth/adapters/nodemailer.service";
import { JwtService } from "./modules/auth/adapters/jwt.service";
import { DeviceQueryRepository } from "./modules/device/repositoryes/device.query.repository";
import { DeviceService } from "./modules/device/application/device.service";
import { CommentQueryRepository } from "./modules/comment/repositories/comment.query.repository";
import { CommentRepository } from "./modules/comment/repositories/comment.repository";
import { CommentService } from "./modules/comment/application/comment.service";
import { BlogRepository } from "./modules/blog/repositories/blogRepository";
import { AuthRepository } from "./modules/auth/repositories/auth.repository";
import { EmailExamples } from "./modules/auth/adapters/email-examples";
import { PostQueryRepository } from "./modules/post/repositories/post.query.repository";
import { PostRepository } from "./modules/post/repositories/post.repository";
import { UserQueryRepository } from "./modules/user/repositories/user.query.repository";
import { UserRepository } from "./modules/user/repositories/user.repository";
import { UserService } from "./modules/user/application/user.service";
import { BlogQueryRepository } from "./modules/blog/repositories/blog.query.repository";
import { BlogService } from "./modules/blog/application/blog.service";
import { AuthService } from "./modules/auth/application/auth.service";


export const container = new Container();

// container.bind(EmailExamples).toSelf().inSingletonScope;
// container.bind(NodemailerService).toSelf().inSingletonScope;
// container.bind(JwtService).toSelf().inSingletonScope;
// container.bind(BcryptService).toSelf().inSingletonScope;
//
// container.bind(UserQueryRepository).toSelf().inSingletonScope;
// container.bind(UserRepository).toSelf().inSingletonScope;
// container.bind(UserService).toSelf().inSingletonScope;
//
// container.bind(PostQueryRepository).toSelf().inSingletonScope;
// container.bind(PostRepository).toSelf().inSingletonScope;
// container.bind(PostService).toSelf().inSingletonScope;
//
// container.bind(DeviceQueryRepository).toSelf().inSingletonScope;
// container.bind(DeviceRepository).toSelf().inSingletonScope;
// container.bind(DeviceService).toSelf().inSingletonScope;
//
// container.bind(CommentQueryRepository).toSelf().inSingletonScope;
// container.bind(CommentRepository).toSelf().inSingletonScope;
// container.bind(CommentService).toSelf().inSingletonScope;
//
// container.bind(BlogQueryRepository).toSelf().inSingletonScope;
// container.bind(BlogRepository).toSelf().inSingletonScope;
// container.bind(BlogService).toSelf().inSingletonScope;
//
// container.bind(AuthRepository).toSelf().inSingletonScope;
// container.bind(AuthService).toSelf().inSingletonScope;



container.bind(EmailExamples).toSelf();
container.bind(NodemailerService).toSelf();
container.bind(JwtService).toSelf();
container.bind(BcryptService).toSelf();

container.bind(UserQueryRepository).toSelf();
container.bind(UserRepository).toSelf();
container.bind(UserService).toSelf();

container.bind(PostQueryRepository).toSelf();
container.bind(PostRepository).toSelf();
container.bind(PostService).toSelf();

container.bind(DeviceQueryRepository).toSelf();
container.bind(DeviceRepository).toSelf();
container.bind(DeviceService).toSelf();

container.bind(CommentQueryRepository).toSelf();
container.bind(CommentRepository).toSelf();
container.bind(CommentService).toSelf();

container.bind(BlogQueryRepository).toSelf();
container.bind(BlogRepository).toSelf();
container.bind(BlogService).toSelf();

container.bind(AuthRepository).toSelf();
container.bind(AuthService).toSelf();


// export const emailExamples = new EmailExamples();
// export const nodemailerService = new NodemailerService();
// export const jwtService = new JwtService();
// export const bcryptService = new BcryptService();
//
// export const usersQueryRepository = new UsersQueryRepository();
// export const usersRepository = new UsersRepository();
// export const usersService = new UsersService(usersRepository, bcryptService);
//
// export const postsQueryRepository = new PostsQueryRepository();
// export const postsRepository = new PostsRepository();
// export const postsService = new PostsService(postsRepository);
//
// export const deviceQueryRepository = new DeviceQueryRepository();
// export const deviceRepository = new DeviceRepository();
// export const deviceService = new DeviceService(deviceRepository);
//
// export const commentQueryRepository = new CommentQueryRepository();
// export const commentRepository = new CommentRepository();
// export const commentService = new CommentService(commentRepository, usersService);
//
// export const blogsQueryRepository = new BlogsQueryRepository();
// export const blogsRepository = new BlogsRepository();
// export const blogsService = new BlogsService(blogsRepository, postsService);
//
// export const authRepository = new AuthRepository();
// export const authService = new AuthService(
//     jwtService,
//     bcryptService,
//     usersService,
//     usersRepository,
//     authRepository
// );