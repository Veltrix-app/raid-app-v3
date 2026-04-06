import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Stack, router } from "expo-router";

import Screen from "@/components/Screen";
import PrimaryButton from "@/components/PrimaryButton";
import SectionTitle from "@/components/SectionTitle";
import {
  avatarPresets,
  bannerPresets,
  factionOptions,
  titleOptions,
} from "@/data/mock";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";

export default function EditProfileScreen() {
  const { profile, updateProfile } = useAppState();

  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [title, setTitle] = useState(profile?.title || "");
  const [faction, setFaction] = useState(profile?.faction || "");
  const [avatar, setAvatar] = useState(profile?.avatar || "");
  const [banner, setBanner] = useState(profile?.banner || "");

  async function pickAvatarFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo access to upload an avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatar(result.assets[0].uri);
    }
  }

  async function pickBannerFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo access to upload a banner.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [16, 9],
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setBanner(result.assets[0].uri);
    }
  }

  function handleSave() {
    if (!username.trim()) {
      Alert.alert("Username required", "Please enter a username.");
      return;
    }

    updateProfile({
      username: username.trim(),
      bio: bio.trim(),
      title,
      faction,
      avatar,
      banner,
    });

    Alert.alert("Profile saved", "Your raider identity has been updated.");
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit Profile",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.bg },
          headerTintColor: COLORS.text,
        }}
      />

      <Screen>
        <View style={styles.previewCard}>
          <Image source={{ uri: banner }} style={styles.previewBanner} />

          <View style={styles.previewOverlay}>
            <Image source={{ uri: avatar }} style={styles.previewAvatar} />

            <View style={styles.previewTextWrap}>
              <Text style={styles.previewUsername}>
                {username || "Username"}
              </Text>

              {!!title && <Text style={styles.previewTitle}>{title}</Text>}
              {!!faction && <Text style={styles.previewFaction}>{faction}</Text>}
            </View>
          </View>
        </View>

        <SectionTitle
          title="Player Identity"
          subtitle="Customize how your account appears inside the app"
        />

        <View style={styles.block}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholder="Enter username"
            placeholderTextColor={COLORS.subtext}
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            style={[styles.input, styles.textarea]}
            placeholder="Tell people what kind of raider you are"
            placeholderTextColor={COLORS.subtext}
            multiline
          />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Current Avatar</Text>
          <Image source={{ uri: avatar }} style={styles.currentAvatar} />
          <PrimaryButton
            title="Upload Avatar"
            onPress={pickAvatarFromGallery}
            variant="secondary"
          />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Avatar Presets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.horizontalWrap}>
              {avatarPresets.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setAvatar(item)}
                  style={[
                    styles.avatarPresetWrap,
                    avatar === item && styles.selectedBorder,
                  ]}
                >
                  <Image source={{ uri: item }} style={styles.avatarPreset} />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Current Banner</Text>
          <Image source={{ uri: banner }} style={styles.currentBanner} />
          <PrimaryButton
            title="Upload Banner"
            onPress={pickBannerFromGallery}
            variant="secondary"
          />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Banner Presets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.horizontalWrap}>
              {bannerPresets.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setBanner(item)}
                  style={[
                    styles.bannerPresetWrap,
                    banner === item && styles.selectedBorder,
                  ]}
                >
                  <Image source={{ uri: item }} style={styles.bannerPreset} />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Title</Text>
          <View style={styles.chipWrap}>
            {titleOptions.map((item) => (
              <Pressable
                key={item}
                onPress={() => setTitle(item)}
                style={[styles.chip, title === item && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, title === item && styles.chipTextActive]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Faction</Text>
          <View style={styles.chipWrap}>
            {factionOptions.map((item) => (
              <Pressable
                key={item}
                onPress={() => setFaction(item)}
                style={[styles.chip, faction === item && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, faction === item && styles.chipTextActive]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <PrimaryButton title="Save Profile" onPress={handleSave} />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  previewCard: {
    height: 170,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },

  previewBanner: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  previewOverlay: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    padding: SPACING.lg,
    backgroundColor: "rgba(5,5,7,0.45)",
  },

  previewAvatar: {
    width: 72,
    height: 72,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.card2,
  },

  previewTextWrap: {
    marginLeft: 12,
    flex: 1,
  },

  previewUsername: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  previewTitle: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  previewFaction: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "600",
  },

  block: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },

  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },

  input: {
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 14,
  },

  textarea: {
    minHeight: 96,
    textAlignVertical: "top",
  },

  currentAvatar: {
    width: 84,
    height: 84,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  currentBanner: {
    width: "100%",
    height: 140,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card2,
  },

  horizontalWrap: {
    flexDirection: "row",
    gap: SPACING.md,
  },

  avatarPresetWrap: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 2,
  },

  avatarPreset: {
    width: 68,
    height: 68,
    borderRadius: 999,
  },

  bannerPresetWrap: {
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 2,
  },

  bannerPreset: {
    width: 180,
    height: 96,
    borderRadius: RADIUS.lg,
  },

  selectedBorder: {
    borderColor: COLORS.primary,
  },

  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  chip: {
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(198,255,0,0.10)",
  },

  chipText: {
    color: COLORS.subtext,
    fontSize: 12,
    fontWeight: "700",
  },

  chipTextActive: {
    color: COLORS.primary,
  },
});