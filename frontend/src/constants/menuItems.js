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
    text: "Dashboard",
    icon: DashboardIcon,
    path: "/dashboard",
    roles: ["superadmin", "admin", "user"],
  },
  {
    text: "Club House",
    icon: Deck,
    path: "/clubhouse-manager",
    roles: ["superadmin", "admin"],
  },
  {
    text: "Properties",
    icon: HomeWorkIcon,
    path: "/properties",
    roles: ["superadmin", "admin"],
  },
  {
    text: "Lot Inventory",
    icon: LandscapeIcon,
    path: "/lots",
    roles: ["superadmin", "admin"],
  },
  {
    text: "Models",
    icon: HomeIcon,
    path: "/models",
    roles: ["superadmin", "admin"],
  },
  {
    text: "Payloads",
    icon: PaymentIcon,
    path: "/payloads",
    roles: ["superadmin", "admin"],
  },
  {
    text: "Residents",
    icon: PeopleIcon,
    path: "/residents",
    roles: ["superadmin", "admin"],
  },
  {
    text: "Analytics",
    icon: BarChartIcon,
    path: "/analytics",
    roles: ["superadmin", "admin"],
  },
  {
    text: "News",
    icon: Article,
    path: "/news",
    roles: ["superadmin", "admin"],
  },
  {
    text: "My Property",
    icon: HomeIcon,
    path: "/my-property",
    roles: ["superadmin", "admin", "user"],
  },
  {
    text: "Amenities",
    icon: Deck,
    path: "/amenities",
    roles: ["superadmin", "admin", "user"],
  },
];

export const publicMenuItems = [
  { text: "Home", icon: HomeIcon, path: "/" },
  { text: "News", icon: Article, path: "/explore/news" },
  { text: "Get Your Quote", icon: Explore, path: "/explore/properties" },
  { text: "Explore Amenities", icon: Deck, path: "/explore/amenities" },
];