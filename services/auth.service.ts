import api from "./api.service";

class AuthServices {
  async login(payload: { email: string; password: string }) {
    const response = await api.post("/auth/login/", payload);
    return response;
  }

  async register(payload: {
    email: string;
    first_name: string;
    password: string;
  }) {
    const response = await api.post("/auth/register/", payload);
    return response;
  }

  async resendOTP(user_id) {
    const response = await api.post("/auth/resend-email-otp/",{user_id})
    return response;
  }

  async sendOTP(payload : {user_id: string,otp_code: string}) {
     const response = await api.post("/auth/verify-email/",payload)
    return response;
  }

  async googleAuth(id_token) {
    const response = await api.post('/auth/google-auth/',{id_token});
    return response
  }

}

export default new AuthServices();
