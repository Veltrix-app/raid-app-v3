import React from "react";
import Screen from "@/components/Screen";
import SectionTitle from "@/components/SectionTitle";
import RaidCard from "@/components/RaidCard";
import LiveScreenState from "@/components/LiveScreenState";
import { useLiveAppData } from "@/hooks/useLiveAppData";

export default function RaidsScreen() {
  const { raids, loading, error } = useLiveAppData();

  return (
    <Screen>
      <SectionTitle
        title="Raids"
        subtitle="Live actions your community can complete right now"
      />

      <LiveScreenState loading={loading} error={error} />

      {raids.map((item) => (
        <RaidCard key={item.id} item={item} />
      ))}
    </Screen>
  );
}