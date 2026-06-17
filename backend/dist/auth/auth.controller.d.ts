import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        status: string;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                id: string;
                name: string;
                email: string;
            };
        };
    }>;
    login(dto: LoginDto): Promise<{
        status: string;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                id: string;
                name: string;
                email: string;
                avatar: string | null;
            };
        };
    }>;
    googleAuth(body: {
        name: string;
        email: string;
        avatar?: string;
    }): Promise<{
        status: string;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                id: string;
                name: string;
                email: string;
                avatar: string | null;
            };
        };
    }>;
    refresh(body: {
        refreshToken: string;
    }): Promise<{
        status: string;
        data: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    logout(): Promise<{
        status: string;
        data: {
            message: string;
        };
    }>;
}
