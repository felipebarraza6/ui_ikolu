/**
 * Feature flags esperados en el objeto `user` que devuelve la API
 * (login / users/{username}/). Reemplazan id===34 y usernames hardcodeados.
 *
 * Campos booleanos esperados en el perfil de usuario:
 * - show_aggregated_control_center: Centro de Control agregado (antes user.id===34)
 * - show_umi_prototype: vista PrototypeUmi + menú Registros PTI (antes username==="arrocerospti")
 * - show_form_multi_data: acceso a /form-multi-data Cert B (antes username==="demosmart")
 * - hide_analysis_nav: oculta Smart Análisis / DGA análisis en sider (antes arrocerospti|lecheriavalleverde)
 *
 * También se respeta `is_staff` donde ya se usa (admin, drawers).
 */

export const showAggregatedControlCenter = (user) =>
  Boolean(user?.show_aggregated_control_center);

export const showUmiPrototype = (user) => Boolean(user?.show_umi_prototype);

export const showFormMultiData = (user) => Boolean(user?.show_form_multi_data);

export const hideAnalysisNav = (user) => Boolean(user?.hide_analysis_nav);
