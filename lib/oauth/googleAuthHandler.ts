import authService from "@/services/auth.service";
import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { classifyAxiosError } from "../api/classifyAxiosError";

export const googleAuthHandler = async ({
  setLoading,
  setError,
}: {
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
}) => {
  try {
    setError(null);

    setLoading(true);
    const suceess = await GoogleSignin.hasPlayServices();
    console.log("success", suceess);
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response)) {
      const { idToken, user } = response.data;
      const { name, id, photo, email } = user;
      console.log("user", user);
      console.log("api here", idToken);

      await authService.googleAuth(idToken);
    }
  } catch (error) {
    console.log(error);
    console.log("Google Sign-In Error:", error);

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      setError("Sign in was cancelled");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      setError("Sign in is already in progress");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      setError("Play services not available");
    } else {
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
            console.log("Invalid request. Please check your input.");
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
    }
  } finally {
    setLoading(false);
  }
};
