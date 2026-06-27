import type { Metadata } from "next";
import { BiologyLesson } from "@/components/biology-lesson";

export const metadata: Metadata = {
  title: "Digestion · BIO2026 | LearnPath AI",
  description: "An adaptive biology lesson following food through the human digestive system.",
};

export default function DigestionPage() {
  return <BiologyLesson />;
}
