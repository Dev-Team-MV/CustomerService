import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  BarChart as BarChartIcon,
    Settings as Settings,
} from "@mui/icons-material"

export const privateMenuItems = [
  {
    textKey: "navigation:menu.dashboard",
    icon: DashboardIcon,
    path: "/dashboard",
    roles: ["superadmin", "admin", "user"],
  },
  {
    textKey: "navigation:menu.buildings",
    icon: HomeIcon,
    path: "/buildings",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.properties",
    icon: HomeIcon,
    path: "/properties",
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
    textKey: "navigation:menu.configuration",
    icon: Settings,
    path: "/configuration",
    roles: ["superadmin", "admin"],
  },
  
]

export const publicMenuItems = [
  { textKey: "navigation:menu.home", icon: HomeIcon, path: "/" },
]