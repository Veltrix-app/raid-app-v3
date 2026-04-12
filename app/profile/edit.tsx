import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import Screen from "@/components/Screen";
import { useAuth } from "@/hooks/useAuth";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

export default function EditProfileScreen() {
  const { profile, updateProfile, loading } = useAuth();

  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [title, setTitle] = useState("");
  const [faction, setFaction] = useState("");
  const [bio, setBio] = useState("");
  const [wallet, setWallet] = useState("");

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setAvatarUrl(profile.avatarUrl);
      setBannerUrl(profile.bannerUrl);
      setTitle(profile.title);
      setFaction(profile.faction);
      setBio(profile.bio);
      setWallet(profile.wallet);
    }
  }, [profile]);

  async function handleSave() {
    const result = await updateProfile({
      username,
      avatarUrl,
      bannerUrl,
      title,
      faction,
      bio,
      wallet,
    });

    if (result.ok) {
      router.back();
    }
  }

  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.titleText}>Edit profile</Text>

        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor={COLORS.subtext}
          style={styles.input}
        />

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={COLORS.subtext}
          style={styles.input}
        />

        <TextInput
          value={faction}
          onChangeText={setFaction}
          placeholder="Faction"
          placeholderTextColor={COLORS.subtext}
          style={styles.input}
        />

        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Bio"
          placeholderTextColor={COLORS.subtext}
          style={[styles.input, styles.textarea]}
          multiline
        />

        <TextInput
          value={wallet}
          onChangeText={setWallet}
          placeholder="Wallet"
          placeholderTextColor={COLORS.subtext}
          style={styles.input}
        />

        <TextInput
          value={avatarUrl}
          onChangeText={setAvatarUrl}
          placeholder="Avatar URL"
          placeholderTextColor={COLORS.subtext}
          style={styles.input}
        />

        <TextInput
          value={bannerUrl}
          onChangeText={setBannerUrl}
          placeholder="Banner URL"
          placeholderTextColor={COLORS.subtext}
          style={styles.input}
        />

        <Pressable style={styles.btn} onPress={handleSave} disabled={loading}>
          <Text style={styles.btnText}>{loading ? "Saving..." : "Save Profile"}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
    marginTop: 30,
  },
  titleText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },
  input: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card2,
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: {
    color: "#050507",
    fontWeight: "800",
  },
});