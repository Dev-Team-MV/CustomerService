import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Home as HomeIcon,
    Settings as SettingsIcon,
    Newspaper as NewspaperIcon,
    Apartment as ApartmentIcon,
    AccountBalance as AccountBalanceIcon,
    Map as MapIcon,
    MeetingRoom as MeetingRoomIcon,
    Group as GroupIcon
} from "@mui/icons-material"

export const privateMenuItems = [
    {
        textKey: "navigation:menu.dashboard",
        icon: DashboardIcon,
        path: "/dashboard",
        roles: ["superadmin", "admin", "user"],
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
        textKey: "navigation:menu.buildings",
        icon: ApartmentIcon,
        path: "/buildings",
        roles: ["superadmin", "admin"],
    },
    {
        textKey: "navigation:menu.myapartment",
        icon: MeetingRoomIcon,
        path: "/my-apartment",
        roles: ["superadmin", "admin", "user"],
    },
    {
        textKey: "navigation:menu.familyGroup",
        icon: GroupIcon,
        path: "/family-group",
        roles: ["superadmin", "admin", "user"],
    },
    {
        textKey: "navigation:menu.masterPlan",
        icon: MapIcon,
        path: "/master-plan",
        roles: ["superadmin", "admin"],
    },
    {
        textKey: "navigation:menu.payloads",
        icon: AccountBalanceIcon,
        path: "/payloads",
        roles: ["superadmin", "admin"],
    },
    {
        textKey: "navigation:menu.news",
        icon: NewspaperIcon,
        path: "/admin/news",
        roles: ["superadmin", "admin"],
    },
    {
        textKey: "navigation:menu.configuration",
        icon: SettingsIcon,
        path: "/configuration",
        roles: ["superadmin", "admin"],
    },
]

export const publicMenuItems = [
    { textKey: "navigation:menu.home", icon: HomeIcon, path: "/" },
    { textKey: "navigation:menu.news", icon: NewspaperIcon, path: "/explore/news" },
]