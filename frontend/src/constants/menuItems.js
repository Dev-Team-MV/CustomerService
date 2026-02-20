import {
  Dashboard as DashboardIcon,
  HomeWork as HomeWorkIcon,
  Landscape as LandscapeIcon,
  Home as HomeIcon,
  Payment as PaymentIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Article,
  Deck,
  Explore,
} from "@mui/icons-material";

export const privateMenuItems = [
  {
    textKey: "navigation:menu.dashboard",
    icon: DashboardIcon,
    path: "/dashboard",
    roles: ["superadmin", "admin", "user"],
  },
  {
    textKey: "navigation:menu.clubHouse",
    icon: Deck,
    path: "/clubhouse-manager",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.properties",
    icon: HomeWorkIcon,
    path: "/properties",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.lotInventory",
    icon: LandscapeIcon,
    path: "/lots",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.models",
    icon: HomeIcon,
    path: "/models",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.payloads",
    icon: PaymentIcon,
    path: "/payloads",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.residents",
    icon: PeopleIcon,
    path: "/residents",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.analytics",
    icon: BarChartIcon,
    path: "/analytics",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.news",
    icon: Article,
    path: "/news",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.myProperty",
    icon: HomeIcon,
    path: "/my-property",
    roles: ["superadmin", "admin", "user"],
  },
  {
    textKey: "navigation:menu.amenities",
    icon: Deck,
    path: "/amenities",
    roles: ["superadmin", "admin", "user"],
  },
  {
    textKey: "navigation:menu.masterPlanInventory",
    icon: LandscapeIcon,
    path: "/master-plan/inventory",
    roles: ["superadmin", "admin"],
  }
];

export const publicMenuItems = [
  { textKey: "navigation:menu.home", icon: HomeIcon, path: "/" },
  { textKey: "navigation:menu.news", icon: Article, path: "/explore/news" },
  { textKey: "navigation:menu.getYourQuote", icon: Explore, path: "/explore/properties" },
  { textKey: "navigation:menu.exploreAmenities", icon: Deck, path: "/explore/amenities" },
];