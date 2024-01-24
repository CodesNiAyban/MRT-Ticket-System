import { useForm } from "react-hook-form";
import { Admin } from "../model/adminModel";
import { LoginCredentials } from "../model/loginModel"
import * as AdminApi from "../network/adminAPI";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import AdminInputField from "./form/adminInputFields";
import styleUtils from "../styles/utils.module.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { UnauthorizedError } from "../errors/httpErrors";
import jwt from "jsonwebtoken";

interface LoginModalProps {
    onDismiss: () => void,
    onLoginSuccessful: (admin: Admin, token: string) => void,
}

const LoginModal = ({ onDismiss, onLoginSuccessful }: LoginModalProps) => {

    const [errorText, setErrorText] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginCredentials>();

    const navigate = useNavigate();

    // Inside LoginModal.tsx

    async function onSubmit(credentials: LoginCredentials) {
        try {
            const { admin, token } = await AdminApi.adminLogin(credentials);

            // Store token in local storage
            localStorage.setItem('authToken', token);

            // Set up a function to check token expiration
            const checkTokenExpiration = () => {
                const storedToken = localStorage.getItem('authToken');
                if (!storedToken) {
                    // Token is not present, log the user out
                    onLogout();
                } else {
                    try {
                        const decodedToken = jwt.decode(storedToken) as { exp: number };
                        if (decodedToken.exp * 1000 < Date.now()) {
                            // Token is expired, log the user out
                            onLogout();
                        }
                    } catch (error) {
                        // Error decoding token, log the user out
                        onLogout();
                    }
                }
            };

            // Check token expiration initially
            checkTokenExpiration();

            // Set up an interval to periodically check token expiration
            setInterval(checkTokenExpiration, 60000); // Check every minute

            // Call the success callback
            onLoginSuccessful(admin, token);

            // Navigate to the desired page
            navigate("/stations");
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                setErrorText(error.message);
            } else {
                alert(error);
            }
            console.error(error);
        }
    }

    // Function to log out and clear the local storage
    const onLogout = () => {
        localStorage.removeItem('authToken');
        // Additional cleanup logic if needed
        // ...
        // Redirect to the login page or do other actions as required
        navigate("/");
    };


    return (
        <Modal show onHide={onDismiss}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Log In
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {errorText &&
                    <Alert variant="danger">
                        {errorText}
                    </Alert>
                }
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <AdminInputField
                        name="username"
                        label="Username"
                        type="text"
                        placeholder="Username"
                        register={register}
                        registerOptions={{ required: "Required" }}
                        errors={errors.admin?.username}
                    />
                    <AdminInputField
                        name="password"
                        label="Password"
                        type="password"
                        placeholder="Password"
                        register={register}
                        registerOptions={{ required: "Required" }}
                        errors={errors.admin?.password}
                    />
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className={styleUtils.width100}>
                        Log In
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default LoginModal;