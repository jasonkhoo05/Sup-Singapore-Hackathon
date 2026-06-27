import type { Metadata } from "next";
import { LearnPathApp } from "@/components/learnpath-app";

export const metadata: Metadata = {
  title: "Recursion · FIT1008 | LearnPath AI",
  description: "An adaptive FIT1008 lesson explaining recursion through factorial call stacks.",
};

export default function RecursionPage() {
  return <LearnPathApp />;
}
