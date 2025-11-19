import { Image } from "expo-image";
import { Platform, StyleSheet, View, Button, Text } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { makeRedirectUri, useAuthRequest, AuthSession } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

// --- Google Configuration ---
const googleAndroidClientId = "592514759965-ku1ur89br7os1copcaqpgiqpo547ctn1.apps.googleusercontent.com";
const googleWebClientId = "592514759965-u8djt882it06mqiiornalvovgskjt49k.apps.googleusercontent.com";

// --- Facebook Configuration ---
const facebookAppId = "4217772255145320";

// --- Redirect URI ---
// Using a custom scheme for native and localhost for web.
const redirectUri = makeRedirectUri({
  native: "quickread://",
  
  preferLocalhost: true,
});

export default function HomeScreen() {
  const [userInfo, setUserInfo] = useState(null);
  const [auth, setAuth] = useState(null);

  // --- Google Auth Hook ---
  const [googleRequest, googleResponse, promptGoogle] = Google.useAuthRequest({
    androidClientId: googleAndroidClientId,
    webClientId: googleWebClientId,
    redirectUri,
    scopes: ["profile", "email"],
  });

  // --- Facebook Auth Hook ---
  const [facebookRequest, facebookResponse, promptFacebook] = Facebook.useAuthRequest({
    clientId: facebookAppId,
    redirectUri,
    scopes: ["public_profile", "email"],
  });

  // --- Handle Google Auth Response ---
  useEffect(() => {
    if (googleResponse?.type === "success") {
      setAuth({ ...googleResponse.authentication, provider: 'google' });
    }
  }, [googleResponse]);

  // --- Handle Facebook Auth Response ---
  useEffect(() => {
    if (facebookResponse?.type === "success") {
      setAuth({ ...facebookResponse.authentication, provider: 'facebook' });
    }
  }, [facebookResponse]);

  // --- Fetch User Info ---
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (auth && auth.accessToken) {
        let fetchedUserInfo;
        if (auth.provider === 'google') {
          fetchedUserInfo = await fetchGoogleUserInfo(auth.accessToken);
        } else if (auth.provider === 'facebook') {
          fetchedUserInfo = await fetchFacebookUserInfo(auth.accessToken);
        }
        setUserInfo(fetchedUserInfo);
      }
    };
    fetchUserInfo();
  }, [auth]);

  const fetchGoogleUserInfo = async (token) => {
    try {
      const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await response.json();
      return { ...user, provider: 'google' };
    } catch (error) {
      console.error("Failed to fetch Google user info:", error);
      return null;
    }
  };

  const fetchFacebookUserInfo = async (token) => {
    try {
      const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${token}`);
      const user = await response.json();
      return { ...user, provider: 'facebook' };
    } catch (error) {
      console.error("Failed to fetch Facebook user info:", error);
      return null;
    }
  };

  // --- Logout ---
  const logout = async () => {
    if (auth && auth.accessToken) {
      // It's good practice to revoke the token on the provider side.
      if (userInfo?.provider === 'google') {
        await AuthSession.revokeAsync({
          token: auth.accessToken,
        }, Google.discovery);
      }
      // Facebook doesn't have a standard token revocation endpoint for this flow.
    }
    setAuth(null);
    setUserInfo(null);
  };

  return (
    <ThemedView style={styles.container}>
      {userInfo ? (
        <View style={styles.content}>
          <Image source={{ uri: userInfo.picture?.data?.url || userInfo.picture }} style={styles.profilePic} />
          <ThemedText type="title">Welcome, {userInfo.name}!</ThemedText>
          <ThemedText type="subtitle">{userInfo.email}</ThemedText>
          <View style={styles.separator} />
          <Button title="Logout" onPress={logout} color="#ff3b30" />
        </View>
      ) : (
        <View style={styles.content}>
            <ThemedText type="title">Welcome to QuickRead</ThemedText>
            <ThemedText style={styles.subtitle}>Please sign in to continue</ThemedText>
            <View style={styles.buttonContainer}>
                <Button
                    disabled={!googleRequest}
                    title="Sign in with Google"
                    onPress={() => promptGoogle({showInRecents: true})}
                    color="#4285F4"
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    disabled={!facebookRequest}
                    title="Sign in with Facebook"
                    onPress={() => promptFacebook({showInRecents: true})}
                    color="#1877F2"
                />
            </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderColor: '#ccc',
    borderWidth: 2,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
    backgroundColor: '#eee',
  },
});