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

interface LoginModalProps {
    onDismiss: () => void,
    onLoginSuccessful: (admin: Admin) => void,
}

const LoginModal = ({ onDismiss, onLoginSuccessful }: LoginModalProps) => {

    const [errorText, setErrorText] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginCredentials>();

    const navigate = useNavigate();

    async function onSubmit(credentials: LoginCredentials) {
        try {
            const admin = await AdminApi.adminLogin(credentials);
            onLoginSuccessful(admin);
            navigate("/stations");
        } catch (error) {
            if(error instanceof UnauthorizedError) {
                setErrorText(error.message)
            } else {
                alert(error);
            }
            console.error(error);
        }
    }

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
                        error={errors.username}
                    />
                    <AdminInputField
                        name="password"
                        label="Password"
                        type="password"
                        placeholder="Password"
                        register={register}
                        registerOptions={{ required: "Required" }}
                        error={errors.password}
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