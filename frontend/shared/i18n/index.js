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
import enClubHouse from './locales/en/clubHouse.json'
import enMasterPlan from './locales/en/masterPlan.json'
import enTimeLine from './locales/en/timeline.json'
import enConfiguration from './locales/en/configuration.json'
import enMyProperty from './locales/en/myProperty.json'
import enProject from './locales/en/project.json'
import enConstruction from './locales/en/construction.json'
import enFamilyGroup from './locales/en/FamilyGroup.json'
import enMyApartment from './locales/en/myApartment.json'
import enAgora from './locales/en/agora.json'
import enBuildings from './locales/en/buildings.json'
import enQuote from './locales/en/quote.json'
import enShare from './locales/en/share.json'
import enContracts from './locales/en/contracts.json'
import enTermsConditions from './locales/en/termsConditions.json' 
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
import esClubHouse from './locales/es/clubHouse.json'
import esMasterPlan from './locales/es/masterPlan.json'
import esTimeLine from './locales/es/timeline.json'
import esConfiguration from './locales/es/configuration.json'
import esMyProperty from './locales/es/myProperty.json'
import esProject from './locales/es/project.json'
import esConstruction from './locales/es/construction.json'
import esFamilyGroup from './locales/es/FamilyGroup.json'
import esMyApartment from './locales/es/myApartment.json'
import esAgora from './locales/es/agora.json'
import esBuildings from './locales/es/buildings.json'
import esQuote from './locales/es/quote.json'
import esShare from './locales/es/share.json'   
import esContracts from './locales/es/contracts.json'
import esTermsConditions from './locales/es/termsConditions.json'

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
                configuration: enConfiguration,
                myProperty: enMyProperty,
                project: enProject,
                construction: enConstruction,
                familyGroup: enFamilyGroup,
                myApartment: enMyApartment,
                agora: enAgora,
                buildings: enBuildings,
                quote: enQuote,
                share: enShare,
                contracts: enContracts,
                termsConditions: enTermsConditions
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
                properties: esProperty,
                analytics: esAnalytics,
                lots: esLots,
                propertySelection: esPropertySelection,
                residents: esResidents,
                models: esModels,
                payloads: esPayloads,
                clubHouse: esClubHouse,
                masterPlan: esMasterPlan,
                timeLine: esTimeLine,
                configuration: esConfiguration,
                myProperty: esMyProperty,
                project: esProject,
                construction: esConstruction,
                familyGroup: esFamilyGroup,
                myApartment: esMyApartment,
                agora: esAgora,
                buildings: esBuildings,
                quote: esQuote,
                share: esShare,
                contracts: esContracts,
                termsConditions: esTermsConditions
            },
        },
        fallbackLng: 'en',
        defaultNS: 'common',
        ns: [
            'common', 
            'auth', 
            'navigation', 
            'dashboard', 
            'property', 
            'amenities', 
            'news', 
            'profile', 
            'analytics', 
            'lots', 
            'propertySelection', 
            'residents', 
            'models', 
            'payloads', 
            'clubHouse', 
            'masterPlan', 
            'timeLine', 
            'configuration', 
            'myProperty', 
            'project', 
            'construction', 
            'familyGroup', 
            'myApartment', 
            'agora', 
            'buildings', 
            'quote',
            'share',
            'contracts',
            'termsConditions'
        ],
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        },
    })

export default i18n