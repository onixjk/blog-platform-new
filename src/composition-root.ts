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
import { AuthController } from "./modules/auth/controllers/auth.controller";
import { BlogController } from "./modules/blog/controllers/blog.controller";
import { CommentController } from "./modules/comment/controllers/comment.controller";
import { DeviceController } from "./modules/device/controllers/device.controller";
import { PostController } from "./modules/post/controllers/post.controller";
import { UserController } from "./modules/user/controllers/user.controller";
import { LikeService } from "./modules/like/application/like.service";
import { LikeRepository } from "./modules/like/repositories/like.repository";


export const container = new Container();

container.bind(EmailExamples).toSelf().inSingletonScope;
container.bind(NodemailerService).toSelf().inSingletonScope;
container.bind(JwtService).toSelf().inSingletonScope;
container.bind(BcryptService).toSelf().inSingletonScope;

container.bind(UserQueryRepository).toSelf().inSingletonScope;
container.bind(UserRepository).toSelf().inSingletonScope;
container.bind(UserService).toSelf().inSingletonScope;

container.bind(PostQueryRepository).toSelf().inSingletonScope;
container.bind(PostRepository).toSelf().inSingletonScope;
container.bind(PostService).toSelf().inSingletonScope;

container.bind(DeviceQueryRepository).toSelf().inSingletonScope;
container.bind(DeviceRepository).toSelf().inSingletonScope;
container.bind(DeviceService).toSelf().inSingletonScope;

container.bind(CommentQueryRepository).toSelf().inSingletonScope;
container.bind(CommentRepository).toSelf().inSingletonScope;
container.bind(CommentService).toSelf().inSingletonScope;

container.bind(LikeService).toSelf().inSingletonScope;
container.bind(LikeRepository).toSelf().inSingletonScope;

container.bind(BlogQueryRepository).toSelf().inSingletonScope;
container.bind(BlogRepository).toSelf().inSingletonScope;
container.bind(BlogService).toSelf().inSingletonScope;

container.bind(AuthRepository).toSelf().inSingletonScope;
container.bind(AuthService).toSelf().inSingletonScope;

container.bind(AuthController).toSelf().inSingletonScope();
container.bind(BlogController).toSelf().inSingletonScope();
container.bind(CommentController).toSelf().inSingletonScope();
container.bind(DeviceController).toSelf().inSingletonScope();
container.bind(PostController).toSelf().inSingletonScope();
container.bind(UserController).toSelf().inSingletonScope();