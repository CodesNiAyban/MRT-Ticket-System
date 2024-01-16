import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useForm } from "react-hook-form";
import { Admin } from "../model/adminModel";
import { LoginCredentials } from "../model/loginModel"
import * as AdminApi from "../network/adminAPI";
import { useEffect, useState } from 'react';
import * as adminApi from "../network/adminAPI";
import { CircularProgress } from '@mui/material';
import { useNavigate } from "react-router-dom";


function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit">
                Online MRT
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}errors
        </Typography>
    );
}



export default function SignIn() {
    const [loggedInAdmin, setLoggedInAdmin] = useState<Admin | null>(null);
    const { handleSubmit, formState: { errors, isSubmitting }, register } = useForm<LoginCredentials>();
    const navigate = useNavigate();

    async function onSubmit(credentials: LoginCredentials) {
        try {
            // Assume AdminApi.adminLogin returns the authenticated admin object
            const admin = await AdminApi.adminLogin(credentials);

            // Check if the authentication is successful
            if (admin) {
                setLoggedInAdmin(admin);
                navigate("/app");
            } else {
                // Handle authentication failure
                alert("Invalid username or password");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred during authentication");
        }
    }

    useEffect(() => {
        async function fetchLoggedInAdmin() {
            try {
                const admin = await adminApi.getLoggedInAdmin();
                setLoggedInAdmin(admin);
            } catch (error) {
                console.error(error);
                alert(error);
            }
        }
        fetchLoggedInAdmin();
    }, []);


    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        autoComplete="username"
                        autoFocus
                        aria-required
                        error={!errors.username}
                        {...register("username")} // Register the input for react-hook-form
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        aria-required
                        error={!errors.password}
                        {...register("password")} // Register the input for react-hook-form
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                </Box>
            </Box>
            <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
    );
}