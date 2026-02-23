import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// EN
import enCommon from './locales/en/common.json'
import enAuth from './locales/en/auth.json'
import enNavigation from './locales/en/navigation.json'
import enDashboard from './locales/en/dashboard.json'
import enProperty from './locales/en/property.json'
import enAmenities from './locales/en/amenities.json'
import enNews from './locales/en/news.json'
import enProfile from './locales/en/profile.json'
import enAnalytics from './locales/en/analytics.json'
import enLots from './locales/en/lots.json'
import enPropertySelection from './locales/en/propertySelection.json'
import enResidents from './locales/en/residents.json'
import enModels from './locales/en/models.json'
import enPayloads from './locales/en/payloads.json'
import enClubHouse from './locales/en/clubhouse.json'
import enMasterPlan from './locales/en/masterPlan.json'
import enTimeLine from './locales/en/timeLine.json'

// ES
import esCommon from './locales/es/common.json'
import esAuth from './locales/es/auth.json'
import esNavigation from './locales/es/navigation.json'
import esDashboard from './locales/es/dashboard.json'
import esProperty from './locales/es/property.json'
import esAmenities from './locales/es/amenities.json'
import esNews from './locales/es/news.json'
import esProfile from './locales/es/profile.json'
import esAnalytics from './locales/es/analytics.json'
import esLots from './locales/es/lots.json'
import esPropertySelection from './locales/es/propertySelection.json'
import esResidents from './locales/es/residents.json'
import esModels from './locales/es/models.json'
import esPayloads from './locales/es/payloads.json'
import esClubHouse from './locales/es/clubhouse.json'
import esMasterPlan from './locales/es/masterPlan.json'
import esTimeLine from './locales/es/timeLine.json'

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                common: enCommon,
                auth: enAuth,
                navigation: enNavigation,
                dashboard: enDashboard,
                property: enProperty,
                amenities: enAmenities,
                news: enNews,
                profile: enProfile,
                properties: enProperty,
                analytics: enAnalytics,
                lots: enLots,
                propertySelection: enPropertySelection,
                residents: enResidents,
                models: enModels,
                payloads: enPayloads,
                clubHouse: enClubHouse,
                masterPlan: enMasterPlan,
                timeLine: enTimeLine,
            },
            es: {
                common: esCommon,
                auth: esAuth,
                navigation: esNavigation,
                dashboard: esDashboard,
                property: esProperty,
                amenities: esAmenities,
                news: esNews,
                profile: esProfile,
                propertys: esProperty,
                analytics: esAnalytics,
                lots: esLots,
                propertySelection: esPropertySelection,
                residents: esResidents,
                models: esModels,
                payloads: esPayloads,
                clubHouse: esClubHouse,
                masterPlan: esMasterPlan,
                timeLine: esTimeLine,
            },
        },
        fallbackLng: 'en',
        defaultNS: 'common',
        ns: ['common', 'auth', 'navigation', 'dashboard', 'property', 'amenities', 'news', 'profile', 'analytics', 'lots', 'propertySelection', 'residents', 'models', 'payloads', 'clubHouse', 'masterPlan', 'timeLine'],
        interpolation: {
            escapeValue: false, // React already escapes
        },
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        },
    })

export default i18n
