import {
  Dashboard as DashboardIcon,
  HomeWork as HomeWorkIcon,
  Landscape as LandscapeIcon,
  Home as HomeIcon,
  Payment as PaymentIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Article as ArticleIcon,
  Deck as DeckIcon,
  Explore as ExploreIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Villa as VillaIcon,
  Map as MapIcon,
  Groups as GroupsIcon,
  Pool as PoolIcon,
} from "@mui/icons-material"

export const privateMenuItems = [
  {
    textKey: "navigation:menu.dashboard",
    icon: DashboardIcon,
    path: "/dashboard",
    roles: ["superadmin", "admin", "user"],
  },
  {
    textKey: "navigation:menu.clubHouse",
    icon: DeckIcon,
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
    icon: VillaIcon,
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
    icon: ArticleIcon,
    path: "/admin/news",
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
    icon: PoolIcon,
    path: "/amenities",
    roles: ["superadmin", "admin", "user"],
  },
  {
    textKey: "navigation:menu.masterPlanInventory",
    icon: MapIcon,
    path: "/master-plan/inventory",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.timeline",
    icon: TimelineIcon,
    path: "/timeline",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.configuration",
    icon: SettingsIcon,
    path: "/configurations",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.familyGroup",
    icon: GroupsIcon,
    path: "/family-group",
    roles: ["superadmin", "admin", "user"],
  }
]

export const publicMenuItems = [
  { textKey: "navigation:menu.home", icon: HomeIcon, path: "/" },
  { textKey: "navigation:menu.news", icon: ArticleIcon, path: "/explore/news" },
  { textKey: "navigation:menu.getYourQuote", icon: ExploreIcon, path: "/explore/properties" },
  { textKey: "navigation:menu.exploreAmenities", icon: PoolIcon, path: "/explore/amenities" },
]