import { useForm } from "react-hook-form";
import { Admin } from "../model/adminModel";
import { LoginCredentials } from "../model/loginModel"
import * as AdminApi from "../network/adminAPI";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import AdminInputField from "./form/adminInputFields";
import styles from "../components/adminLogin.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { UnauthorizedError } from "../errors/httpErrors";

interface LoginModalProps {
    onDismiss: () => void,
    onLoginSuccessful: (admin: Admin, token: string) => void,
}

const LoginModal = ({ onDismiss, onLoginSuccessful }: LoginModalProps) => {
    const [errorText, setErrorText] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginCredentials>();

    const navigate = useNavigate();

    async function onSubmit(credentials: LoginCredentials) {
        try {
            const { admin, token } = await AdminApi.adminLogin(credentials);
            onLoginSuccessful(admin, token);
            localStorage.setItem('authToken', token);
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

    useEffect(() => {
        if (errorText) {
            const timeoutId = setTimeout(() => {
                setErrorText(null);
            }, 2000);

            return () => clearTimeout(timeoutId);
        }
    }, [errorText]);

    return (
        <Modal
            show
            onHide={onDismiss}
            centered
            className={styles["Auth-form-container"]}
            style={{ borderRadius: '12px', backgroundColor: 'white' }}  // Set the background color here
        >
            <Form className={styles["Auth-form"]} onSubmit={handleSubmit(onSubmit)}>
                <div className={styles["Auth-form-content"]}>
                    <h2 className={styles["Auth-form-title"]}>Admin Login</h2>

                    {errorText && (
                        <Alert variant="danger" style={{ position: 'absolute', top: '150px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
                            {errorText}
                        </Alert>
                    )}

                    <AdminInputField
                        name="username"
                        label="Username"
                        type="text"
                        placeholder="Enter your username"
                        register={register}
                        registerOptions={{ required: "Required" }}
                        errors={errors.admin?.username}
                        className="form-group mt-3"
                    />

                    <AdminInputField
                        name="password"
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        register={register}
                        registerOptions={{ required: "Required" }}
                        errors={errors.admin?.password}
                        className="form-group mt-3"
                    />

                    {/* Line below Password */}
                    <hr className="mt-3" style={{ borderTop: '1px solid #ddd', marginBottom: '15px' }} />

                    <div className="d-grid gap-2 mt-3 ">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary"
                            style={{ fontSize: '1rem', borderRadius: '8px' }}
                        >
                            LOG IN
                        </Button>
                    </div>
                </div>
            </Form>
        </Modal>
    );
}

export default LoginModal;
