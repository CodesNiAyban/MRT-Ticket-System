export interface LoginCredentials {
    admin: Admin
    token: string
}

export interface Admin {
    username: string
    password: string
}