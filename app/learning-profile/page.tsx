import type { Metadata } from "next";
import { LearningProfilePage } from "@/components/learning-profile-page";

export const metadata: Metadata = {
  title: "Learning profile | LearnPath AI",
  description: "Privately analyze your ChatGPT export to personalize how LearnPath teaches you.",
};

export default function ProfilePage() {
  return <LearningProfilePage />;
}
