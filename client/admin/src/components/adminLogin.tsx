import { useForm } from "react-hook-form";
import { Admin } from "../model/adminModel";
import { LoginCredentials } from "../model/loginModel"
import * as AdminApi from "../network/adminAPI";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import AdminInputField from "./form/adminInputFields";
import styles from "../components/adminLogin.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { UnauthorizedError } from "../errors/httpErrors";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface LoginModalProps {
    onDismiss: () => void,
    onLoginSuccessful: (admin: Admin, token: string) => void,
}

const LoginModal = ({ onDismiss, onLoginSuccessful }: LoginModalProps) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginCredentials>();

    const navigate = useNavigate();

    async function onSubmit(credentials: LoginCredentials) {
        try {
            const { admin, token } = await AdminApi.adminLogin(credentials);
            onLoginSuccessful(admin, token);
            localStorage.setItem('authToken', token);
            navigate("/beepcards");
            toast.success("Login successful!");
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                // Custom styling for error toast
                toast.error(error.message, {
                    position: "top-center",
                    autoClose: 5000, // 5 seconds
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } else {
                // Custom styling for unexpected error toast
                toast.error("Crendentials Incorrect", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
            console.error(error);
        }
    }

    useEffect(() => {
        // Clear all toasts on component unmount
        return () => toast.dismiss();
    }, []);

    return (
        <>
            <ToastContainer limit={3} />
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

                        <hr className="mt-3" style={{ borderTop: '1px solid #ddd', marginBottom: '15px' }} />

                        <div className="d-grid gap-2 mt-3 ">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn btn-primary"
                                style={{
                                    fontSize: '1rem',
                                    borderRadius: '8px',
                                    padding: '15px 32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center', // To horizontally center the content
                                }}
                            >
                                {isSubmitting && (
                                    <>
                                        <Spinner
                                            animation="border"
                                            variant="secondary"
                                            size="sm"
                                            className={`${styles.loadingcontainer}`}
                                        />
                                        <span className="ml-2">Logging In...</span>
                                    </>
                                )}
                                {!isSubmitting && 'Submit'}
                            </Button>
                        </div>
                    </div>
                </Form>
            </Modal>
        </>
    );
}

export default LoginModal;
