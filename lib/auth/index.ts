import authService from "@/services/auth.service";
import { classifyAxiosError } from "../api/classifyAxiosError";
import { router } from "expo-router";

export const signUpUser = async ({
  setLoading,
  setError,
  setValidationError,
  data,
}: {
  data: any;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  setValidationError: (value: any | null) => void;
}) => {
  try {
    setLoading(true);
    setError(null);
    setValidationError(null);
    const response = await authService.register(data);
    console.log(response.data);

    router.push({
      pathname: "/(auth)/confirm-otp",
      params: {
        user_id: response.data.data.user_id,
        email: response.data.data.email,
        email_mask: response.data.data.email_mask,
        otp_expiry_minutes: response.data.data.otp_expiry_minutes,
      },
    });
  } catch (error: any) {
    const classifiedError = classifyAxiosError(error);

    switch (classifiedError.type) {
      case "network":
        setError("Network error. Please check your internet connection.");
        break;
      case "timeout":
        setError("Request timed out. Please try again.");
        break;
      case "http":
        if (classifiedError.status === 400) {
          setError("Invalid request. Please check your input.");
          setValidationError(classifiedError.data.error.details);
        } else if (classifiedError.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(
            classifiedError.message || "An error occurred. Please try again.",
          );
        }
        break;
      default:
        setError("An unknown error occurred. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

export const loginUser = async ({
  setLoading,
  setError,
  data,
}: {
  data: any;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
}) => {
  try {
    setLoading(true);
    const response = await authService.login(data);
    
  } catch (error) {
    const classifiedError = classifyAxiosError(error);

    switch (classifiedError.type) {
      case "network":
        setError("Network error. Please check your internet connection.");
        break;
      case "timeout":
        setError("Request timed out. Please try again.");
        break;
      case "http":
        if (classifiedError.status === 400) {
          setError("Invalid credentials try again");
        } else if (
          error.status === 403 &&
          error.response.data.error_code === "ACCOUNT_NOT_VERIFIED"
        ) {
          console.log(JSON.stringify(error.response.data.data));

          router.push({
            pathname: "/(auth)/confirm-otp",
            params: {
              user_id: classifiedError.data.user_id,
              email: classifiedError.data.email,
              email_mask: classifiedError.data.email_masked,
              otp_expiry_minutes: classifiedError.data.otp_expiry_minutes,
            },
          });
        } else if (classifiedError.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(
            classifiedError.message || "An error occurred. Please try again.",
          );
        }
        break;
      default:
        setError("An unknown error occurred. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};
