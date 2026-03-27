export type DashboardThemeId = "arctic" | "ember" | "verdant";

export interface DashboardThemeOption {
  id: DashboardThemeId;
  label: string;
  description: string;
}

export const DEFAULT_DASHBOARD_THEME_ID: DashboardThemeId = "arctic";

export const DASHBOARD_THEME_OPTIONS: DashboardThemeOption[] = [
  {
    id: "arctic",
    label: "Arctic",
    description: "Cool cyan command palette with electric blue depth.",
  },
  {
    id: "ember",
    label: "Ember",
    description: "Amber and crimson dashboard theme tuned for high-alert operations.",
  },
  {
    id: "verdant",
    label: "Verdant",
    description: "Green surveillance palette with calmer field-monitoring contrast.",
  },
];

export function isDashboardThemeId(value: string | null | undefined): value is DashboardThemeId {
  return DASHBOARD_THEME_OPTIONS.some((theme) => theme.id === value);
}
