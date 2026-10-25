import type { ComponentType } from "react";
import type { IconName } from "../../components/app-artwork";

export type VirtualAppProps = Readonly<{ onHome: () => void }>;

/** Explicit local applications; OS actions and stores are not app dependencies. */
export type VirtualAppDefinition = Readonly<{
  id: string;
  displayName: string;
  icon: IconName;
  color: string;
  Component: ComponentType<VirtualAppProps>;
}>;
