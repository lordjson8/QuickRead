import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

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
      console.log("api here");
    }
  } catch (error: any) {
    console.log(error);
    console.log("Google Sign-In Error:", error);

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      setError("Sign in was cancelled");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      setError("Sign in is already in progress");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      setError("Play services not available");
    } else {
      setError("Something went wrong. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};
