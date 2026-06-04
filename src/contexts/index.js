/**
 * Contexts Index
 *
 * Exporta todos los contextos especializados para facilitar su importación.
 *
 * Migración gradual desde AppContext monolítico:
 * - useAuth()  → AuthContext  (isAuth, user, token)
 * - useData()  → DataContext  (points, profiles, selected_profile)
 * - useUI()    → UIContext    (loading, adminView)
 */

export { AuthContext, AuthProvider, useAuth } from './AuthContext';
export { DataContext, DataProvider, useData } from './DataContext';
